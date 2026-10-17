import React, { useState } from 'react';
import { DigitalSignatureInfo } from '../../types';
import { fileSecurityService } from '../../services/fileSecurityService';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, HelpCircle, FileText } from 'lucide-react';

export const DigitalSignatureView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signatureInfo, setSignatureInfo] = useState<DigitalSignatureInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await verifySignature(file);
    }
  };

  const verifySignature = async (target: File | string) => {
    setLoading(true);
    try {
      const res = await fileSecurityService.verifyDigitalSignature(target);
      setSignatureInfo(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
            <CheckCircle2 size={20} />
            <span style={{ fontWeight: 600, fontSize: '15px' }}>Firma Digital Válida</span>
          </div>
        );
      case 'invalid':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
            <XCircle size={20} />
            <span style={{ fontWeight: 600, fontSize: '15px' }}>Firma Inválida o Alterada</span>
          </div>
        );
      case 'unsigned':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 600, fontSize: '15px' }}>Archivo Sin Firma Digital</span>
          </div>
        );
      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <HelpCircle size={20} />
            <span style={{ fontWeight: 600, fontSize: '15px' }}>Estado Desconocido / No Verificable</span>
          </div>
        );
    }
  };

  return (
    <div className="card-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <ShieldCheck className="accent-text" size={24} />
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Verificación de Firmas Digitales</h3>
          <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>
            Comprueba certificados PKCS#7 y cadena de confianza de ejecutables (.exe, .dll) en Windows.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} />
          Seleccionar Ejecutable o Librería
          <input type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
        </label>

        <span className="text-secondary" style={{ fontSize: '13px' }}>
          {selectedFile ? `Archivo: ${selectedFile.name}` : 'Seleccione un archivo ejecutable (.exe / .dll)'}
        </span>
      </div>

      {loading && (
        <div style={{ color: 'var(--accent-color)', fontSize: '14px' }}>
          Verificando certificado y cadena de confianza con el almacén Root de Windows...
        </div>
      )}

      {signatureInfo && (
        <div style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border-color)' }}>
          {renderStatusBadge(signatureInfo.status)}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Nombre de Archivo</span>
              <strong style={{ fontSize: '14px' }}>{signatureInfo.fileName}</strong>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Firmante (Signer)</span>
              <span style={{ fontSize: '13px' }}>{signatureInfo.signerName || 'Sin firmante registrado'}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Entidad Emisora (Issuer)</span>
              <span style={{ fontSize: '13px' }}>{signatureInfo.issuerName || 'N/A'}</span>
            </div>

            <div>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Resultado de Confianza</span>
              <span style={{ fontSize: '13px' }}>{signatureInfo.trustChainResult || 'Sin validación PKCS#7'}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '6px' }}>
            <p className="text-secondary" style={{ margin: 0, fontSize: '12px', lineHeight: '1.5' }}>
              <strong>Nota Importante:</strong> {signatureInfo.limitationsNotice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
