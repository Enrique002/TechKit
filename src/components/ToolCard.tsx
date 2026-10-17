import React from 'react';
import { Star } from 'lucide-react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, toolId: string) => void;
  onSelectTool: (tool: Tool) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite,
  onToggleFavorite,
  onSelectTool,
}) => {
  const getTypeBadge = (type: Tool['type']) => {
    switch (type) {
      case 'native_techkit':
        return <span className="tag-badge tag-native">Nativa TechKit</span>;
      case 'windows_builtin':
        return <span className="tag-badge tag-builtin">Windows Integrada</span>;
      case 'external_app':
        return <span className="tag-badge tag-external">Externa</span>;
      case 'technical_guide':
        return <span className="tag-badge tag-guide">Guía Técnica</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
      case 'available':
        return <span className="status-badge status-available">Disponible</span>;
      case 'pending':
        return <span className="status-badge status-pending">Próximamente</span>;
      case 'requires_download':
        return <span className="status-badge status-pending">Descarga Externa</span>;
      case 'requires_permissions':
        return <span className="status-badge status-pending">Permisos Admin</span>;
      default:
        return <span className="status-badge status-pending">No Verificado</span>;
    }
  };

  return (
    <div className="tool-card" onClick={() => onSelectTool(tool)}>
      <div className="tool-card-header">
        <h3 className="tool-title">{tool.name}</h3>
        <button
          className={`fav-star-btn ${isFavorite ? 'is-favorite' : ''}`}
          onClick={(e) => onToggleFavorite(e, tool.id)}
          title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Star size={18} fill={isFavorite ? '#faad14' : 'none'} />
        </button>
      </div>

      <p className="tool-desc">{tool.description}</p>

      <div className="tool-tags">
        {getTypeBadge(tool.type)}
        {getStatusBadge(tool.status)}
      </div>
    </div>
  );
};
