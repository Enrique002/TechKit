import React, { useState } from 'react';
import { Download, ExternalLink, Shield, Search } from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { urlService } from '../../services/urlService';
import { Tool, CategoryId } from '../../types';

interface ExternalToolsViewProps {
  onSelectTool: (tool: Tool) => void;
  selectedCategoryFilter?: CategoryId | 'all';
}

export const ExternalToolsView: React.FC<ExternalToolsViewProps> = ({
  onSelectTool,
  selectedCategoryFilter = 'all',
}) => {
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>(selectedCategoryFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allExternal = catalogService.getExternalTools();

  const filteredTools = allExternal.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenUrl = async (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (url) {
      const res = await urlService.openExternalUrl(url);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
        <div>
          <h2 className="hero-title" style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={22} style={{ color: '#faad14' }} />
            Catálogo Profesional de Herramientas Externas Recomendadas
          </h2>
          <p className="hero-sub" style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
            Selección verificada de al menos 5 herramientas reconocidas por categoría para diagnóstico, monitorización, inspección de red, seguridad y reparación.
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="hero-search-input"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              placeholder="Buscar por nombre de herramienta o función (ej. HWiNFO, Wireshark, CrystalDisk)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`btn-secondary ${filterCategory === 'all' ? 'active' : ''}`}
              style={{ fontSize: '12px' }}
              onClick={() => setFilterCategory('all')}
            >
              Todas ({allExternal.length})
            </button>
            <button
              className={`btn-secondary ${filterCategory === 'hardware' ? 'active' : ''}`}
              style={{ fontSize: '12px' }}
              onClick={() => setFilterCategory('hardware')}
            >
              Hardware
            </button>
            <button
              className={`btn-secondary ${filterCategory === 'processes' ? 'active' : ''}`}
              style={{ fontSize: '12px' }}
              onClick={() => setFilterCategory('processes')}
            >
              Procesos
            </button>
            <button
              className={`btn-secondary ${filterCategory === 'disks' ? 'active' : ''}`}
              style={{ fontSize: '12px' }}
              onClick={() => setFilterCategory('disks')}
            >
              Discos
            </button>
            <button
              className={`btn-secondary ${filterCategory === 'network' ? 'active' : ''}`}
              style={{ fontSize: '12px' }}
              onClick={() => setFilterCategory('network')}
            >
              Red
            </button>
            <button
              className={`btn-secondary ${filterCategory === 'security' ? 'active' : ''}`}
              style={{ fontSize: '12px' }}
              onClick={() => setFilterCategory('security')}
            >
              Seguridad
            </button>
            <button
              className={`btn-secondary ${filterCategory === 'maintenance' ? 'active' : ''}`}
              style={{ fontSize: '12px' }}
              onClick={() => setFilterCategory('maintenance')}
            >
              Mantenimiento
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Tool Cards */}
      <div className="tools-grid">
        {filteredTools.map((tool) => {
          const details = tool.externalDetails;

          return (
            <div
              key={tool.id}
              className="tool-card"
              onClick={() => onSelectTool(tool)}
              style={{ background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div className="tool-card-header">
                <div>
                  <h3 className="tool-title" style={{ fontSize: '16px', fontWeight: 700 }}>
                    {tool.name}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {details?.categoryDisplayName || 'Herramienta Externa'}
                  </span>
                </div>

                <span className="tag-badge tag-external">
                  {details?.licenseType.includes('Gratuit') || details?.licenseType.includes('Freeware') ? 'Gratuita' : 'Licencia / Pro'}
                </span>
              </div>

              <p className="tool-desc" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {tool.description}
              </p>

              <div className="info-box" style={{ fontSize: '11px', gap: '4px', display: 'flex', flexDirection: 'column' }}>
                <div><strong>Funciones clave:</strong> {details?.mainFeatures.slice(0, 2).join(', ')}</div>
                <div><strong>Resuelve:</strong> {details?.solvesProblems.slice(0, 1).join(', ')}</div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={12} /> {tool.permissions}
                </span>

                <button
                  className="btn-primary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={(e) => handleOpenUrl(e, tool.officialUrl)}
                >
                  <ExternalLink size={12} /> Sitio Oficial
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
