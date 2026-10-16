import React, { useEffect, useState } from 'react';
import { Cpu, RefreshCw, Activity, Layers, CpuIcon } from 'lucide-react';
import { CpuInfo } from '../../types';
import { systemService } from '../../services/systemService';

export const CpuView: React.FC = () => {
  const [cpu, setCpu] = useState<CpuInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const fetchCpu = async () => {
    setLoading(true);
    try {
      const data = await systemService.getCpuInfo();
      setCpu(data);
    } catch (err) {
      console.error('Error al obtener datos de CPU:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCpu();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchCpu();
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
            <Cpu size={20} style={{ color: 'var(--accent-color)' }} />
            Procesador (CPU)
          </h3>
          <p className="section-desc">Especificaciones físicas y porcentaje de utilización global.</p>
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
          <button className="btn-secondary" onClick={fetchCpu} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {cpu && (
        <>
          <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="info-label" style={{ textTransform: 'uppercase', fontSize: '11px' }}>Modelo de CPU</span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>
                  {cpu.model}
                </h2>
              </div>
              <span className="tag-badge tag-native">{cpu.architecture}</span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Uso Actual del Procesador</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: cpu.globalUsagePercentage > 80 ? '#ff4d4f' : 'var(--accent-color)' }}>
                  {cpu.globalUsagePercentage.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, cpu.globalUsagePercentage))}%`,
                    backgroundColor: cpu.globalUsagePercentage > 80 ? '#ff4d4f' : 'var(--accent-color)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="tools-grid">
            <div className="tool-card" style={{ cursor: 'default' }}>
              <div className="tool-card-header">
                <span className="info-label">Núcleos Físicos</span>
                <CpuIcon size={18} style={{ color: '#4096ff' }} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {cpu.physicalCores}
              </div>
            </div>

            <div className="tool-card" style={{ cursor: 'default' }}>
              <div className="tool-card-header">
                <span className="info-label">Procesadores Lógicos (Hilos)</span>
                <Layers size={18} style={{ color: '#b37feb' }} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {cpu.logicalCores}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
