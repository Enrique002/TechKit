import React, { useState } from 'react';
import { Search, Star, Settings, Moon, Sun } from 'lucide-react';
import { CategoryId } from '../types';
import { catalogService } from '../services/catalogService';

interface HeaderProps {
  activeCategory: CategoryId;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (category: CategoryId) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  searchQuery,
  onSearchChange,
  onNavigate,
  theme,
  onToggleTheme,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const categoryInfo = catalogService.getCategoryById(activeCategory);
  const title = categoryInfo ? categoryInfo.name : 'TechKit';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    onSearchChange(val);
  };

  return (
    <header className="header">
      <div className="header-title-section">
        <h1 className="header-page-title">{title}</h1>
        <div className="status-badge-dev">
          <span className="status-dot"></span>
          <span>Fase 5 (Versión Final)</span>
        </div>
      </div>

      <form className="header-search-box" onSubmit={handleSearchSubmit}>
        <Search className="header-search-icon" size={16} />
        <input
          type="text"
          className="header-search-input"
          placeholder="Buscar herramienta, palabra clave, comando..."
          value={localSearch}
          onChange={handleInputChange}
        />
      </form>

      <div className="header-actions">
        <button
          className="icon-btn"
          title="Acceso Rápido Favoritos"
          onClick={() => onNavigate('favorites')}
        >
          <Star size={18} />
        </button>

        <button
          className="icon-btn"
          title="Cambiar Tema"
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="icon-btn"
          title="Configuración"
          onClick={() => onNavigate('settings')}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
