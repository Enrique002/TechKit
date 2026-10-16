import React, { useEffect, useState } from 'react';
import { Monitor, RefreshCw, User, Cpu, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SystemSummary } from '../../types';
import { systemService, formatUptime } from '../../services/systemService';

export const SystemSummaryView: React.FC = () => {
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemService.getSystemSummary();
      setSummary(data);
    } catch (err) {
      setError('No se pudo obtener la información del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={20} style={{ color: 'var(--accent-color)' }} />
            Resumen General del Equipo
          </h3>
          <p className="section-desc">Consultas en tiempo real del sistema operativo y estado general.</p>
        </div>
        <button className="btn-secondary" onClick={fetchSummary} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Consultando...' : 'Actualizar Datos'}
        </button>
      </div>

      {error && (
        <div className="info-box" style={{ borderColor: '#ff4d4f', backgroundColor: 'rgba(255,77,79,0.1)' }}>
          <AlertTriangle size={18} style={{ color: '#ff4d4f', display: 'inline', marginRight: '8px' }} />
          <span>{error}</span>
        </div>
      )}

      {summary && (
        <>
          <div className="tools-grid">
            <div className="tool-card" style={{ cursor: 'default' }}>
              <div className="tool-card-header">
                <span className="info-label">Nombre del Equipo</span>
                <Monitor size={18} style={{ color: 'var(--accent-color)' }} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {summary.hostname}
              </div>
            </div>

            <div className="tool-card" style={{ cursor: 'default' }}>
              <div className="tool-card-header">
                <span className="info-label">Usuario Actual</span>
                <User size={18} style={{ color: '#4096ff' }} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {summary.username}
              </div>
            </div>

            <div className="tool-card" style={{ cursor: 'default' }}>
              <div className="tool-card-header">
                <span className="info-label">Sistema Operativo</span>
                <Cpu size={18} style={{ color: '#faad14' }} />
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {summary.osName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Versión: {summary.osVersion}
              </div>
            </div>

            <div className="tool-card" style={{ cursor: 'default' }}>
              <div className="tool-card-header">
                <span className="info-label">Tiempo Activo</span>
                <Clock size={18} style={{ color: '#52c41a' }} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatUptime(summary.uptimeSeconds)}
              </div>
            </div>
          </div>

          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Arquitectura de Procesador</span>
              <span className="info-value">{summary.architecture}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Versión de TechKit</span>
              <span className="info-value">{summary.appVersion}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estado del Sistema</span>
              <span className="info-value" style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Sistema Funcional (Medición Real)
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Última Actualización</span>
              <span className="info-value">{summary.lastUpdated}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
