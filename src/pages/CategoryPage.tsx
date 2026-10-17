import React from 'react';
import { CategoryId, Tool } from '../types';
import { catalogService } from '../services/catalogService';
import { ToolCard } from '../components/ToolCard';
import { CategoryPendingView } from '../components/CategoryPendingView';
import { EmptyState } from '../components/EmptyState';
import { SystemSummaryView } from '../components/views/SystemSummaryView';
import { CpuView } from '../components/views/CpuView';
import { MemoryView } from '../components/views/MemoryView';
import { StorageView } from '../components/views/StorageView';
import { ProcessesView } from '../components/views/ProcessesView';
import { NetworkView } from '../components/views/NetworkView';
import { SecurityView } from '../components/views/SecurityView';
import { MaintenanceView } from '../components/views/MaintenanceView';

interface CategoryPageProps {
  categoryId: CategoryId;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onSelectTool: (tool: Tool) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryId,
  isFavorite,
  onToggleFavorite,
  onSelectTool,
}) => {
  const category = catalogService.getCategoryById(categoryId);
  const tools = catalogService.getToolsByCategory(categoryId);

  if (!category) {
    return (
      <div className="page-container">
        <EmptyState
          title="Categoría no encontrada"
          description="La categoría solicitada no existe en el catálogo."
        />
      </div>
    );
  }

  const renderCategorySpecialView = () => {
    switch (categoryId) {
      case 'os':
        return <SystemSummaryView />;
      case 'hardware':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <CpuView />
            <MemoryView />
          </div>
        );
      case 'disks':
        return <StorageView />;
      case 'processes':
        return <ProcessesView />;
      case 'network':
        return <NetworkView />;
      case 'security':
        return <SecurityView />;
      case 'maintenance':
        return <MaintenanceView />;
      default:
        return null;
    }
  };

  const specialView = renderCategorySpecialView();

  return (
    <div className="page-container">
      <div className="section-header-block">
        <h2 className="section-title">{category.name}</h2>
        <p className="section-desc">{category.description}</p>
      </div>

      {specialView && (
        <div style={{ marginBottom: '24px' }}>
          {specialView}
        </div>
      )}

      <div>
        <h3 className="section-title" style={{ fontSize: '15px', marginBottom: '12px' }}>
          Catálogo y Herramientas de {category.name}
        </h3>
        {tools.length === 0 ? (
          <CategoryPendingView category={category} />
        ) : (
          <div className="tools-grid">
            {tools.map((tool) => (
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
