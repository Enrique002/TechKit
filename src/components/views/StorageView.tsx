import React, { useEffect, useState } from 'react';
import { HardDrive, RefreshCw, Disc, AlertCircle } from 'lucide-react';
import { DiskVolume } from '../../types';
import { systemService, formatBytes } from '../../services/systemService';

export const StorageView: React.FC = () => {
  const [volumes, setVolumes] = useState<DiskVolume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemService.getDiskInfo();
      setVolumes(data);
    } catch (err) {
      setError('Error al consultar la información de discos del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisks();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={20} style={{ color: 'var(--accent-color)' }} />
            Unidades y Almacenamiento
          </h3>
          <p className="section-desc">Puntos de montaje, sistema de archivos, capacidad total y espacio disponible.</p>
        </div>
        <button className="btn-secondary" onClick={fetchDisks} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Consultando...' : 'Actualizar Unidades'}
        </button>
      </div>

      {error && (
        <div className="info-box" style={{ borderColor: '#ff4d4f', backgroundColor: 'rgba(255,77,79,0.1)' }}>
          <AlertCircle size={18} style={{ color: '#ff4d4f', display: 'inline', marginRight: '8px' }} />
          <span>{error}</span>
        </div>
      )}

      {volumes.length === 0 && !loading && !error && (
        <div className="empty-state">
          <HardDrive size={48} className="empty-icon" />
          <h3 className="empty-title">Sin unidades de disco detectadas</h3>
          <p className="empty-description">No se pudieron encontrar unidades locales accesibles o el sistema no tiene volúmenes montados.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {volumes.map((vol, index) => {
          const isHighUsage = vol.usagePercentage > 90;
          return (
            <div key={index} className="hero-card" style={{ background: 'var(--bg-secondary)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--accent-color)',
                      display: 'flex',
                    }}
                  >
                    {vol.isRemovable ? <Disc size={24} /> : <HardDrive size={24} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {vol.mountPoint} {vol.name ? `(${vol.name})` : ''}
                      </h4>
                      {vol.isRemovable && <span className="tag-badge tag-external">Extraíble</span>}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Sistema de Archivos: {vol.fileSystem}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: isHighUsage ? '#ff4d4f' : 'var(--text-primary)' }}>
                    {formatBytes(vol.availableBytes)} libres
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    de {formatBytes(vol.totalBytes)} totales
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Usado: {formatBytes(vol.usedBytes)} ({vol.usagePercentage.toFixed(1)}%)
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Libre: {formatBytes(vol.availableBytes)}
                  </span>
                </div>
                <div style={{ height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, vol.usagePercentage))}%`,
                      backgroundColor: isHighUsage ? '#ff4d4f' : 'var(--accent-color)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
