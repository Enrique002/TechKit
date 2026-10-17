import React, { useState } from 'react';
import { FileComparisonResult } from '../../types';
import { fileSecurityService } from '../../services/fileSecurityService';
import { formatBytes } from '../../services/systemService';
import { GitCompare, FileText, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const FileCompareView: React.FC = () => {
  const [file1, setFile1] = useState<File | string | null>(null);
  const [file2, setFile2] = useState<File | string | null>(null);
  const [comparison, setComparison] = useState<FileComparisonResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFile1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile1(e.target.files[0]);
      setComparison(null);
    }
  };

  const handleFile2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile2(e.target.files[0]);
      setComparison(null);
    }
  };

  const executeCompare = async () => {
    if (!file1 || !file2) return;
    setLoading(true);
    try {
      const res = await fileSecurityService.compareFiles(file1, file2);
      setComparison(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <GitCompare className="accent-text" size={24} />
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Comparación Directa de Archivos</h3>
          <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>
            Compara dos archivos analizando sus tamaños y sus huellas digitales SHA-256 reales.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* File 1 Slot */}
        <div style={{ background: 'var(--bg-card-hover)', border: '1px dashed var(--border-color)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong>Primer Archivo</strong>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', textAlign: 'center' }}>
            <FileText size={16} style={{ marginRight: '6px' }} />
            {file1 ? (typeof file1 === 'string' ? file1 : file1.name) : 'Seleccionar Archivo 1'}
            <input type="file" onChange={handleFile1Change} style={{ display: 'none' }} />
          </label>
          {file1 && typeof file1 !== 'string' && (
            <span className="text-secondary" style={{ fontSize: '12px' }}>
              Tamaño: {formatBytes(file1.size)}
            </span>
          )}
        </div>

        {/* File 2 Slot */}
        <div style={{ background: 'var(--bg-card-hover)', border: '1px dashed var(--border-color)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <strong>Segundo Archivo</strong>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', textAlign: 'center' }}>
            <FileText size={16} style={{ marginRight: '6px' }} />
            {file2 ? (typeof file2 === 'string' ? file2 : file2.name) : 'Seleccionar Archivo 2'}
            <input type="file" onChange={handleFile2Change} style={{ display: 'none' }} />
          </label>
          {file2 && typeof file2 !== 'string' && (
            <span className="text-secondary" style={{ fontSize: '12px' }}>
              Tamaño: {formatBytes(file2.size)}
            </span>
          )}
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={executeCompare}
        disabled={!file1 || !file2 || loading}
        style={{ alignSelf: 'flex-start', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowRight size={16} />
        {loading ? 'Comparando Contenidos...' : 'Comparar Archivos'}
      </button>

      {comparison && (
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {comparison.areIdentical ? (
              <CheckCircle2 size={24} style={{ color: '#10b981' }} />
            ) : (
              <XCircle size={24} style={{ color: '#ef4444' }} />
            )}
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', color: comparison.areIdentical ? '#10b981' : '#ef4444' }}>
                {comparison.areIdentical ? 'Archivos Idénticos' : 'Los archivos NO son idénticos'}
              </h4>
              <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>{comparison.details}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Coincidencia de Tamaños</span>
              <span style={{ fontSize: '13px', color: comparison.sizesMatch ? '#10b981' : '#ef4444' }}>
                {comparison.sizesMatch ? 'Mismo tamaño exacto' : 'Tamaños distintos'}
              </span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Coincidencia de Hashes (SHA-256)</span>
              <span style={{ fontSize: '13px', color: comparison.hashesMatch ? '#10b981' : '#ef4444' }}>
                {comparison.hashesMatch ? 'Hashes SHA-256 idénticos' : 'Hashes SHA-256 distintos'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
