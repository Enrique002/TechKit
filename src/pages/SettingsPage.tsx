import React from 'react';
import { RotateCcw, Moon, Sun } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetSettingsAndData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetSettingsAndData,
}) => {
  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="section-header-block">
        <h2 className="section-title">Configuración y Preferencias</h2>
        <p className="section-desc">
          Personaliza la apariencia y el comportamiento visual de TechKit.
        </p>
      </div>

      {/* Theme Settings */}
      <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Apariencia Visual</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Selecciona la paleta de color para la interfaz. El tema oscuro es el recomendado para entornos técnicos.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            className={`btn-secondary ${settings.theme === 'dark' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            style={{
              flex: 1,
              padding: '12px',
              justifyContent: 'center',
              borderColor: settings.theme === 'dark' ? 'var(--accent-color)' : 'var(--border-color)',
            }}
          >
            <Moon size={18} /> Tema Oscuro (Predeterminado)
          </button>

          <button
            className={`btn-secondary ${settings.theme === 'light' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ theme: 'light' })}
            style={{
              flex: 1,
              padding: '12px',
              justifyContent: 'center',
              borderColor: settings.theme === 'light' ? 'var(--accent-color)' : 'var(--border-color)',
            }}
          >
            <Sun size={18} /> Tema Claro
          </button>
        </div>
      </div>

      {/* Interface preferences */}
      <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Opciones de Catálogo</h3>

        <div className="info-box">
          <div className="info-row" style={{ alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                Mostrar catálogo de herramientas adicionales
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Incluye en la lista utilidades sugeridas y enlaces oficiales de descarga.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showPendingTools}
              onChange={(e) => onUpdateSettings({ showPendingTools: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Reset & Version Info */}
      <div className="hero-card" style={{ background: 'var(--bg-secondary)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Información de la Aplicación</h3>

        <div className="info-box">
          <div className="info-row">
            <span className="info-label">Versión de TechKit</span>
            <span className="info-value">1.0.0 Pro</span>
          </div>
          <div className="info-row">
            <span className="info-label">Entorno Frontend</span>
            <span className="info-value">React + TypeScript + Vite</span>
          </div>
          <div className="info-row">
            <span className="info-label">Motor de Escritorio</span>
            <span className="info-value">Tauri 2 (Rust sysinfo nativo)</span>
          </div>
        </div>

        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn-secondary" onClick={onResetSettingsAndData} style={{ color: '#ff4d4f' }}>
            <RotateCcw size={16} /> Restablecer Preferencias y Datos Locales
          </button>
        </div>
      </div>
    </div>
  );
};
