import React from 'react';
import { Clock, Hammer } from 'lucide-react';
import { CategoryInfo } from '../types';

interface CategoryPendingViewProps {
  category: CategoryInfo;
}

export const CategoryPendingView: React.FC<CategoryPendingViewProps> = ({ category }) => {
  return (
    <div className="empty-state" style={{ padding: '60px 32px' }}>
      <div className="empty-icon" style={{ color: '#faad14' }}>
        <Hammer size={52} />
      </div>
      <h3 className="empty-title" style={{ fontSize: '18px' }}>
        Sección: {category.name}
      </h3>
      <p className="empty-description" style={{ maxWidth: '520px', margin: '8px 0 16px 0' }}>
        El contenido y las herramientas nativas de diagnóstico para <strong>{category.name}</strong> están pendientes de desarrollo para las siguientes fases del proyecto.
      </p>
      <div
        className="info-box"
        style={{
          maxWidth: '500px',
          textAlign: 'left',
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#faad14', fontWeight: 600, marginBottom: '6px' }}>
          <Clock size={16} /> Estado del desarrollo (Fase 2)
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Esta categoría cuenta con su estructura preparada. En las fases 3, 4 y 5 se incorporarán las utilidades de red, gestión de procesos y seguridad.
        </p>
      </div>
    </div>
  );
};
