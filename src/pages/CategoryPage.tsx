import React, { useState } from 'react';
import { CategoryId, Tool } from '../types';
import { catalogService } from '../services/catalogService';
import { ToolCard } from '../components/ToolCard';
import { CategoryPendingView } from '../components/CategoryPendingView';
import { EmptyState } from '../components/EmptyState';
import { SystemSummaryView } from '../components/views/SystemSummaryView';
import { CpuView } from '../components/views/CpuView';
import { MemoryView } from '../components/views/MemoryView';
import { StorageView } from '../components/views/StorageView';

// Phase 4 Views
import { FileAnalysisView } from '../components/views/FileAnalysisView';
import { HashIntegrityView } from '../components/views/HashIntegrityView';
import { FileCompareView } from '../components/views/FileCompareView';
import { FileMetadataView } from '../components/views/FileMetadataView';
import { DigitalSignatureView } from '../components/views/DigitalSignatureView';
import { DefenderStatusView } from '../components/views/DefenderStatusView';
import { SystemMaintenanceView } from '../components/views/SystemMaintenanceView';
import { TempCleanerView } from '../components/views/TempCleanerView';

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

  const [activeSecTab, setActiveSecTab] = useState<'analysis' | 'hash' | 'compare' | 'metadata' | 'signature' | 'defender'>('analysis');
  const [activeMaintTab, setActiveMaintTab] = useState<'sfc_dism' | 'temp'>('sfc_dism');

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

      case 'security':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Security Tabs Header */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <button
                className={`btn ${activeSecTab === 'analysis' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveSecTab('analysis')}
                style={{ fontSize: '13px' }}
              >
                Análisis de Archivo
              </button>

              <button
                className={`btn ${activeSecTab === 'hash' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveSecTab('hash')}
                style={{ fontSize: '13px' }}
              >
                Hashes e Integridad
              </button>

              <button
                className={`btn ${activeSecTab === 'compare' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveSecTab('compare')}
                style={{ fontSize: '13px' }}
              >
                Comparar Archivos
              </button>

              <button
                className={`btn ${activeSecTab === 'metadata' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveSecTab('metadata')}
                style={{ fontSize: '13px' }}
              >
                Metadatos
              </button>

              <button
                className={`btn ${activeSecTab === 'signature' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveSecTab('signature')}
                style={{ fontSize: '13px' }}
              >
                Firmas Digitales
              </button>

              <button
                className={`btn ${activeSecTab === 'defender' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveSecTab('defender')}
                style={{ fontSize: '13px' }}
              >
                Microsoft Defender
              </button>
            </div>

            {/* Tab Views */}
            {activeSecTab === 'analysis' && <FileAnalysisView />}
            {activeSecTab === 'hash' && <HashIntegrityView />}
            {activeSecTab === 'compare' && <FileCompareView />}
            {activeSecTab === 'metadata' && <FileMetadataView />}
            {activeSecTab === 'signature' && <DigitalSignatureView />}
            {activeSecTab === 'defender' && <DefenderStatusView />}
          </div>
        );

      case 'maintenance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <button
                className={`btn ${activeMaintTab === 'sfc_dism' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveMaintTab('sfc_dism')}
                style={{ fontSize: '13px' }}
              >
                Herramientas SFC y DISM
              </button>

              <button
                className={`btn ${activeMaintTab === 'temp' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveMaintTab('temp')}
                style={{ fontSize: '13px' }}
              >
                Limpieza de Temporales
              </button>
            </div>

            {activeMaintTab === 'sfc_dism' && <SystemMaintenanceView />}
            {activeMaintTab === 'temp' && <TempCleanerView />}
          </div>
        );

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
