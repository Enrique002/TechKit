import React from 'react';
import { Trash2 } from 'lucide-react';
import { Tool } from '../types';
import { ToolCard } from '../components/ToolCard';
import { EmptyState } from '../components/EmptyState';

interface RecentPageProps {
  recentTools: Tool[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onSelectTool: (tool: Tool) => void;
  onClearRecent: () => void;
  onExploreCatalog: () => void;
}

export const RecentPage: React.FC<RecentPageProps> = ({
  recentTools,
  isFavorite,
  onToggleFavorite,
  onSelectTool,
  onClearRecent,
  onExploreCatalog,
}) => {
  return (
    <div className="page-container">
      <div className="section-header-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="section-title">Historial Reciente</h2>
          <p className="section-desc">
            Herramientas e instructivos abiertos recientemente durante esta o pasadas sesiones.
          </p>
        </div>
        {recentTools.length > 0 && (
          <button className="btn-secondary" onClick={onClearRecent}>
            <Trash2 size={16} /> Limpiar Historial
          </button>
        )}
      </div>

      {recentTools.length === 0 ? (
        <EmptyState
          title="Sin elementos en el historial"
          description="Al hacer clic y revisar fichas de herramientas o guías técnicas, se registrarán aquí automáticamente."
          actionLabel="Ir al Inicio"
          onAction={onExploreCatalog}
        />
      ) : (
        <div className="tools-grid">
          {recentTools.map((tool) => (
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
