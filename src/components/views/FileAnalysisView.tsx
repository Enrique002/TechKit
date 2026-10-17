import React, { useState } from 'react';
import { FileAnalysisInfo } from '../../types';
import { fileSecurityService } from '../../services/fileSecurityService';
import { formatBytes } from '../../services/systemService';
import { FileText, AlertTriangle, CheckCircle2, FileSearch, ShieldAlert } from 'lucide-react';

export const FileAnalysisView: React.FC = () => {
  const [manualPath, setManualPath] = useState<string>('');
  const [analysisInfo, setAnalysisInfo] = useState<FileAnalysisInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setManualPath(file.name);
      await analyze(file);
    }
  };

  const analyze = async (target: File | string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fileSecurityService.analyzeFile(target);
      setAnalysisInfo(res);
    } catch (err: any) {
      setError(`Error al analizar el archivo: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPath.trim()) return;
    await analyze(manualPath.trim());
  };

  return (
    <div className="card-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <FileSearch className="accent-text" size={24} />
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Análisis y Diagnóstico de Archivos</h3>
          <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>
            Examina la ruta, extensión, tamaño, fecha y tipo real identificado mediante contenido.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} />
            Seleccionar Archivo Local
            <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          <span className="text-secondary" style={{ fontSize: '13px' }}>o introduzca una ruta de archivo:</span>
        </div>

        <form onSubmit={handleManualAnalyze} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="search-input"
            style={{ flex: 1, padding: '8px 12px' }}
            placeholder="Ejemplo: C:\Windows\System32\cmd.exe"
            value={manualPath}
            onChange={(e) => setManualPath(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" disabled={loading || !manualPath.trim()}>
            {loading ? 'Analizando...' : 'Analizar Ruta'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '6px', color: '#ef4444', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {analysisInfo && (
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Nombre</span>
              <strong style={{ fontSize: '14px', wordBreak: 'break-all' }}>{analysisInfo.name}</strong>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Tamaño</span>
              <span style={{ fontSize: '14px' }}>{formatBytes(analysisInfo.sizeBytes)} ({analysisInfo.sizeBytes.toLocaleString()} bytes)</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Extensión Declarada</span>
              <span style={{ fontSize: '14px', textTransform: 'uppercase' }}>.{analysisInfo.extension || 'Sin extensión'}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Tipo Identificado (MIME)</span>
              <span style={{ fontSize: '14px', color: 'var(--accent-color)' }}>{analysisInfo.identifiedMimeType}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Fecha Modificación</span>
              <span style={{ fontSize: '13px' }}>{analysisInfo.modifiedDate}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Estado de Acceso</span>
              <span className="badge badge-success" style={{ fontSize: '12px' }}>{analysisInfo.accessStatus}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {analysisInfo.extensionMimeMatch ? (
                <CheckCircle2 size={18} style={{ color: '#10b981' }} />
              ) : (
                <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              )}
              <strong style={{ fontSize: '14px' }}>
                {analysisInfo.extensionMimeMatch
                  ? 'Coincidencia entre extensión y tipo de contenido'
                  : 'Atención: Discrepancia entre la extensión y el contenido real'}
              </strong>
            </div>

            <p className="text-secondary" style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
              {analysisInfo.accessNotes}
            </p>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>
              Aviso de Seguridad: No considere que un archivo es seguro únicamente porque su extensión parezca legítima.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
