import React, { useEffect, useState } from 'react';
import { Wrench, Trash2, CheckCircle2, AlertTriangle, Terminal, ShieldAlert } from 'lucide-react';
import { maintenanceService, TempCleanerCategory, CleanResult } from '../../services/maintenanceService';
import { formatBytes } from '../../services/systemService';

export const MaintenanceView: React.FC = () => {
  const [categories, setCategories] = useState<TempCleanerCategory[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [cleanResult, setCleanResult] = useState<CleanResult | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      const data = await maintenanceService.getTempCategories();
      setCategories(data);
      setSelectedIds(data.map((c) => c.id));
    } catch (err) {
      console.error('Error al analizar archivos temporales:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleStartClean = () => {
    if (selectedIds.length === 0) return;
    setConfirmModalOpen(true);
  };

  const handleConfirmClean = async () => {
    setConfirmModalOpen(false);
    setCleaning(true);
    setCleanResult(null);
    try {
      const result = await maintenanceService.cleanSelectedCategories(selectedIds);
      setCleanResult(result);
      fetchCategories();
    } catch (err: any) {
      alert(err?.message || 'Ocurrió un error al ejecutar la limpieza.');
    } finally {
      setCleaning(false);
    }
  };

  const totalSelectedBytes = categories
    .filter((c) => selectedIds.includes(c.id))
    .reduce((acc, c) => acc + c.sizeBytes, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} style={{ color: 'var(--accent-color)' }} />
            Mantenimiento y Optimización del Sistema
          </h3>
          <p className="section-desc">Limpieza segura de archivos temporales y guías de reparación de archivos protegidos (SFC / DISM).</p>
        </div>
      </div>

      {/* Temp Files Cleaner */}
      <div className="hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={18} style={{ color: '#faad14' }} />
              Limpiador de Archivos Temporales
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Analiza y elimina de forma segura caché residual de %TEMP% y carpetas temporales de Windows.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={handleStartClean}
            disabled={cleaning || selectedIds.length === 0}
          >
            <Trash2 size={16} />
            {cleaning ? 'Limpiando...' : `Limpiar Selección (${formatBytes(totalSelectedBytes)})`}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {categories.map((cat) => {
            const isChecked = selectedIds.includes(cat.id);
            return (
              <div key={cat.id} className="info-box" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCategory(cat.id)}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.description}</div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-color)' }}>
                  {formatBytes(cat.sizeBytes)} ({cat.itemCount} elementos)
                </div>
              </div>
            );
          })}
        </div>

        {cleanResult && (
          <div className="info-box" style={{ borderColor: '#52c41a', color: '#52c41a', marginTop: '12px' }}>
            <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {cleanResult.details}
          </div>
        )}
      </div>

      {/* SFC & DISM Windows System Repair Section */}
      <div className="hero-card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} style={{ color: 'var(--accent-color)' }} />
          Herramientas de Reparación de Sistema (SFC / DISM)
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Procedimientos para escanear y reparar corrupción en la imagen y archivos de sistema de Windows.
        </p>

        <div className="info-box">
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            1. Comprobador de Archivos de Sistema (SFC):
          </div>
          <pre className="instructions-block">sfc /scannow</pre>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Inspecciona todos los archivos protegidos del sistema y reemplaza los archivos dañados con una copia en caché.
          </p>
        </div>

        <div className="info-box">
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            2. Servicio de Mantenimiento de Imágenes (DISM):
          </div>
          <pre className="instructions-block">DISM /Online /Cleanup-Image /RestoreHealth</pre>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Repara la imagen del sistema Windows descargando componentes limpios desde Windows Update si SFC reporta errores.
          </p>
        </div>
      </div>

      {/* Explicit Safety Confirmation Modal */}
      {confirmModalOpen && (
        <div className="modal-overlay" onClick={() => setConfirmModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} />
                Confirmación de Limpieza de Archivos
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                ¿Estás seguro de que deseas eliminar permanentemente los archivos temporales seleccionados ({formatBytes(totalSelectedBytes)})?
              </p>
              <div className="info-box" style={{ borderColor: '#faad14' }}>
                <AlertTriangle size={16} style={{ color: '#faad14', display: 'inline', marginRight: '6px' }} />
                <span>Esta operación es irreversible y liberará espacio en el almacenamiento principal.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setConfirmModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleConfirmClean} style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: '#fff' }}>
                Sí, Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
