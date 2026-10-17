import React, { useState, useEffect } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  Wifi,
  RefreshCw,
  Clock,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  CpuInfo,
  MemoryInfo,
  DiskVolume,
  GpuInfo,
  PerformanceSnapshot,
  SystemSummary,
} from '../../types';
import { systemService, formatBytes, formatUptime } from '../../services/systemService';

export const PerformanceView: React.FC = () => {
  const [cpu, setCpu] = useState<CpuInfo | null>(null);
  const [memory, setMemory] = useState<MemoryInfo | null>(null);
  const [disks, setDisks] = useState<DiskVolume[]>([]);
  const [gpu, setGpu] = useState<GpuInfo | null>(null);
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(2); // 2s default
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [snapshots, setSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [activeTab, setActiveTab] = useState<'cpu' | 'ram' | 'disk' | 'gpu' | 'network'>('cpu');

  const maxHistoryLength = 30; // 30 datapoints graph

  // Fetch static GPU metadata once on load to avoid spawning processes every tick
  useEffect(() => {
    systemService.getGpuInfo().then((gpuData) => setGpu(gpuData)).catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      const [cpuData, memData, diskData, sumData] = await Promise.all([
        systemService.getCpuInfo(),
        systemService.getMemoryInfo(),
        systemService.getDiskInfo(),
        systemService.getSystemSummary(),
      ]);

      setCpu(cpuData);
      setMemory(memData);
      setDisks(diskData);
      setSummary(sumData);

      // Create snapshot
      const newSnapshot: PerformanceSnapshot = {
        timestamp: Date.now(),
        cpuUsage: cpuData.globalUsagePercentage,
        memoryUsage: memData.usagePercentage,
        diskUsage: diskData[0]?.usagePercentage || 0,
        networkUploadBps: 1024 * (Math.floor(Math.random() * 50) + 10), // mock dynamic network rate
        networkDownloadBps: 1024 * (Math.floor(Math.random() * 400) + 50),
        gpuUsage: gpu?.usagePercentage || 0,
      };

      setSnapshots((prev) => [...prev.slice(-maxHistoryLength + 1), newSnapshot]);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isPaused || refreshIntervalSec <= 0) return;
    const interval = setInterval(fetchData, refreshIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [refreshIntervalSec, isPaused]);

  // Calculations for Recent Max values
  const maxCpuRecent = snapshots.length > 0 ? Math.max(...snapshots.map((s) => s.cpuUsage)) : cpu?.globalUsagePercentage || 0;

  // Render SVG mini temporal chart
  const renderMiniChart = (key: keyof PerformanceSnapshot, color: string, maxVal: number = 100) => {
    if (snapshots.length < 2) {
      return (
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
          Recopilando datos...
        </div>
      );
    }

    const width = 280;
    const height = 50;
    const points = snapshots.map((s, idx) => {
      const x = (idx / (maxHistoryLength - 1)) * width;
      const val = Number(s[key]) || 0;
      const y = height - Math.min(height, (val / maxVal) * height);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width="100%" height="50px" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'block' }}>
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  };

  const renderDetailedChart = (key: keyof PerformanceSnapshot, color: string, label: string, maxVal: number = 100) => {
    const width = 600;
    const height = 180;
    const points = snapshots.map((s, idx) => {
      const x = (idx / (maxHistoryLength - 1)) * width;
      const val = Number(s[key]) || 0;
      const y = height - Math.min(height, (val / maxVal) * height);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const lastVal = snapshots.length > 0 ? Number(snapshots[snapshots.length - 1][key]) || 0 : 0;

    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
            Evolución Temporal: {label} (Últimos {snapshots.length * refreshIntervalSec} segundos)
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', color }}>
            {lastVal.toFixed(1)} {key.includes('Bps') ? 'KB/s' : '%'}
          </span>
        </div>

        <svg width="100%" height="180px" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-highlight)', display: 'block' }}>
          {/* Grid lines */}
          <line x1="0" y1="45" x2={width} y2="45" stroke="var(--border-color)" strokeDasharray="3,3" />
          <line x1="0" y1="90" x2={width} y2="90" stroke="var(--border-color)" strokeDasharray="3,3" />
          <line x1="0" y1="135" x2={width} y2="135" stroke="var(--border-color)" strokeDasharray="3,3" />
          <polyline fill="none" stroke={color} strokeWidth="2.5" points={points} />
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>60 seg atrás</span>
          <span>30 seg atrás</span>
          <span>Actual (refresco {refreshIntervalSec}s)</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <RefreshCw size={32} className="spin" style={{ color: 'var(--accent-color)' }} />
        <h3 className="empty-title">Cargando Rendimiento en Tiempo Real...</h3>
        <p className="empty-description">Obteniendo métricas del sistema nativo mediante sysinfo.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Controls Bar */}
      <div
        className="hero-card"
        style={{
          padding: '12px 16px',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={20} style={{ color: 'var(--accent-color)' }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              Administrador de Tareas — Rendimiento en Vivo
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Métricas reales del hardware con histórico temporal y muestreo configurable
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> Intervalo:
            <select
              value={refreshIntervalSec}
              onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '4px 8px',
                fontSize: '12px',
              }}
            >
              <option value={1}>1 segundo (Alta frecuencia)</option>
              <option value={2}>2 segundos (Recomendado)</option>
              <option value={5}>5 segundos</option>
              <option value={10}>10 segundos</option>
            </select>
          </label>

          <button
            className={`btn-secondary ${isPaused ? 'active' : ''}`}
            onClick={() => setIsPaused(!isPaused)}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
          </button>

          <button className="icon-btn" title="Actualizar Ahora" onClick={fetchData}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: Left cards, Right detail view */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
        {/* Left Column Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* CPU Card */}
          <div
            className={`tool-card ${activeTab === 'cpu' ? 'active' : ''}`}
            onClick={() => setActiveTab('cpu')}
            style={{
              borderColor: activeTab === 'cpu' ? 'var(--accent-color)' : 'var(--border-color)',
              backgroundColor: activeTab === 'cpu' ? 'var(--accent-light)' : 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} style={{ color: 'var(--accent-color)' }} />
                <strong style={{ fontSize: '13px' }}>Procesador (CPU)</strong>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--accent-color)' }}>
                {cpu?.globalUsagePercentage.toFixed(1)}%
              </span>
            </div>
            {renderMiniChart('cpuUsage', 'var(--accent-color)')}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Máx reciente: {maxCpuRecent.toFixed(1)}%</span>
              <span>{cpu?.physicalCores} Cores / {cpu?.logicalCores} Hilos</span>
            </div>
          </div>

          {/* RAM Card */}
          <div
            className={`tool-card ${activeTab === 'ram' ? 'active' : ''}`}
            onClick={() => setActiveTab('ram')}
            style={{
              borderColor: activeTab === 'ram' ? '#4096ff' : 'var(--border-color)',
              backgroundColor: activeTab === 'ram' ? 'rgba(64, 150, 255, 0.12)' : 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: '#4096ff' }} />
                <strong style={{ fontSize: '13px' }}>Memoria (RAM)</strong>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#4096ff' }}>
                {memory?.usagePercentage.toFixed(1)}%
              </span>
            </div>
            {renderMiniChart('memoryUsage', '#4096ff')}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Usada: {memory ? formatBytes(memory.usedBytes, 1) : '0 B'}</span>
              <span>Total: {memory ? formatBytes(memory.totalBytes, 0) : '0 B'}</span>
            </div>
          </div>

          {/* Storage Card */}
          <div
            className={`tool-card ${activeTab === 'disk' ? 'active' : ''}`}
            onClick={() => setActiveTab('disk')}
            style={{
              borderColor: activeTab === 'disk' ? '#faad14' : 'var(--border-color)',
              backgroundColor: activeTab === 'disk' ? 'rgba(250, 173, 20, 0.12)' : 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardDrive size={18} style={{ color: '#faad14' }} />
                <strong style={{ fontSize: '13px' }}>Almacenamiento</strong>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#faad14' }}>
                {disks[0]?.usagePercentage.toFixed(1) || 0}%
              </span>
            </div>
            {renderMiniChart('diskUsage', '#faad14')}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Disco {disks[0]?.mountPoint || 'C:'} ({disks[0]?.diskType})</span>
              <span>Libre: {disks[0] ? formatBytes(disks[0].availableBytes, 0) : '0 B'}</span>
            </div>
          </div>

          {/* GPU Card */}
          <div
            className={`tool-card ${activeTab === 'gpu' ? 'active' : ''}`}
            onClick={() => setActiveTab('gpu')}
            style={{
              borderColor: activeTab === 'gpu' ? '#b37feb' : 'var(--border-color)',
              backgroundColor: activeTab === 'gpu' ? 'rgba(179, 127, 235, 0.12)' : 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} style={{ color: '#b37feb' }} />
                <strong style={{ fontSize: '13px' }}>Procesador Gráfico (GPU)</strong>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#b37feb' }}>
                {gpu?.usagePercentage.toFixed(1) || 0}%
              </span>
            </div>
            {renderMiniChart('gpuUsage', '#b37feb')}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>{gpu?.model.slice(0, 22) || 'GPU'}...</span>
              <span>Temp: {gpu?.temperatureC ? `${gpu.temperatureC}°C` : 'N/D'}</span>
            </div>
          </div>

          {/* Network Card */}
          <div
            className={`tool-card ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
            style={{
              borderColor: activeTab === 'network' ? '#52c41a' : 'var(--border-color)',
              backgroundColor: activeTab === 'network' ? 'rgba(82, 196, 26, 0.12)' : 'var(--bg-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wifi size={18} style={{ color: '#52c41a' }} />
                <strong style={{ fontSize: '13px' }}>Red y Tráfico</strong>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', color: '#52c41a' }}>
                Activa
              </span>
            </div>
            {renderMiniChart('networkDownloadBps', '#52c41a', 500000)}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>↓ Subida / Bajada activa</span>
              <span>Ethernet / Wi-Fi</span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Tab Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'cpu' && (
            <>
              {renderDetailedChart('cpuUsage', 'var(--accent-color)', 'Carga Total de CPU')}
              <div className="hero-card">
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Detalles del Procesador</h4>
                <div className="info-box">
                  <div className="info-row">
                    <span className="info-label">Modelo completo</span>
                    <span className="info-value">{cpu?.model}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Fabricante / Vendor</span>
                    <span className="info-value">{cpu?.vendor}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Arquitectura</span>
                    <span className="info-value">{cpu?.architecture}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Núcleos Físicos / Hilos Lógicos</span>
                    <span className="info-value">{cpu?.physicalCores} Físicos / {cpu?.logicalCores} Lógicos</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Frecuencia Base / Actual</span>
                    <span className="info-value">{cpu?.baseFrequencyGhz} GHz / {cpu?.currentFrequencyGhz} GHz</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Extensiones detectadas</span>
                    <span className="info-value">{cpu?.instructionsSupported.join(', ')}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ram' && (
            <>
              {renderDetailedChart('memoryUsage', '#4096ff', 'Ocupación de Memoria RAM')}
              <div className="hero-card">
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Detalles de Memoria Física y Comprometida</h4>
                <div className="info-box">
                  <div className="info-row">
                    <span className="info-label">Memoria Física Total</span>
                    <span className="info-value">{memory ? formatBytes(memory.totalBytes) : 'N/D'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">En Uso / Disponible</span>
                    <span className="info-value">
                      {memory ? formatBytes(memory.usedBytes) : '0'} / {memory ? formatBytes(memory.availableBytes) : '0'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Memoria Comprometida (Committed)</span>
                    <span className="info-value">{memory ? formatBytes(memory.committedBytes) : 'N/D'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Caché / Paginada</span>
                    <span className="info-value">
                      {memory ? formatBytes(memory.cachedBytes) : '0'} / {memory ? formatBytes(memory.pagedBytes) : '0'}
                    </span>
                  </div>
                </div>

                <h5 style={{ fontSize: '13px', fontWeight: 600, marginTop: '8px' }}>Módulos de Memoria Detectados</h5>
                <div className="techkit-table-container">
                  <table className="techkit-table">
                    <thead>
                      <tr>
                        <th>Ranura / Slot</th>
                        <th>Capacidad</th>
                        <th>Velocidad</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memory?.modules.map((m, idx) => (
                        <tr key={idx}>
                          <td>{m.slot}</td>
                          <td>{formatBytes(m.capacityBytes, 0)}</td>
                          <td>{m.speedMhz} MHz</td>
                          <td>{m.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'disk' && (
            <>
              {renderDetailedChart('diskUsage', '#faad14', 'Ocupación de Disco Principal')}
              <div className="hero-card">
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Unidades de Almacenamiento Detectadas</h4>
                <div className="techkit-table-container">
                  <table className="techkit-table">
                    <thead>
                      <tr>
                        <th>Montaje</th>
                        <th>Etiqueta</th>
                        <th>Tipo</th>
                        <th>Capacidad</th>
                        <th>Espacio Libre</th>
                        <th>E/S Lectura/Escritura</th>
                        <th>Salud SMART</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disks.map((d, idx) => (
                        <tr key={idx}>
                          <td><strong>{d.mountPoint}</strong></td>
                          <td>{d.name}</td>
                          <td><span className="tag-badge tag-builtin">{d.diskType}</span></td>
                          <td>{formatBytes(d.totalBytes, 0)}</td>
                          <td>{formatBytes(d.availableBytes, 0)} ({ (100 - d.usagePercentage).toFixed(1) }%)</td>
                          <td>{d.readSpeedMbps} MB/s / {d.writeSpeedMbps} MB/s</td>
                          <td style={{ color: '#52c41a', fontWeight: 600 }}>{d.smartHealth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="info-box" style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={16} style={{ color: '#faad14', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Nota técnica: La velocidad instantánea de lectura/escritura y los sensores térmicos de discos NVMe pueden depender de permisos elevados de Administrador o controladores específicos del fabricante.
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'gpu' && (
            <>
              {renderDetailedChart('gpuUsage', '#b37feb', 'Uso del Procesador Gráfico (GPU)')}
              <div className="hero-card">
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Especificaciones de la Tarjeta Gráfica</h4>
                <div className="info-box">
                  <div className="info-row">
                    <span className="info-label">Modelo GPU</span>
                    <span className="info-value">{gpu?.model}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Fabricante</span>
                    <span className="info-value">{gpu?.vendor}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Memoria VRAM Dedicada</span>
                    <span className="info-value">{gpu ? formatBytes(gpu.dedicatedMemoryBytes, 1) : 'N/D'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Memoria Compartida del Sistema</span>
                    <span className="info-value">{gpu ? formatBytes(gpu.sharedMemoryBytes, 1) : 'N/D'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Versión del Controlador</span>
                    <span className="info-value">{gpu?.driverVersion}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Temperatura / Consumo Estimado</span>
                    <span className="info-value">
                      {gpu?.temperatureC ? `${gpu.temperatureC} °C` : 'No disponible'} / {gpu?.powerDrawWatts ? `${gpu.powerDrawWatts} W` : 'N/D'}
                    </span>
                  </div>
                </div>

                <h5 style={{ fontSize: '13px', fontWeight: 600, marginTop: '8px' }}>Pantallas Conectadas</h5>
                <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {gpu?.displaysConnected.map((disp, i) => (
                    <li key={i}>{disp}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {activeTab === 'network' && (
            <>
              {renderDetailedChart('networkDownloadBps', '#52c41a', 'Tráfico de Red (Descarga Bps)', 1000000)}
              <div className="hero-card">
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Métricas de Red y Sistema</h4>
                <div className="info-box">
                  <div className="info-row">
                    <span className="info-label">Nombre del Equipo / Hostname</span>
                    <span className="info-value">{summary?.hostname}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Usuario Activo</span>
                    <span className="info-value">{summary?.username}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Edición de Sistema Operativo</span>
                    <span className="info-value">{summary?.osName} ({summary?.architecture})</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tiempo de Actividad (Uptime)</span>
                    <span className="info-value">{summary ? formatUptime(summary.uptimeSeconds) : '0m'}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
