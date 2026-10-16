import React from 'react';
import { Search, Info, Star, Clock, Cpu, HardDrive, Wifi, BookOpen } from 'lucide-react';
import { Tool, CategoryId } from '../types';
import { POPULAR_KEYWORDS } from '../data/toolsData';
import { ToolCard } from '../components/ToolCard';
import { EmptyState } from '../components/EmptyState';

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
  return (
    <div className="page-container">
      {/* Hero Welcome Banner */}
      <div className="hero-card">
        <div>
          <h2 className="hero-title">TechKit — Kit de Herramientas para Técnicos</h2>
          <p className="hero-sub">
            Plataforma unificada de diagnóstico, utilidades del sistema y guías de resolución.
          </p>
        </div>

        {/* Highlighted Search Area */}
        <div className="hero-search-wrapper">
          <Search className="hero-search-icon" size={18} />
          <input
            type="text"
            className="hero-search-input"
            placeholder="Buscar por nombre, comando, categoría (ej. procesador, RAM, espacio libre)..."
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
            BÚSQUEDAS RÁPIDAS HABITUALES:
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

      {/* Development Status Notice */}
      <div
        className="info-box"
        style={{
          borderColor: 'rgba(250, 173, 20, 0.4)',
          backgroundColor: 'rgba(250, 173, 20, 0.05)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <Info size={20} style={{ color: '#faad14', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#faad14', fontSize: '13px' }}>
            Estado del Proyecto: Fase 2 de 5 (Diagnóstico de Sistema, CPU, RAM y Discos)
          </strong>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            En esta segunda fase se han incorporado consultas nativas reales del procesador, memoria RAM y almacenamiento.
          </p>
        </div>
      </div>

      {/* Quick Category Jump Access */}
      <div>
        <h3 className="section-title" style={{ fontSize: '15px', marginBottom: '12px' }}>
          Categorías Principales
        </h3>
        <div className="tools-grid">
          <div className="tool-card" onClick={() => onNavigateCategory('hardware')}>
            <div className="tool-card-header">
              <Cpu size={24} style={{ color: 'var(--accent-color)' }} />
              <span className="tag-badge tag-native">Hardware</span>
            </div>
            <h4 className="tool-title">Hardware y temperaturas</h4>
            <p className="tool-desc">Sensores de CPU, GPU y memoria RAM física.</p>
          </div>

          <div className="tool-card" onClick={() => onNavigateCategory('disks')}>
            <div className="tool-card-header">
              <HardDrive size={24} style={{ color: '#4096ff' }} />
              <span className="tag-badge tag-builtin">Discos</span>
            </div>
            <h4 className="tool-title">Discos y almacenamiento</h4>
            <p className="tool-desc">Unidades montadas, capacidad total y espacio libre.</p>
          </div>

          <div className="tool-card" onClick={() => onNavigateCategory('network')}>
            <div className="tool-card-header">
              <Wifi size={24} style={{ color: '#faad14' }} />
              <span className="tag-badge tag-external">Redes</span>
            </div>
            <h4 className="tool-title">Redes y conectividad</h4>
            <p className="tool-desc">Diagnóstico IP, pruebas DNS y sockets de red.</p>
          </div>

          <div className="tool-card" onClick={() => onNavigateCategory('guides')}>
            <div className="tool-card-header">
              <BookOpen size={24} style={{ color: '#b37feb' }} />
              <span className="tag-badge tag-guide">Guías</span>
            </div>
            <h4 className="tool-title">Guías de resolución</h4>
            <p className="tool-desc">Procedimientos paso a paso para resolver incidencias de Windows.</p>
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
