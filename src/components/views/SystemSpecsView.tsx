import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  HardDrive,
  Monitor,
  Zap,
  Server,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  CpuInfo,
  MemoryInfo,
  DiskVolume,
  GpuInfo,
  MotherboardBiosInfo,
  SystemSummary,
} from '../../types';
import { systemService, formatBytes, formatUptime } from '../../services/systemService';

export const SystemSpecsView: React.FC = () => {
  const [cpu, setCpu] = useState<CpuInfo | null>(null);
  const [memory, setMemory] = useState<MemoryInfo | null>(null);
  const [disks, setDisks] = useState<DiskVolume[]>([]);
  const [gpu, setGpu] = useState<GpuInfo | null>(null);
  const [motherboard, setMotherboard] = useState<MotherboardBiosInfo | null>(null);
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  const loadSpecs = async () => {
    setIsLoading(true);
    try {
      const [cpuData, memData, diskData, gpuData, mbData, sumData] = await Promise.all([
        systemService.getCpuInfo(),
        systemService.getMemoryInfo(),
        systemService.getDiskInfo(),
        systemService.getGpuInfo(),
        systemService.getMotherboardInfo(),
        systemService.getSystemSummary(),
      ]);

      setCpu(cpuData);
      setMemory(memData);
      setDisks(diskData);
      setGpu(gpuData);
      setMotherboard(mbData);
      setSummary(sumData);
    } catch (err) {
      console.error('Error loading specs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSpecs();
  }, []);

  const generateReportText = (): string => {
    return `=====================================================
TECHKIT - INFORME TÉCNICO DE ESPECIFICACIONES DE HARDWARE
Fecha del informe: ${new Date().toLocaleString()}
=====================================================

1. SISTEMA OPERATIVO Y EQUIPO
- Equipo (Hostname): ${summary?.hostname}
- Usuario Activo: ${summary?.username}
- Sistema Operativo: ${summary?.osName} (${summary?.architecture})
- Versión / Compilación: ${summary?.osVersion} / Build ${summary?.buildNumber}
- Estado de Activación: ${summary?.activationStatus}
- Tiempo de Actividad (Uptime): ${summary ? formatUptime(summary.uptimeSeconds) : 'N/D'}

2. PROCESADOR (CPU)
- Modelo Completo: ${cpu?.model}
- Fabricante / Vendor: ${cpu?.vendor}
- Arquitectura: ${cpu?.architecture}
- Núcleos Físicos / Hilos Lógicos: ${cpu?.physicalCores} Físicos / ${cpu?.logicalCores} Lógicos
- Frecuencia Base / Actual: ${cpu?.baseFrequencyGhz} GHz / ${cpu?.currentFrequencyGhz} GHz
- Extensiones e Instrucciones: ${cpu?.instructionsSupported.join(', ')}

3. MEMORIA RAM
- Capacidad Física Total: ${memory ? formatBytes(memory.totalBytes) : 'N/D'}
- Memoria Comprometida (Committed): ${memory ? formatBytes(memory.committedBytes) : 'N/D'}
- Módulos Instalados: ${memory?.modules.map(m => `${m.slot}: ${formatBytes(m.capacityBytes, 0)} ${m.type} @ ${m.speedMhz}MHz`).join('; ')}

4. PLACA BASE Y BIOS/UEFI
- Fabricante de Placa Base: ${motherboard?.manufacturer}
- Modelo de Placa Base: ${motherboard?.model}
- Proveedor de BIOS: ${motherboard?.biosVendor}
- Versión de BIOS: ${motherboard?.biosVersion} (${motherboard?.biosReleaseDate})

5. ALMACENAMIENTO Y DISCOS
${disks.map(d => `- Unidad ${d.mountPoint} [${d.name}]: ${formatBytes(d.totalBytes, 0)} (${d.diskType}, ${d.fileSystem}) | Libre: ${formatBytes(d.availableBytes, 0)} | Salud SMART: ${d.smartHealth}`).join('\n')}

6. TARJETA GRÁFICA (GPU)
- Modelo: ${gpu?.model} (${gpu?.vendor})
- Memoria Dedicada (VRAM): ${gpu ? formatBytes(gpu.dedicatedMemoryBytes, 1) : 'N/D'}
- Versión de Controlador: ${gpu?.driverVersion}
- Pantallas Conectadas: ${gpu?.displaysConnected.join(', ')}
=====================================================`;
  };

  const handleCopySpecs = () => {
    const report = generateReportText();
    navigator.clipboard.writeText(report);
    setCopyNotice('Especificaciones completas copiadas al portapapeles.');
    setTimeout(() => setCopyNotice(null), 4000);
  };

  const handleExportReport = () => {
    const report = generateReportText();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TechKit_Informe_${summary?.hostname || 'Equipo'}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <RefreshCw size={32} className="spin" style={{ color: 'var(--accent-color)' }} />
        <h3 className="empty-title">Consultando Especificaciones de Hardware...</h3>
        <p className="empty-description">Obteniendo detalles completos del procesador, memoria, almacenamiento y BIOS.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar with Export Buttons */}
      <div className="hero-card" style={{ background: 'var(--bg-secondary)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="hero-title" style={{ fontSize: '20px', margin: 0 }}>Especificaciones Completas del Equipo</h2>
          <p className="hero-sub" style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
            Información técnica detallada de componentes de hardware, placa base, almacenamiento SMART y sistema.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleCopySpecs}>
            <Copy size={16} /> Copiar Datos
          </button>
          <button className="btn-primary" onClick={handleExportReport}>
            <Download size={16} /> Exportar Informe Técnico
          </button>
        </div>
      </div>

      {copyNotice && (
        <div className="info-box" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{copyNotice}</span>
        </div>
      )}

      {/* Grid of Spec Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Processor CPU */}
        <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Cpu size={22} style={{ color: 'var(--accent-color)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Procesador (CPU)</h3>
          </div>
          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Fabricante y Modelo</span>
              <span className="info-value">{cpu?.model}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Arquitectura</span>
              <span className="info-value">{cpu?.architecture} ({cpu?.vendor})</span>
            </div>
            <div className="info-row">
              <span className="info-label">Núcleos Físicos e Hilos Lógicos</span>
              <span className="info-value">{cpu?.physicalCores} Físicos / {cpu?.logicalCores} Lógicos</span>
            </div>
            <div className="info-row">
              <span className="info-label">Frecuencia Base / Frecuencia Actual</span>
              <span className="info-value">{cpu?.baseFrequencyGhz} GHz / {cpu?.currentFrequencyGhz} GHz</span>
            </div>
            <div className="info-row">
              <span className="info-label">Carga Dinámica de CPU</span>
              <span className="info-value">{cpu?.globalUsagePercentage.toFixed(1)}%</span>
            </div>
            <div className="info-row">
              <span className="info-label">Instrucciones y Extensiones</span>
              <span className="info-value">{cpu?.instructionsSupported.slice(0, 8).join(', ')}...</span>
            </div>
          </div>
        </div>

        {/* RAM Memory */}
        <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Activity size={22} style={{ color: '#4096ff' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Memoria RAM</h3>
          </div>
          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Capacidad Física Total</span>
              <span className="info-value">{memory ? formatBytes(memory.totalBytes) : 'N/D'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Memoria Utilizada / Disponible</span>
              <span className="info-value">{memory ? formatBytes(memory.usedBytes) : '0'} / {memory ? formatBytes(memory.availableBytes) : '0'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Memoria Comprometida</span>
              <span className="info-value">{memory ? formatBytes(memory.committedBytes) : 'N/D'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Memoria Caché / Paginada</span>
              <span className="info-value">{memory ? formatBytes(memory.cachedBytes) : '0'} / {memory ? formatBytes(memory.pagedBytes) : '0'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Módulos de Memoria Detectados</span>
              <span className="info-value">{memory?.modules.length || 0} Ranuras pobladas</span>
            </div>
          </div>
        </div>

        {/* Motherboard & BIOS */}
        <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Server size={22} style={{ color: '#b37feb' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Placa Base y BIOS / UEFI</h3>
          </div>
          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Fabricante de Placa Base</span>
              <span className="info-value">{motherboard?.manufacturer}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Modelo de Placa Base</span>
              <span className="info-value">{motherboard?.model}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Proveedor de BIOS/UEFI</span>
              <span className="info-value">{motherboard?.biosVendor}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Versión de Firmware</span>
              <span className="info-value">{motherboard?.biosVersion}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha del Firmware</span>
              <span className="info-value">{motherboard?.biosReleaseDate}</span>
            </div>
          </div>
        </div>

        {/* Operating System */}
        <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Monitor size={22} style={{ color: '#52c41a' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Sistema Operativo</h3>
          </div>
          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Edición de Windows</span>
              <span className="info-value">{summary?.osName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Versión / Número de Compilación</span>
              <span className="info-value">{summary?.osVersion}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Arquitectura del Sistema</span>
              <span className="info-value">{summary?.architecture}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tiempo de Actividad (Uptime)</span>
              <span className="info-value">{summary ? formatUptime(summary.uptimeSeconds) : '0m'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estado de Activación</span>
              <span className="info-value" style={{ color: '#52c41a' }}>{summary?.activationStatus}</span>
            </div>
          </div>
        </div>

        {/* GPU Video Cards */}
        <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Zap size={22} style={{ color: '#faad14' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Tarjeta Gráfica (GPU)</h3>
          </div>
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
              <span className="info-label">Versión de Controlador</span>
              <span className="info-value">{gpu?.driverVersion}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Pantallas Conectadas</span>
              <span className="info-value">{gpu?.displaysConnected.length} detectadas</span>
            </div>
          </div>
        </div>

        {/* Storage SMART */}
        <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <HardDrive size={22} style={{ color: '#faad14' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Unidades de Disco y Salud SMART</h3>
          </div>
          <div className="techkit-table-container">
            <table className="techkit-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Tipo</th>
                  <th>Capacidad</th>
                  <th>Libre</th>
                  <th>Salud SMART</th>
                </tr>
              </thead>
              <tbody>
                {disks.map((d, i) => (
                  <tr key={i}>
                    <td><strong>{d.mountPoint}</strong> ({d.name})</td>
                    <td><span className="tag-badge tag-builtin">{d.diskType}</span></td>
                    <td>{formatBytes(d.totalBytes, 0)}</td>
                    <td>{formatBytes(d.availableBytes, 0)}</td>
                    <td style={{ color: '#52c41a', fontWeight: 600 }}>{d.smartHealth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="info-box" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <AlertTriangle size={16} style={{ color: '#faad14', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Aviso SMART: Los indicadores SMART no garantizan la ausencia absoluta de fallos mecánicos futuros. Realice copias de seguridad de forma periódica.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
