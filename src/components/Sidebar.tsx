import React from 'react';
import {
  Home,
  Activity,
  Terminal,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  ShieldCheck,
  Wrench,
  Download,
  BookOpen,
  Star,
  Clock,
  Settings,
  LucideProps,
} from 'lucide-react';
import { CategoryId } from '../types';
import { catalogService } from '../services/catalogService';

interface SidebarProps {
  activeCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  favoriteCount: number;
  recentCount: number;
}

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Home,
  Activity,
  Terminal,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  ShieldCheck,
  Wrench,
  Download,
  BookOpen,
  Star,
  Clock,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onSelectCategory,
  favoriteCount,
  recentCount,
}) => {
  const categories = catalogService.getCategories();

  const renderIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Terminal;
    return <IconComponent size={18} />;
  };

  const mainCategories = categories.filter((c) => !c.isMainSection);
  const quickCategories = categories.filter((c) => c.isMainSection);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Terminal size={22} />
        </div>
        <span className="brand-title">TechKit</span>
        <span className="brand-phase">Pro</span>
      </div>

      <nav className="sidebar-nav">
        {/* Quick Access */}
        <div className="nav-section-title">Navegación Principal</div>
        {quickCategories
          .filter((c) => c.id === 'home' || c.id === 'favorites' || c.id === 'recent')
          .map((cat) => {
            const isActive = activeCategory === cat.id;
            let badgeCount: number | null = null;
            if (cat.id === 'favorites') badgeCount = favoriteCount;
            if (cat.id === 'recent') badgeCount = recentCount;

            return (
              <button
                key={cat.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <span className="nav-item-icon">{renderIcon(cat.iconName)}</span>
                <span>{cat.name}</span>
                {badgeCount !== null && badgeCount > 0 && (
                  <span className="nav-item-badge">{badgeCount}</span>
                )}
              </button>
            );
          })}

        {/* Categories */}
        <div className="nav-section-title">Suite de Herramientas</div>
        {mainCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const toolCount = catalogService.getToolsByCategory(cat.id).length;

          return (
            <button
              key={cat.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="nav-item-icon">{renderIcon(cat.iconName)}</span>
              <span>{cat.name}</span>
              {toolCount > 0 && (
                <span className="nav-item-badge">{toolCount}</span>
              )}
            </button>
          );
        })}

        {/* Settings */}
        <div className="nav-section-title">Sistema</div>
        {quickCategories
          .filter((c) => c.id === 'settings')
          .map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <span className="nav-item-icon">{renderIcon(cat.iconName)}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
      </nav>
    </aside>
  );
};
