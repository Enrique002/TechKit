import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Search, Shield, Cpu } from 'lucide-react';
import { processService, SystemProcess, SystemServiceItem } from '../../services/processService';
import { formatBytes } from '../../services/systemService';

export const ProcessesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'processes' | 'services'>('processes');
  const [processes, setProcesses] = useState<SystemProcess[]>([]);
  const [services, setServices] = useState<SystemServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterText, setFilterText] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [procData, servData] = await Promise.all([
        processService.getProcesses(),
        processService.getServices(),
      ]);
      setProcesses(procData);
      setServices(servData);
    } catch (err) {
      console.error('Error al obtener lista de procesos/servicios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProcesses = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.pid.toString().includes(filterText)
  );

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(filterText.toLowerCase()) ||
      s.displayName.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: 'var(--accent-color)' }} />
            Procesos y Servicios del Sistema
          </h3>
          <p className="section-desc">Inspección de tareas activas, uso de CPU/RAM por PID y estado de servicios de Windows.</p>
        </div>
        <button className="btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Consultando...' : 'Actualizar'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          className={`btn-secondary ${activeTab === 'processes' ? 'active' : ''}`}
          onClick={() => setActiveTab('processes')}
        >
          <Cpu size={16} />
          Procesos Activos ({processes.length})
        </button>
        <button
          className={`btn-secondary ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Shield size={16} />
          Servicios de Windows ({services.length})
        </button>
      </div>

      {/* Search Filter Box */}
      <div className="hero-search-wrapper" style={{ maxWidth: '400px' }}>
        <Search className="hero-search-icon" size={16} />
        <input
          type="text"
          className="hero-search-input"
          placeholder={activeTab === 'processes' ? 'Filtrar por nombre o PID...' : 'Filtrar servicio...'}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {activeTab === 'processes' ? (
        <div className="techkit-table-container">
          <table className="techkit-table">
            <thead>
              <tr>
                <th>PID</th>
                <th>Nombre del Proceso</th>
                <th>Uso CPU (%)</th>
                <th>Uso Memoria RAM</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((proc) => (
                <tr key={proc.pid}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{proc.pid}</td>
                  <td style={{ fontWeight: 600 }}>{proc.name}</td>
                  <td>{proc.cpuPercentage.toFixed(1)}%</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{formatBytes(proc.memoryBytes)}</td>
                  <td>
                    <span className="status-badge status-available">{proc.status}</span>
                  </td>
                </tr>
              ))}
              {filteredProcesses.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron procesos coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="techkit-table-container">
          <table className="techkit-table">
            <thead>
              <tr>
                <th>Nombre Servicio</th>
                <th>Nombre de Mostrar</th>
                <th>Tipo Inicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((serv) => (
                <tr key={serv.name}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{serv.name}</td>
                  <td>{serv.displayName}</td>
                  <td>
                    <span className="tag-badge tag-builtin">{serv.startType}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${serv.status === 'Running' ? 'status-available' : 'status-pending'}`}>
                      {serv.status === 'Running' ? 'En Ejecución' : 'Detenido'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron servicios coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
