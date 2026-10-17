import React, { useState } from 'react';
import { FileMetadata } from '../../types';
import { fileSecurityService } from '../../services/fileSecurityService';
import { formatBytes } from '../../services/systemService';
import { Info, FileCode, FileText } from 'lucide-react';

export const FileMetadataView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await fetchMetadata(file);
    }
  };

  const fetchMetadata = async (target: File | string) => {
    setLoading(true);
    try {
      const res = await fileSecurityService.getFileMetadata(target);
      setMetadata(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <Info className="accent-text" size={24} />
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Consulta de Metadatos de Archivo</h3>
          <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>
            Lee cabeceras y propiedades de versión, fabricante y sistema de archivos sin ejecutar el archivo.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} />
          Seleccionar Archivo
          <input type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
        </label>

        <span className="text-secondary" style={{ fontSize: '13px' }}>
          {selectedFile ? `Archivo: ${selectedFile.name}` : 'Elija un ejecutable, DLL o documento local'}
        </span>
      </div>

      {loading && (
        <div style={{ color: 'var(--accent-color)', fontSize: '14px' }}>
          Inspeccionando cabecera y metadatos...
        </div>
      )}

      {metadata && (
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Nombre</span>
              <strong style={{ fontSize: '14px' }}>{metadata.name}</strong>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Tamaño</span>
              <span style={{ fontSize: '14px' }}>{formatBytes(metadata.sizeBytes)}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Tipo / Categoría</span>
              <span style={{ fontSize: '14px', color: 'var(--accent-color)' }}>{metadata.fileType}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Fecha Creación</span>
              <span style={{ fontSize: '13px' }}>{metadata.createdDate}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Fecha Modificación</span>
              <span style={{ fontSize: '13px' }}>{metadata.modifiedDate}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Fabricante / Editor</span>
              <span style={{ fontSize: '13px' }}>{metadata.publisher || 'Sin información de fabricante'}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Versión de Archivo</span>
              <span style={{ fontSize: '13px' }}>{metadata.fileVersion || 'N/A'}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Descripción de Producto</span>
              <span style={{ fontSize: '13px' }}>{metadata.productDescription || 'N/A'}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={18} className="accent-text" />
            <span className="text-secondary" style={{ fontSize: '13px' }}>
              {metadata.notes}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
