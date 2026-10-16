import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, Activity, HardDrive } from 'lucide-react';
import { MemoryInfo } from '../../types';
import { systemService, formatBytes } from '../../services/systemService';

export const MemoryView: React.FC = () => {
  const [memory, setMemory] = useState<MemoryInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const fetchMemory = async () => {
    setLoading(true);
    try {
      const data = await systemService.getMemoryInfo();
      setMemory(data);
    } catch (err) {
      console.error('Error al consultar memoria RAM:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchMemory();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} style={{ color: 'var(--accent-color)' }} />
            Memoria RAM
          </h3>
          <p className="section-desc">Capacidad total, memoria utilizada, disponible y estado de ocupación.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn-secondary ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              borderColor: autoRefresh ? 'var(--accent-color)' : 'var(--border-color)',
              color: autoRefresh ? 'var(--accent-color)' : 'var(--text-secondary)',
            }}
          >
            <Activity size={16} />
            {autoRefresh ? 'Monitoreo Activo (3s)' : 'Activar Monitoreo'}
          </button>
          <button className="btn-secondary" onClick={fetchMemory} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {memory && (
        <>
          <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Porcentaje de Ocupación de RAM</span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: memory.usagePercentage > 85 ? '#ff4d4f' : 'var(--accent-color)',
                }}
              >
                {memory.usagePercentage.toFixed(1)}%
              </span>
            </div>

            <div style={{ height: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, memory.usagePercentage))}%`,
                  backgroundColor: memory.usagePercentage > 85 ? '#ff4d4f' : 'var(--accent-color)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Usado: {formatBytes(memory.usedBytes)}</span>
              <span>Total: {formatBytes(memory.totalBytes)}</span>
            </div>
          </div>

          <div className="tools-grid">
            <div className="tool-card" style={{ cursor: 'default' }}>
              <div className="tool-card-header">
                <span className="info-label">Memoria Física Total</span>
                <HardDrive size={18} style={{ color: '#4096ff' }} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatBytes(memory.totalBytes)}
              </div>
            </div>

            <div className="tool-card" style={{ cursor: 'default' }}>
              <div className="tool-card-header">
                <span className="info-label">Memoria Utilizada</span>
                <Database size={18} style={{ color: '#faad14' }} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatBytes(memory.usedBytes)}
              </div>
            </div>

            <div className="tool-card" style={{ cursor: 'default' }}>
              <div className="tool-card-header">
                <span className="info-label">Memoria Disponible</span>
                <Database size={18} style={{ color: '#52c41a' }} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatBytes(memory.availableBytes)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
