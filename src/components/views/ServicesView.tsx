import React, { useState, useEffect, useMemo } from 'react';
import { WindowsServiceInfo } from '../../types';
import { windowServicesService } from '../../services/windowServicesService';
import { RefreshCw, Search, ShieldAlert, AlertTriangle, Info, Play, Square, X } from 'lucide-react';

export const ServicesView: React.FC = () => {
  const [services, setServices] = useState<WindowsServiceInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped'>('all');
  const [sortBy, setSortBy] = useState<'displayName' | 'name' | 'status'>('displayName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal / Selection state
  const [selectedService, setSelectedService] = useState<WindowsServiceInfo | null>(null);
  const [actionConfirm, setActionConfirm] = useState<{
    service: WindowsServiceInfo;
    action: 'start' | 'stop';
  } | null>(null);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await windowServicesService.getServices();
      setServices(data);
    } catch (err) {
      setError('No se pudieron consultar los servicios de Windows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSort = (field: 'displayName' | 'name' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExecuteServiceAction = async () => {
    if (!actionConfirm) return;
    setIsActionLoading(true);
    setActionMessage(null);

    const { service, action } = actionConfirm;
    const res = await windowServicesService.controlService(service.name, action);
    setIsActionLoading(false);

    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
      setActionConfirm(null);
      fetchServices();
    } else {
      setActionMessage({ type: 'error', text: res.message });
      setActionConfirm(null);
    }
  };

  // Memoize filtered and sorted services computation to avoid recalculating string comparisons on unrelated re-renders
  const filteredServices = useMemo(() => {
    return services
      .filter((s) => {
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch =
          query === '' ||
          s.name.toLowerCase().includes(query) ||
          s.displayName.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        if (statusFilter === 'running') return s.status === 'Running';
        if (statusFilter === 'stopped') return s.status === 'Stopped';

        return true;
      })
      .sort((a, b) => {
        let compA = a[sortBy].toLowerCase();
        let compB = b[sortBy].toLowerCase();

        if (compA < compB) return sortOrder === 'asc' ? -1 : 1;
        if (compA > compB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [services, searchTerm, statusFilter, sortBy, sortOrder]);

  return (
    <div className="card-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Servicios de Windows</span>
            <span className="badge badge-info">{services.length} Registrados</span>
          </h3>
          <p className="card-desc">
            Consultar el estado de los servicios del sistema operativo, tipos de inicio y descripción.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchServices} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Actualizar Lista
        </button>
      </div>

      {actionMessage && (
        <div className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionMessage.text}</span>
          <button className="btn-icon" onClick={() => setActionMessage(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Toolbar: Search and Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '32px', width: '100%' }}
            placeholder="Buscar por Nombre Interno o Descriptivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setStatusFilter('all')}
          >
            Todos
          </button>
          <button
            className={`btn ${statusFilter === 'running' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setStatusFilter('running')}
          >
            En Ejecución
          </button>
          <button
            className={`btn ${statusFilter === 'stopped' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setStatusFilter('stopped')}
          >
            Detenidos
          </button>
        </div>
      </div>

      {/* Services Table */}
      {loading && services.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', opacity: 0.7 }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '8px' }} />
          <p>Consultando servicios de Windows...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : filteredServices.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', opacity: 0.7, border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
          No se encontraron servicios que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('displayName')} style={{ cursor: 'pointer' }}>
                  Nombre Descriptivo {sortBy === 'displayName' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Nombre Interno {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', width: '120px' }}>
                  Estado {sortBy === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ width: '110px' }}>Inicio</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((s) => (
                <tr key={s.name}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{s.displayName}</span>
                      {s.isCritical && (
                        <span className="badge badge-warning" style={{ fontSize: '10px' }} title="Servicio crítico del sistema">
                          Crítico
                        </span>
                      )}
                    </div>
                  </td>
                  <td><code>{s.name}</code></td>
                  <td>
                    <span className={`badge ${s.status === 'Running' ? 'badge-success' : 'badge-neutral'}`}>
                      {s.status === 'Running' ? 'En ejecución' : s.status === 'Stopped' ? 'Detenido' : s.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{s.startType}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setSelectedService(s)}
                      >
                        <Info size={12} />
                        Detalles
                      </button>

                      {s.status === 'Stopped' ? (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--success-color)' }}
                          disabled={s.isCritical}
                          onClick={() => setActionConfirm({ service: s, action: 'start' })}
                        >
                          <Play size={12} />
                          Iniciar
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--error-color)' }}
                          disabled={s.isCritical}
                          onClick={() => setActionConfirm({ service: s, action: 'stop' })}
                        >
                          <Square size={12} />
                          Detener
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Servicio: {selectedService.displayName}</h3>
              <button className="btn-icon" onClick={() => setSelectedService(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div><strong>Nombre interno:</strong> <code>{selectedService.name}</code></div>
              <div><strong>Estado actual:</strong> {selectedService.status}</div>
              <div><strong>Tipo de inicio:</strong> {selectedService.startType}</div>
              <div>
                <strong>Descripción:</strong>
                <p style={{ marginTop: '4px', opacity: 0.9, lineHeight: '1.4' }}>{selectedService.description}</p>
              </div>

              {selectedService.isCritical && (
                <div className="alert alert-warning" style={{ fontSize: '12px' }}>
                  <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Servicio esencial protegido. Modificaciones bloqueadas para proteger la estabilidad del sistema.
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedService(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Action Confirmation Modal */}
      {actionConfirm && (
        <div className="modal-overlay" onClick={() => setActionConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                Confirmar Acción sobre Servicio
              </h3>
              <button className="btn-icon" onClick={() => setActionConfirm(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                ¿Deseas solicitar {actionConfirm.action === 'start' ? 'iniciar' : 'detener'} el servicio{' '}
                <strong>{actionConfirm.service.displayName}</strong> (<code>{actionConfirm.service.name}</code>)?
              </p>

              <div className="alert alert-warning" style={{ fontSize: '12px' }}>
                <strong>Nota de seguridad:</strong> Modificar el estado de un servicio puede requerir privilegios de Administrador elevados en Windows o afectar a otras aplicaciones dependientes.
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setActionConfirm(null)} disabled={isActionLoading}>
                Cancelar
              </button>
              <button
                className={`btn ${actionConfirm.action === 'start' ? 'btn-primary' : 'btn-danger'}`}
                onClick={handleExecuteServiceAction}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Ejecutando...' : `Confirmar y ${actionConfirm.action === 'start' ? 'Iniciar' : 'Detener'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
