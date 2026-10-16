import React from 'react';
import { Tool } from '../types';
import { ToolCard } from '../components/ToolCard';
import { EmptyState } from '../components/EmptyState';

interface FavoritesPageProps {
  favoriteTools: Tool[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onSelectTool: (tool: Tool) => void;
  onExploreCatalog: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favoriteTools,
  isFavorite,
  onToggleFavorite,
  onSelectTool,
  onExploreCatalog,
}) => {
  return (
    <div className="page-container">
      <div className="section-header-block">
        <h2 className="section-title">Herramientas Favoritas</h2>
        <p className="section-desc">
          Colección personal de accesos directos guardados para un trabajo más ágil.
        </p>
      </div>

      {favoriteTools.length === 0 ? (
        <EmptyState
          title="Tu lista de favoritos está vacía"
          description="Marca la estrella en las herramientas o utilidades que más utilices en tu día a día para tenerlas siempre a mano aquí."
          actionLabel="Explorar Catálogo"
          onAction={onExploreCatalog}
        />
      ) : (
        <div className="tools-grid">
          {favoriteTools.map((tool) => (
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
