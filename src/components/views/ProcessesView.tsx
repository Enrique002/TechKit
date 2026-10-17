import React, { useState, useEffect } from 'react';
import { ProcessInfo } from '../../types';
import { processService } from '../../services/processService';
import { formatBytes } from '../../services/systemService';
import { RefreshCw, Search, ShieldAlert, AlertTriangle, Info, X } from 'lucide-react';

interface ProcessesViewProps {
  onNavigateToNetworkWithPid?: (pid: number) => void;
  initialPidFilter?: number | null;
}

export const ProcessesView: React.FC<ProcessesViewProps> = ({
  onNavigateToNetworkWithPid,
  initialPidFilter,
}) => {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>(initialPidFilter ? initialPidFilter.toString() : '');
  const [filterType, setFilterType] = useState<'all' | 'user' | 'system'>('all');
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name' | 'pid'>('cpu');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // Selection & Modal State
  const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(null);
  const [killConfirmProcess, setKillConfirmProcess] = useState<ProcessInfo | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const fetchProcesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await processService.getProcesses();
      setProcesses(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError('No se pudieron obtener los procesos activos del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  useEffect(() => {
    if (initialPidFilter) {
      setSearchTerm(initialPidFilter.toString());
    }
  }, [initialPidFilter]);

  // Interval timer for auto-refresh
  useEffect(() => {
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(async () => {
        try {
          const data = await processService.getProcesses();
          setProcesses(data);
          setLastUpdated(new Date().toLocaleTimeString());
        } catch (e) {
          // Keep silent on background refresh errors
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleSort = (field: 'cpu' | 'memory' | 'name' | 'pid') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'name' || field === 'pid' ? 'asc' : 'desc');
    }
  };

  const handleConfirmKill = async () => {
    if (!killConfirmProcess) return;
    setIsActionLoading(true);
    setActionMessage(null);

    const res = await processService.killProcess(killConfirmProcess.pid);
    setIsActionLoading(false);

    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
      setKillConfirmProcess(null);
      if (selectedProcess?.pid === killConfirmProcess.pid) {
        setSelectedProcess(null);
      }
      fetchProcesses();
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }
  };

  const filteredProcesses = processes
    .filter((p) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        p.name.toLowerCase().includes(query) ||
        p.pid.toString().includes(query) ||
        p.exePath.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filterType === 'user') return !p.isCritical && !p.user.includes('SYSTEM');
      if (filterType === 'system') return p.isCritical || p.user.includes('SYSTEM');

      return true;
    })
    .sort((a, b) => {
      let compA: any = a[sortBy === 'cpu' ? 'cpuUsagePercentage' : sortBy === 'memory' ? 'memoryBytes' : sortBy];
      let compB: any = b[sortBy === 'cpu' ? 'cpuUsagePercentage' : sortBy === 'memory' ? 'memoryBytes' : sortBy];

      if (typeof compA === 'string') {
        compA = compA.toLowerCase();
        compB = compB.toLowerCase();
      }

      if (compA < compB) return sortOrder === 'asc' ? -1 : 1;
      if (compA > compB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="card-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Gestor de Procesos en Ejecución</span>
            <span className="badge badge-info">{processes.length} Activos</span>
          </h3>
          <p className="card-desc">
            Consultar procesos del sistema, uso de CPU, consumo de RAM y finalización segura.
            {lastUpdated && ` (Última actualización: ${lastUpdated})`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresco (3s)
          </label>

          <button
            className="btn btn-secondary"
            onClick={fetchProcesses}
            disabled={loading}
            title="Actualizar lista de procesos"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionMessage.text}</span>
          <button className="btn-icon" onClick={() => setActionMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Toolbar: Search, Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '32px', width: '100%' }}
            placeholder="Buscar por Nombre, PID o Ruta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setFilterType('all')}
          >
            Todos
          </button>
          <button
            className={`btn ${filterType === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setFilterType('user')}
          >
            De Usuario
          </button>
          <button
            className={`btn ${filterType === 'system' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setFilterType('system')}
          >
            Del Sistema
          </button>
        </div>
      </div>

      {/* Process Table */}
      {loading && processes.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', opacity: 0.7 }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '8px' }} />
          <p>Obteniendo lista de procesos de Windows...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : filteredProcesses.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', opacity: 0.7, border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
          No se encontraron procesos que coincidan con los criterios de búsqueda.
        </div>
      ) : (
        <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Nombre del Proceso {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('pid')} style={{ cursor: 'pointer', width: '80px' }}>
                  PID {sortBy === 'pid' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('cpu')} style={{ cursor: 'pointer', width: '90px' }}>
                  CPU % {sortBy === 'cpu' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('memory')} style={{ cursor: 'pointer', width: '110px' }}>
                  Memoria {sortBy === 'memory' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Usuario</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((p) => (
                <tr
                  key={p.pid}
                  style={{
                    backgroundColor: selectedProcess?.pid === p.pid ? 'var(--hover-bg)' : undefined,
                  }}
                >
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{p.name}</span>
                      {p.isCritical && (
                        <span className="badge badge-warning" style={{ fontSize: '10px' }} title="Proceso crítico del sistema">
                          Protegido
                        </span>
                      )}
                    </div>
                  </td>
                  <td><code>{p.pid}</code></td>
                  <td>
                    <span style={{ color: p.cpuUsagePercentage > 20 ? 'var(--warning-color)' : 'inherit' }}>
                      {p.cpuUsagePercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td>{formatBytes(p.memoryBytes)}</td>
                  <td style={{ fontSize: '12px', opacity: 0.8 }}>{p.user}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setSelectedProcess(p)}
                        title="Ver detalles del proceso"
                      >
                        <Info size={12} />
                        Detalles
                      </button>

                      {onNavigateToNetworkWithPid && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => onNavigateToNetworkWithPid(p.pid)}
                          title="Ver conexiones de red de este PID"
                        >
                          Red
                        </button>
                      )}

                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        disabled={p.isCritical || p.pid <= 4}
                        onClick={() => setKillConfirmProcess(p)}
                        title={p.isCritical ? 'No se puede finalizar un proceso crítico de Windows' : 'Finalizar proceso'}
                      >
                        Finalizar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Details Process */}
      {selectedProcess && (
        <div className="modal-overlay" onClick={() => setSelectedProcess(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Detalles del Proceso: {selectedProcess.name}</h3>
              <button className="btn-icon" onClick={() => setSelectedProcess(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                <div><strong>PID:</strong> <code>{selectedProcess.pid}</code></div>
                <div><strong>Estado:</strong> {selectedProcess.status}</div>
                <div><strong>Uso de CPU:</strong> {selectedProcess.cpuUsagePercentage}%</div>
                <div><strong>Uso Memoria:</strong> {formatBytes(selectedProcess.memoryBytes)}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Propietario / Usuario:</strong> {selectedProcess.user}
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '13px' }}>Ruta del Ejecutable:</strong>
                <div
                  style={{
                    backgroundColor: 'var(--bg-card-alt)',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{selectedProcess.exePath}</span>
                  {selectedProcess.exePath.includes('\\') && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '2px 6px', fontSize: '10px' }}
                      onClick={() => navigator.clipboard.writeText(selectedProcess.exePath)}
                    >
                      Copiar
                    </button>
                  )}
                </div>
              </div>

              {selectedProcess.isCritical && (
                <div className="alert alert-warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} />
                  <span>Este proceso es vital para el funcionamiento del sistema operativo y no permite finalización.</span>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              {onNavigateToNetworkWithPid && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const pid = selectedProcess.pid;
                    setSelectedProcess(null);
                    onNavigateToNetworkWithPid(pid);
                  }}
                >
                  Ver Conexiones de Red
                </button>
              )}

              <button className="btn btn-secondary" onClick={() => setSelectedProcess(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Kill Process */}
      {killConfirmProcess && (
        <div className="modal-overlay" onClick={() => setKillConfirmProcess(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} />
                Confirmación: Finalizar Proceso
              </h3>
              <button className="btn-icon" onClick={() => setKillConfirmProcess(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                ¿Estás seguro de que deseas solicitar la finalización del proceso <strong>{killConfirmProcess.name}</strong> (PID <code>{killConfirmProcess.pid}</code>)?
              </p>

              <div className="alert alert-error" style={{ fontSize: '12px' }}>
                <strong>Advertencia:</strong> Cerrar un proceso de forma forzada puede provocar la pérdida de datos no guardados o inestabilidad en las aplicaciones dependientes.
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setKillConfirmProcess(null)} disabled={isActionLoading}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleConfirmKill} disabled={isActionLoading}>
                {isActionLoading ? 'Finalizando...' : 'Sí, Finalizar Proceso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
