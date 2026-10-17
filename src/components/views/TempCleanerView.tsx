import React, { useState, useEffect } from 'react';
import { TempScanPreview, TempCleanResult } from '../../types';
import { maintenanceService } from '../../services/maintenanceService';
import { formatBytes } from '../../services/systemService';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, ListCheck } from 'lucide-react';

export const TempCleanerView: React.FC = () => {
  const [scanPreview, setScanPreview] = useState<TempScanPreview | null>(null);
  const [cleanResult, setCleanResult] = useState<TempCleanResult | null>(null);
  const [loadingScan, setLoadingScan] = useState<boolean>(true);
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    runScan();
  }, []);

  const runScan = async () => {
    setLoadingScan(true);
    setCleanResult(null);
    try {
      const res = await maintenanceService.scanTempFiles();
      setScanPreview(res);
      setSelectedIds(res.candidates.map((c) => c.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScan(false);
    }
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmClean = async () => {
    setShowConfirmModal(false);
    setCleaning(true);
    try {
      const res = await maintenanceService.cleanTempFiles(selectedIds);
      setCleanResult(res);
      await runScan();
    } catch (err) {
      console.error(err);
    } finally {
      setCleaning(false);
    }
  };

  const selectedSizeBytes = scanPreview
    ? scanPreview.candidates
        .filter((c) => selectedIds.includes(c.id))
        .reduce((acc, c) => acc + c.sizeBytes, 0)
    : 0;

  return (
    <div className="card-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trash2 className="accent-text" size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Limpieza Controlada de Archivos Temporales</h3>
            <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>
              Identificación y eliminación segura de elementos en carpetas temporales explícitamente permitidas (%TEMP%, Windows\Temp).
            </p>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={runScan} disabled={loadingScan || cleaning} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} className={loadingScan ? 'spinning' : ''} />
          Escanear Temporales
        </button>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShieldCheck size={20} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
        <span style={{ fontSize: '13px' }}>
          TechKit <strong>no realiza limpieza indiscriminada del disco</strong>. No se borran documentos personales, descargas ni archivos de usuario fuera de ubicaciones temporales estándar.
        </span>
      </div>

      {loadingScan && (
        <div style={{ color: 'var(--accent-color)', fontSize: '14px' }}>
          Escaneando ubicaciones temporales permitidas y calculando espacio ocupado...
        </div>
      )}

      {scanPreview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Espacio Candidato</span>
              <strong style={{ fontSize: '16px', color: 'var(--accent-color)' }}>{formatBytes(scanPreview.totalSizeBytes)}</strong>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Total de Elementos</span>
              <strong style={{ fontSize: '16px' }}>{scanPreview.totalFiles.toLocaleString()} archivos</strong>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Archivos Bloqueados Omitidos</span>
              <strong style={{ fontSize: '16px', color: '#f59e0b' }}>{scanPreview.omittedLockedFilesCount} omitidos</strong>
            </div>
          </div>

          {/* Item Candidates Table / List */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--bg-card-hover)', padding: '12px 16px', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListCheck size={16} />
              Vista Previa de Elementos Candidatos a Limpieza
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {scanPreview.candidates.map((cand) => {
                const isSelected = selectedIds.includes(cand.id);
                return (
                  <div key={cand.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCandidate(cand.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div>
                        <strong style={{ fontSize: '14px', display: 'block' }}>{cand.name}</strong>
                        <code style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cand.path}</code>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>{formatBytes(cand.sizeBytes)}</span>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>{cand.fileCount} elementos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              Espacio seleccionado para liberar: <span className="accent-text">{formatBytes(selectedSizeBytes)}</span>
            </span>

            <button
              className="btn btn-primary"
              onClick={() => setShowConfirmModal(true)}
              disabled={selectedIds.length === 0 || cleaning}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Trash2 size={16} />
              Ejecutar Limpieza Seleccionada
            </button>
          </div>

          {cleanResult && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '16px', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px' }}>
                <CheckCircle2 size={18} />
                Limpieza Finalizada con Éxito
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)' }}>
                Se han liberado <strong>{formatBytes(cleanResult.bytesFreed)}</strong> eliminando <strong>{cleanResult.filesDeleted}</strong> archivos.
              </p>
              {cleanResult.skippedDetails.length > 0 && (
                <span className="text-secondary" style={{ fontSize: '12px' }}>
                  Nota: {cleanResult.skippedDetails.join(' ')}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Confirmación de Limpieza de Temporales</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              Se eliminarán únicamente los archivos contenidos en las carpetas temporales seleccionadas:
            </p>

            <div style={{ background: 'var(--bg-main)', padding: '12px', borderRadius: '6px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span><strong>Ubicaciones:</strong> {selectedIds.length} categorías seleccionadas</span>
              <span><strong>Estimación a Liberar:</strong> ~{formatBytes(selectedSizeBytes)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '12px' }}>
              <AlertTriangle size={16} />
              Se re-validarán las rutas inmediatamente antes de proceder a la eliminación.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleConfirmClean} style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                Confirmar y Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
