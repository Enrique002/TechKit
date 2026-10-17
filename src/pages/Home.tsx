import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Cpu, HardDrive, Download, Activity, Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Tool, CategoryId, CpuInfo, MemoryInfo, DiskVolume } from '../types';
import { POPULAR_KEYWORDS } from '../data/toolsData';
import { ToolCard } from '../components/ToolCard';
import { EmptyState } from '../components/EmptyState';
import { systemService, formatBytes } from '../services/systemService';

interface HomeProps {
  favoriteTools: Tool[];
  recentTools: Tool[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onSelectTool: (tool: Tool) => void;
  onNavigateCategory: (category: CategoryId) => void;
  onSearchKeyword: (keyword: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  favoriteTools,
  recentTools,
  isFavorite,
  onToggleFavorite,
  onSelectTool,
  onNavigateCategory,
  onSearchKeyword,
}) => {
  const [cpu, setCpu] = useState<CpuInfo | null>(null);
  const [memory, setMemory] = useState<MemoryInfo | null>(null);
  const [disks, setDisks] = useState<DiskVolume[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [c, m, d] = await Promise.all([
          systemService.getCpuInfo(),
          systemService.getMemoryInfo(),
          systemService.getDiskInfo(),
        ]);
        setCpu(c);
        setMemory(m);
        setDisks(d);
      } catch (err) {
        console.warn('Dashboard metrics load error:', err);
      }
    }
    loadMetrics();
  }, []);

  const highResourceAlert = (cpu?.globalUsagePercentage || 0) > 80 || (memory?.usagePercentage || 0) > 85;

  return (
    <div className="page-container">
      {/* Hero Welcome Banner */}
      <div className="hero-card">
        <div>
          <h2 className="hero-title">TechKit — Suite de Diagnóstico Técnico e Inspección</h2>
          <p className="hero-sub">
            Administrador de tareas en tiempo real, especificaciones avanzadas y catálogo de herramientas profesionales.
          </p>
        </div>

        {/* Highlighted Search Area */}
        <div className="hero-search-wrapper">
          <Search className="hero-search-icon" size={18} />
          <input
            type="text"
            className="hero-search-input"
            placeholder="Buscar por herramienta, comando, IP, proceso o PID (ej. HWiNFO, Process Explorer, ping)..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearchKeyword((e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {/* Popular Keywords Cloud */}
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            BÚSQUEDAS RÁPIDAS Y HERRAMIENTAS POPULARES:
          </span>
          <div className="keywords-cloud">
            {POPULAR_KEYWORDS.map((kw) => (
              <button
                key={kw}
                className="keyword-btn"
                onClick={() => onSearchKeyword(kw)}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time System Status Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div className="hero-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => onNavigateCategory('performance')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>USO DE CPU</span>
            <Cpu size={18} style={{ color: 'var(--accent-color)' }} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-color)', margin: '4px 0' }}>
            {cpu ? `${cpu.globalUsagePercentage.toFixed(1)}%` : 'Cargando...'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {cpu ? `${cpu.physicalCores} Núcleos / ${cpu.logicalCores} Hilos` : 'Carga total'}
          </span>
        </div>

        <div className="hero-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => onNavigateCategory('performance')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>OCUPACIÓN DE RAM</span>
            <Activity size={18} style={{ color: '#4096ff' }} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#4096ff', margin: '4px 0' }}>
            {memory ? `${memory.usagePercentage.toFixed(1)}%` : 'Cargando...'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {memory ? `${formatBytes(memory.usedBytes, 1)} de ${formatBytes(memory.totalBytes, 0)}` : 'Memoria física'}
          </span>
        </div>

        <div className="hero-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => onNavigateCategory('disks')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>DISCO SISTEMA (C:)</span>
            <HardDrive size={18} style={{ color: '#faad14' }} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#faad14', margin: '4px 0' }}>
            {disks[0] ? `${disks[0].usagePercentage.toFixed(1)}%` : 'Cargando...'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {disks[0] ? `${formatBytes(disks[0].availableBytes, 0)} libre` : 'Espacio disponible'}
          </span>
        </div>

        <div className="hero-card" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => onNavigateCategory('processes')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>ESTADO DEL SISTEMA</span>
            {highResourceAlert ? <AlertTriangle size={18} style={{ color: '#ff4d4f' }} /> : <CheckCircle2 size={18} style={{ color: '#52c41a' }} />}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: highResourceAlert ? '#ff4d4f' : '#52c41a', margin: '6px 0' }}>
            {highResourceAlert ? 'Carga Alta Detectada' : 'Rendimiento Normal'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {highResourceAlert ? 'Comprobar procesos con consumo elevado' : 'Indicadores de hardware estables'}
          </span>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h3 className="section-title" style={{ fontSize: '15px', marginBottom: '12px' }}>
          Accesos Directos de la Suite
        </h3>
        <div className="tools-grid">
          <div className="tool-card" onClick={() => onNavigateCategory('performance')}>
            <div className="tool-card-header">
              <Activity size={24} style={{ color: 'var(--accent-color)' }} />
              <span className="tag-badge tag-native">Monitor</span>
            </div>
            <h4 className="tool-title">Vista de Rendimiento</h4>
            <p className="tool-desc">Gráficos en vivo de CPU, RAM, discos, GPU y red.</p>
          </div>

          <div className="tool-card" onClick={() => onNavigateCategory('processes')}>
            <div className="tool-card-header">
              <Terminal size={24} style={{ color: '#4096ff' }} />
              <span className="tag-badge tag-native">Administrador</span>
            </div>
            <h4 className="tool-title">Gestor de Procesos</h4>
            <p className="tool-desc">Tabla interactiva, búsqueda PID y finalización segura.</p>
          </div>

          <div className="tool-card" onClick={() => onNavigateCategory('specs')}>
            <div className="tool-card-header">
              <Cpu size={24} style={{ color: '#b37feb' }} />
              <span className="tag-badge tag-builtin">Especificaciones</span>
            </div>
            <h4 className="tool-title">Ficha del Equipo</h4>
            <p className="tool-desc">Detalles completos de hardware, BIOS y reporte exportable.</p>
          </div>

          <div className="tool-card" onClick={() => onNavigateCategory('tools_catalog')}>
            <div className="tool-card-header">
              <Download size={24} style={{ color: '#faad14' }} />
              <span className="tag-badge tag-external">Catálogo</span>
            </div>
            <h4 className="tool-title">Herramientas Externas</h4>
            <p className="tool-desc">HWiNFO64, Sysinternals, CrystalDisk y más de 35 utilidades.</p>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 className="section-title" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={16} color="#faad14" fill="#faad14" /> Mis Herramientas Favoritas
          </h3>
          {favoriteTools.length > 0 && (
            <button className="keyword-btn" onClick={() => onNavigateCategory('favorites')}>
              Ver todos ({favoriteTools.length})
            </button>
          )}
        </div>

        {favoriteTools.length === 0 ? (
          <EmptyState
            title="Sin favoritos guardados"
            description="Haz clic en la estrella de cualquier ficha de herramienta para fijarla aquí y acceder rápidamente a ella."
          />
        ) : (
          <div className="tools-grid">
            {favoriteTools.slice(0, 3).map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={isFavorite(tool.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectTool={onSelectTool}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 className="section-title" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} /> Consultados Recientemente
          </h3>
          {recentTools.length > 0 && (
            <button className="keyword-btn" onClick={() => onNavigateCategory('recent')}>
              Ver historial ({recentTools.length})
            </button>
          )}
        </div>

        {recentTools.length === 0 ? (
          <EmptyState
            title="Sin historial reciente"
            description="Las herramientas e instructivos que abras aparecerán automáticamente en esta sección."
          />
        ) : (
          <div className="tools-grid">
            {recentTools.slice(0, 3).map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={isFavorite(tool.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectTool={onSelectTool}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
