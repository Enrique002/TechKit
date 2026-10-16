import React from 'react';
import { Tool } from '../types';
import { ToolCard } from '../components/ToolCard';
import { EmptyState } from '../components/EmptyState';
import { POPULAR_KEYWORDS } from '../data/toolsData';

interface SearchPageProps {
  query: string;
  searchResults: Tool[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onSelectTool: (tool: Tool) => void;
  onClearSearch: () => void;
  onSearchKeyword: (kw: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  query,
  searchResults,
  isFavorite,
  onToggleFavorite,
  onSelectTool,
  onClearSearch,
  onSearchKeyword,
}) => {
  return (
    <div className="page-container">
      <div className="section-header-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="section-title">Resultados de Búsqueda</h2>
          <p className="section-desc">
            Se encontraron {searchResults.length} resultados para "{query}"
          </p>
        </div>
        <button className="btn-secondary" onClick={onClearSearch}>
          Limpiar Búsqueda
        </button>
      </div>

      <div className="keywords-cloud" style={{ marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Filtrar sugerencia:</span>
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

      {searchResults.length === 0 ? (
        <EmptyState
          icon="search"
          title="No se encontraron coincidencias"
          description={`No existen herramientas o guías que coincidan con "${query}". Prueba con otra palabra clave como 'procesador', 'RAM', 'almacenamiento' o 'disco'.`}
          actionLabel="Ver todo el catálogo"
          onAction={onClearSearch}
        />
      ) : (
        <div className="tools-grid">
          {searchResults.map((tool) => (
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
  );
};
