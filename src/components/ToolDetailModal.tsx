import React from 'react';
import { X, Star, ExternalLink, Clock } from 'lucide-react';
import { Tool } from '../types';
import { urlService } from '../services/urlService';

interface ToolDetailModalProps {
  tool: Tool | null;
  isOpen: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (toolId: string) => void;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
  tool,
  isOpen,
  isFavorite,
  onClose,
  onToggleFavorite,
}) => {
  if (!isOpen || !tool) return null;

  const getTypeLabel = (type: Tool['type']) => {
    switch (type) {
      case 'native_techkit':
        return 'Utilidad Nativa TechKit';
      case 'windows_builtin':
        return 'Herramienta Integrada de Windows';
      case 'external_app':
        return 'Programa Externo Descargable';
      case 'technical_guide':
        return 'Guía / Procedimiento Técnico';
    }
  };

  const getStatusLabel = (status: Tool['status']) => {
    switch (status) {
      case 'available':
        return 'Disponible en esta versión';
      case 'pending':
        return 'Herramienta en ampliación';
      case 'requires_download':
        return 'Requiere descarga externa desde sitio oficial';
      case 'requires_permissions':
        return 'Requiere permisos elevados de Administrador';
      default:
        return 'Disponibilidad no verificada';
    }
  };

  const handleExternalClick = async () => {
    if (tool.officialUrl) {
      const res = await urlService.openExternalUrl(tool.officialUrl);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="section-title" style={{ fontSize: '18px' }}>
              {tool.name}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {getTypeLabel(tool.type)}
            </span>
          </div>
          <button className="icon-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {tool.description}
          </p>

          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Categoría</span>
              <span className="info-value">{tool.category}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estado</span>
              <span className="info-value">{getStatusLabel(tool.status)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Compatibilidad</span>
              <span className="info-value">{tool.compatibility}</span>
            </div>
            {tool.permissions && (
              <div className="info-row">
                <span className="info-label">Permisos</span>
                <span className="info-value">{tool.permissions}</span>
              </div>
            )}
          </div>

          {tool.status === 'pending' && (
            <div
              className="info-box"
              style={{
                backgroundColor: 'rgba(250, 173, 20, 0.08)',
                borderColor: 'rgba(250, 173, 20, 0.3)',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <Clock size={18} style={{ color: '#faad14', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#faad14', display: 'block', marginBottom: '2px' }}>
                  Herramienta en catálogo extendido
                </strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Esta función dispone de ficha técnica y enlace oficial en nuestro catálogo de recursos recomendados.
                </p>
              </div>
            </div>
          )}

          {tool.instructions && (
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Instrucciones / Información de Uso
              </h4>
              <pre className="instructions-block">{tool.instructions}</pre>
            </div>
          )}

          {tool.keywords.length > 0 && (
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Palabras clave asociadas
              </h4>
              <div className="keywords-cloud">
                {tool.keywords.map((kw, i) => (
                  <span key={i} className="keyword-btn" style={{ cursor: 'default' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={() => onToggleFavorite(tool.id)}
          >
            <Star
              size={16}
              fill={isFavorite ? '#faad14' : 'none'}
              color={isFavorite ? '#faad14' : 'currentColor'}
            />
            {isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          </button>

          {tool.officialUrl && (
            <button className="btn-primary" onClick={handleExternalClick}>
              <ExternalLink size={16} />
              Ir a Sitio Oficial
            </button>
          )}

          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
