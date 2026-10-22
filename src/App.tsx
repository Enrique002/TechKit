import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CategoryId, Tool, UserSettings } from './types';
import { catalogService } from './services/catalogService';
import { storageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToolDetailModal } from './components/ToolDetailModal';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { RecentPage } from './pages/RecentPage';
import { SettingsPage } from './pages/SettingsPage';
import './styles/index.css';

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentToolIds, setRecentToolIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Load initial data from storageService
  useEffect(() => {
    setFavorites(storageService.getFavorites());
    setRecentToolIds(storageService.getRecent().map((r) => r.toolId));
    const loadedSettings = storageService.getSettings();
    setSettings(loadedSettings);
    document.documentElement.setAttribute('data-theme', loadedSettings.theme);
  }, []);

  // Sync theme attribute whenever theme changes
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = storageService.saveSettings({ theme: nextTheme });
    setSettings(updated);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = storageService.saveSettings(newSettings);
    setSettings(updated);
    if (newSettings.theme) {
      document.documentElement.setAttribute('data-theme', newSettings.theme);
    }
  };

  const handleResetSettingsAndData = () => {
    if (window.confirm('¿Seguro que deseas restablecer todas las preferencias y borrar los favoritos e historial local?')) {
      storageService.clearAllData();
      const def = storageService.getSettings();
      setSettings(def);
      setFavorites([]);
      setRecentToolIds([]);
      document.documentElement.setAttribute('data-theme', def.theme);
    }
  };

  const handleToggleFavorite = (e?: React.MouseEvent | string, toolIdArg?: string) => {
    let id: string;
    if (typeof e === 'string') {
      id = e;
    } else if (e && toolIdArg) {
      e.stopPropagation();
      id = toolIdArg;
    } else {
      return;
    }

    storageService.toggleFavorite(id);
    setFavorites(storageService.getFavorites());
  };

  const handleSelectTool = (tool: Tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
    storageService.addRecent(tool.id);
    setRecentToolIds(storageService.getRecent().map((r) => r.toolId));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchKeyword = (keyword: string) => {
    setSearchQuery(keyword);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearRecent = () => {
    storageService.clearRecent();
    setRecentToolIds([]);
  };

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);
  const isFavorite = useCallback((toolId: string) => favoritesSet.has(toolId), [favoritesSet]);

  // Memoized computations using Set and O(1) Map lookups to avoid re-scanning full catalog on every render.
  const favoriteTools = useMemo(
    () => catalogService.getAllTools().filter((t) => favoritesSet.has(t.id)),
    [favoritesSet]
  );

  const recentTools = useMemo(
    () =>
      recentToolIds
        .map((id) => catalogService.getToolById(id))
        .filter((t): t is Tool => Boolean(t)),
    [recentToolIds]
  );

  // Search results calculation memoized by search query
  const searchResults = useMemo(
    () => (searchQuery.trim().length > 0 ? catalogService.searchTools({ query: searchQuery }) : []),
    [searchQuery]
  );

  const renderCurrentView = () => {
    if (searchQuery.trim().length > 0) {
      return (
        <SearchPage
          query={searchQuery}
          searchResults={searchResults}
          isFavorite={isFavorite}
          onToggleFavorite={(e, id) => handleToggleFavorite(e, id)}
          onSelectTool={handleSelectTool}
          onClearSearch={handleClearSearch}
          onSearchKeyword={handleSearchKeyword}
        />
      );
    }

    switch (activeCategory) {
      case 'home':
        return (
          <Home
            favoriteTools={favoriteTools}
            recentTools={recentTools}
            isFavorite={isFavorite}
            onToggleFavorite={(e, id) => handleToggleFavorite(e, id)}
            onSelectTool={handleSelectTool}
            onNavigateCategory={(cat) => setActiveCategory(cat)}
            onSearchKeyword={handleSearchKeyword}
          />
        );

      case 'favorites':
        return (
          <FavoritesPage
            favoriteTools={favoriteTools}
            isFavorite={isFavorite}
            onToggleFavorite={(e, id) => handleToggleFavorite(e, id)}
            onSelectTool={handleSelectTool}
            onExploreCatalog={() => setActiveCategory('hardware')}
          />
        );

      case 'recent':
        return (
          <RecentPage
            recentTools={recentTools}
            isFavorite={isFavorite}
            onToggleFavorite={(e, id) => handleToggleFavorite(e, id)}
            onSelectTool={handleSelectTool}
            onClearRecent={handleClearRecent}
            onExploreCatalog={() => setActiveCategory('home')}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSettingsAndData={handleResetSettingsAndData}
          />
        );

      default:
        return (
          <CategoryPage
            categoryId={activeCategory}
            isFavorite={isFavorite}
            onToggleFavorite={(e, id) => handleToggleFavorite(e, id)}
            onSelectTool={handleSelectTool}
            onNavigateCategory={(cat) => setActiveCategory(cat)}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
        }}
        favoriteCount={favoriteTools.length}
        recentCount={recentTools.length}
      />

      <div className="main-wrapper">
        <Header
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onNavigate={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
        />

        {renderCurrentView()}
      </div>

      <ToolDetailModal
        tool={selectedTool}
        isOpen={isModalOpen}
        isFavorite={selectedTool ? isFavorite(selectedTool.id) : false}
        onClose={() => setIsModalOpen(false)}
        onToggleFavorite={(id) => handleToggleFavorite(id)}
      />
    </div>
  );
};

export default App;
