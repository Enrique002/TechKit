import React, { useState, useEffect, useMemo } from 'react';
import { ProcessInfo } from '../../types';
import { processService } from '../../services/processService';
import { formatBytes } from '../../services/systemService';
import {
  RefreshCw,
  Search,
  ShieldAlert,
  AlertTriangle,
  Info,
  X,
  Copy,
  Download,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface ProcessesViewProps {
  onNavigateToNetworkWithPid?: (pid: number) => void;
  initialPidFilter?: number | null;
}

export const ProcessesView: React.FC<ProcessesViewProps> = ({
  initialPidFilter,
}) => {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>(initialPidFilter ? initialPidFilter.toString() : '');
  const [filterType, setFilterType] = useState<'all' | 'high_resource' | 'user' | 'system'>('all');
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name' | 'pid' | 'threads'>('cpu');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // Selection & Modal State
  const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(null);
  const [killConfirmProcess, setKillConfirmProcess] = useState<ProcessInfo | null>(null);
  const [killTreeConfirmProcess, setKillTreeConfirmProcess] = useState<ProcessInfo | null>(null);
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

  const handleSort = (field: 'cpu' | 'memory' | 'name' | 'pid' | 'threads') => {
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

  const handleConfirmKillTree = async () => {
    if (!killTreeConfirmProcess) return;
    setIsActionLoading(true);
    setActionMessage(null);

    const res = await processService.killProcessTree(killTreeConfirmProcess.pid);
    setIsActionLoading(false);

    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
      setKillTreeConfirmProcess(null);
      if (selectedProcess?.pid === killTreeConfirmProcess.pid) {
        setSelectedProcess(null);
      }
      fetchProcesses();
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }
  };

  const handleCopyProcessInfo = (p: ProcessInfo) => {
    const text = `Nombre: ${p.name}\nPID: ${p.pid}\nPPID: ${p.ppid || 'N/D'}\nCPU: ${p.cpuUsagePercentage}%\nRAM: ${formatBytes(p.memoryBytes)}\nUsuario: ${p.user}\nRuta: ${p.exePath}\nEstado: ${p.status}`;
    navigator.clipboard.writeText(text);
    setActionMessage({ type: 'success', text: `Información del proceso PID ${p.pid} copiada al portapapeles.` });
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'PID', 'PPID', 'CPU %', 'Memoria (Bytes)', 'Usuario', 'Estado', 'Ruta'];
    const rows = filteredProcesses.map((p) => [
      `"${p.name}"`,
      p.pid,
      p.ppid || '',
      p.cpuUsagePercentage,
      p.memoryBytes,
      `"${p.user}"`,
      `"${p.status}"`,
      `"${p.exePath}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `techkit_procesos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearchWebProcess = (processName: string) => {
    const query = encodeURIComponent(`que es el proceso ${processName} windows`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
  };

  // Lift query formatting out of iteration loop and wrap filtered/sorted list in useMemo
  // to avoid O(N log N) re-sorting and string loworcasing on every render pass.
  const filteredProcesses = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return processes
      .filter((p) => {
        const matchesSearch =
          query === '' ||
          p.name.toLowerCase().includes(query) ||
          p.pid.toString().includes(query) ||
          p.user.toLowerCase().includes(query) ||
          p.exePath.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        if (filterType === 'high_resource') return p.cpuUsagePercentage > 15 || p.memoryBytes > 300 * 1024 * 1024;
        if (filterType === 'user') return !p.isCritical && !p.user.includes('SYSTEM');
        if (filterType === 'system') return p.isCritical || p.user.includes('SYSTEM');

        return true;
      })
      .sort((a, b) => {
        let compA: any = a[sortBy === 'cpu' ? 'cpuUsagePercentage' : sortBy === 'memory' ? 'memoryBytes' : sortBy === 'threads' ? 'threadsCount' : sortBy];
        let compB: any = b[sortBy === 'cpu' ? 'cpuUsagePercentage' : sortBy === 'memory' ? 'memoryBytes' : sortBy === 'threads' ? 'threadsCount' : sortBy];

        if (typeof compA === 'string') {
          compA = compA.toLowerCase();
          compB = compB.toLowerCase();
        }

        if (compA < compB) return sortOrder === 'asc' ? -1 : 1;
        if (compA > compB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [processes, searchTerm, filterType, sortBy, sortOrder]);

  return (
    <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Administrador de Tareas — Vista de Procesos</span>
            <span className="tag-badge tag-native">{processes.length} Activos</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Búsqueda, ordenación, árbol de procesos y acciones de diagnóstico avanzadas.
            {lastUpdated && ` (Última actualización: ${lastUpdated})`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={handleExportCSV} style={{ fontSize: '12px' }}>
            <Download size={14} /> Exportar CSV
          </button>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresco (3s)
          </label>

          <button
            className="btn-secondary"
            onClick={fetchProcesses}
            disabled={loading}
            title="Actualizar lista de procesos"
            style={{ fontSize: '12px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className="info-box"
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: actionMessage.type === 'success' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
            borderColor: actionMessage.type === 'success' ? '#52c41a' : '#ff4d4f',
            color: actionMessage.type === 'success' ? '#52c41a' : '#ff4d4f',
          }}
        >
          <span>{actionMessage.text}</span>
          <button className="icon-btn" onClick={() => setActionMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Toolbar: Search, Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="hero-search-input"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
            placeholder="Buscar por Nombre, PID, Usuario o Ruta del ejecutable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`btn-secondary ${filterType === 'all' ? 'active' : ''}`}
            style={{ fontSize: '12px' }}
            onClick={() => setFilterType('all')}
          >
            Todos
          </button>

          <button
            className={`btn-secondary ${filterType === 'high_resource' ? 'active' : ''}`}
            style={{ fontSize: '12px', color: filterType === 'high_resource' ? '#ff4d4f' : 'inherit' }}
            onClick={() => setFilterType('high_resource')}
          >
            <Zap size={12} /> Alto Consumo
          </button>

          <button
            className={`btn-secondary ${filterType === 'user' ? 'active' : ''}`}
            style={{ fontSize: '12px' }}
            onClick={() => setFilterType('user')}
          >
            De Usuario
          </button>

          <button
            className={`btn-secondary ${filterType === 'system' ? 'active' : ''}`}
            style={{ fontSize: '12px' }}
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
          <p>Obteniendo lista completa de procesos de Windows...</p>
        </div>
      ) : error ? (
        <div className="info-box" style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}>{error}</div>
      ) : filteredProcesses.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">Sin resultados de procesos</p>
          <p className="empty-description">No se encontraron procesos que coincidan con los filtros ingresados.</p>
        </div>
      ) : (
        <div className="techkit-table-container" style={{ maxHeight: '480px', overflowY: 'auto' }}>
          <table className="techkit-table">
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
                  Memoria RAM {sortBy === 'memory' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('threads')} style={{ cursor: 'pointer', width: '70px' }}>
                  Hilos {sortBy === 'threads' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Usuario</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((p) => {
                const isHighCpu = p.cpuUsagePercentage > 20;
                const isHighRam = p.memoryBytes > 400 * 1024 * 1024;

                return (
                  <tr
                    key={p.pid}
                    style={{
                      backgroundColor: selectedProcess?.pid === p.pid ? 'var(--bg-card-hover)' : undefined,
                    }}
                  >
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{p.name}</span>
                        {p.isCritical && (
                          <span className="tag-badge tag-guide" style={{ fontSize: '9px' }} title="Proceso protegido del sistema">
                            Sistema
                          </span>
                        )}
                        {(isHighCpu || isHighRam) && (
                          <span className="tag-badge tag-external" style={{ fontSize: '9px' }} title="Alto uso de recursos">
                            ▲ Consumo
                          </span>
                        )}
                      </div>
                    </td>
                    <td><code style={{ fontFamily: 'var(--font-mono)' }}>{p.pid}</code></td>
                    <td>
                      <span style={{ color: isHighCpu ? '#ff4d4f' : 'inherit', fontWeight: isHighCpu ? 700 : 400 }}>
                        {p.cpuUsagePercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ fontWeight: isHighRam ? 700 : 400, color: isHighRam ? '#faad14' : 'inherit' }}>
                      {formatBytes(p.memoryBytes)}
                    </td>
                    <td>{p.threadsCount || 1}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.user}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => setSelectedProcess(p)}
                          title="Ver detalles completos del proceso"
                        >
                          <Info size={12} /> Detalles
                        </button>

                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', color: '#ff4d4f' }}
                          disabled={p.isCritical || p.pid <= 4}
                          onClick={() => setKillConfirmProcess(p)}
                          title={p.isCritical ? 'No se puede finalizar un proceso crítico del sistema' : 'Finalizar proceso individual'}
                        >
                          Finalizar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Details Process */}
      {selectedProcess && (
        <div className="modal-overlay" onClick={() => setSelectedProcess(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 className="section-title" style={{ fontSize: '16px', margin: 0 }}>
                  Detalles del Proceso: {selectedProcess.name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  PID {selectedProcess.pid} — {selectedProcess.publisher || 'Microsoft/Editor'}
                </span>
              </div>
              <button className="icon-btn" onClick={() => setSelectedProcess(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">PID / Proceso Padre (PPID)</span>
                  <span className="info-value">{selectedProcess.pid} / {selectedProcess.ppid || 'N/D'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Uso de CPU / Memoria RAM</span>
                  <span className="info-value">{selectedProcess.cpuUsagePercentage}% / {formatBytes(selectedProcess.memoryBytes)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Memoria Virtual Comprometida</span>
                  <span className="info-value">{formatBytes(selectedProcess.virtualMemoryBytes || selectedProcess.memoryBytes * 1.5)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Número de Hilos / Estado</span>
                  <span className="info-value">{selectedProcess.threadsCount || 1} hilos / {selectedProcess.status}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Usuario Propietario / Cuenta</span>
                  <span className="info-value">{selectedProcess.user}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Elevación de Privilegios</span>
                  <span className="info-value">{selectedProcess.isElevated ? 'Sí (Administrador)' : 'No (Estándar)'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Fecha / Hora de Inicio</span>
                  <span className="info-value">{selectedProcess.startTime || 'Sesión activa'}</span>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ruta Completa del Ejecutable:</strong>
                <div
                  className="instructions-block"
                  style={{
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    wordBreak: 'break-all',
                  }}
                >
                  <span>{selectedProcess.exePath}</span>
                  <button
                    className="btn-secondary"
                    style={{ padding: '2px 8px', fontSize: '11px', flexShrink: 0 }}
                    onClick={() => navigator.clipboard.writeText(selectedProcess.exePath)}
                  >
                    <Copy size={12} /> Copiar
                  </button>
                </div>
              </div>

              {selectedProcess.isCritical && (
                <div className="info-box" style={{ borderColor: '#faad14', backgroundColor: 'rgba(250, 173, 20, 0.08)', display: 'flex', gap: '8px' }}>
                  <ShieldAlert size={18} style={{ color: '#faad14', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Este proceso es un componente vital del sistema operativo Windows y está protegido contra finalización forzada por razones de estabilidad del equipo.
                  </span>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleSearchWebProcess(selectedProcess.name)}
                  title="Buscar información adicional en la web"
                >
                  <ExternalLink size={14} /> Buscar Web
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleCopyProcessInfo(selectedProcess)}
                  title="Copiar resumen del proceso al portapapeles"
                >
                  <Copy size={14} /> Copiar Ficha
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!selectedProcess.isCritical && (
                  <button
                    className="btn-secondary"
                    style={{ color: '#ff4d4f' }}
                    onClick={() => setKillTreeConfirmProcess(selectedProcess)}
                  >
                    Finalizar Árbol
                  </button>
                )}

                <button className="btn-secondary" onClick={() => setSelectedProcess(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Kill Process */}
      {killConfirmProcess && (
        <div className="modal-overlay" onClick={() => setKillConfirmProcess(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="section-title" style={{ fontSize: '16px', color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Confirmar Finalizar Proceso
              </h3>
              <button className="icon-btn" onClick={() => setKillConfirmProcess(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '13px' }}>
              <p>
                ¿Estás seguro de que deseas finalizar el proceso <strong>{killConfirmProcess.name}</strong> (PID <code>{killConfirmProcess.pid}</code>)?
              </p>
              <div className="info-box" style={{ marginTop: '12px', borderColor: '#ff4d4f', color: '#ff4d4f' }}>
                Advertencia: Finalizar un proceso activo puede provocar la pérdida de datos no guardados en esa aplicación.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setKillConfirmProcess(null)} disabled={isActionLoading}>
                Cancelar
              </button>
              <button className="btn-primary" style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={handleConfirmKill} disabled={isActionLoading}>
                {isActionLoading ? 'Finalizando...' : 'Sí, Finalizar Proceso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Kill Process Tree */}
      {killTreeConfirmProcess && (
        <div className="modal-overlay" onClick={() => setKillTreeConfirmProcess(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="section-title" style={{ fontSize: '16px', color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Confirmar Finalizar Árbol de Procesos
              </h3>
              <button className="icon-btn" onClick={() => setKillTreeConfirmProcess(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '13px' }}>
              <p>
                ¿Deseas finalizar el proceso principal <strong>{killTreeConfirmProcess.name}</strong> (PID <code>{killTreeConfirmProcess.pid}</code>) y <strong>todos sus subprocesos dependientes</strong>?
              </p>
              <div className="info-box" style={{ marginTop: '12px', borderColor: '#ff4d4f', color: '#ff4d4f' }}>
                Atención: Esta acción terminará la jerarquía completa de subprocesos iniciados por este programa.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setKillTreeConfirmProcess(null)} disabled={isActionLoading}>
                Cancelar
              </button>
              <button className="btn-primary" style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={handleConfirmKillTree} disabled={isActionLoading}>
                {isActionLoading ? 'Finalizando Árbol...' : 'Finalizar Árbol Completo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
