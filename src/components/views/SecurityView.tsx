import React, { useEffect, useState } from 'react';
import { ShieldCheck, Hash, FileCheck, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import { securityService, HashResult, SecurityStatus } from '../../services/securityService';
import { formatBytes } from '../../services/systemService';

export const SecurityView: React.FC = () => {
  const [inputText, setInputText] = useState<string>('TechKit Windows Security Audit');
  const [textHashes, setTextHashes] = useState<HashResult | null>(null);
  const [fileHashes, setFileHashes] = useState<HashResult | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [hashMatchStatus, setHashMatchStatus] = useState<string | null>(null);
  const [compareTarget, setCompareTarget] = useState<string>('');

  const fetchSecurity = async () => {
    try {
      const status = await securityService.getSecurityStatus();
      setSecurityStatus(status);
      const hashes = await securityService.computeTextHashes(inputText);
      setTextHashes(hashes);
    } catch (err) {
      console.error('Error al inicializar módulo de seguridad:', err);
    }
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    if (val) {
      const hashes = await securityService.computeTextHashes(val);
      setTextHashes(hashes);
    } else {
      setTextHashes(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const res = await securityService.computeFileHashes(file);
      setFileHashes(res);
    }
  };

  const handleCompareCheck = () => {
    if (!compareTarget.trim()) {
      setHashMatchStatus('Introduce una suma SHA256 o MD5 esperada para comparar.');
      return;
    }

    const target = compareTarget.trim().toLowerCase();
    const currentSha256 = (fileHashes?.sha256 || textHashes?.sha256 || '').toLowerCase();
    const currentMd5 = (fileHashes?.md5 || textHashes?.md5 || '').toLowerCase();
    const currentSha1 = (fileHashes?.sha1 || textHashes?.sha1 || '').toLowerCase();

    if (target === currentSha256 || target === currentMd5 || target === currentSha1) {
      setHashMatchStatus('MATCH: La suma de comprobación coincide perfectamente con la huella digital calculada.');
    } else {
      setHashMatchStatus('MISMATCH: La huella digital ingresada NO coincide con los resultados calculados.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--accent-color)' }} />
            Seguridad y Verificación de Integridad
          </h3>
          <p className="section-desc">Cálculo de hashes MD5/SHA1/SHA256, verificación de firmas e integridad de archivos.</p>
        </div>
      </div>

      {/* Windows Security Status */}
      {securityStatus && (
        <div className="hero-card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
            Estado de Protección de Windows Defender
          </h4>
          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Antivirus Microsoft Defender:</span>
              <span className="info-value" style={{ color: securityStatus.defenderActive ? '#52c41a' : '#ff4d4f' }}>
                {securityStatus.defenderActive ? 'Activo y Protegido' : 'Desactivado'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Firewall de Windows:</span>
              <span className="info-value" style={{ color: securityStatus.firewallActive ? '#52c41a' : '#ff4d4f' }}>
                {securityStatus.firewallActive ? 'Habilitado' : 'Inactivo'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Último examen de seguridad:</span>
              <span className="info-value">{securityStatus.lastScanDate}</span>
            </div>
          </div>
        </div>
      )}

      {/* File Hash Calculator */}
      <div className="hero-card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={18} style={{ color: '#4096ff' }} />
          Calculadora de Hashes para Archivos
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Selecciona un archivo local para calcular sus huellas MD5, SHA-1 y SHA-256 sin subirlo a servidores externos.
        </p>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label className="btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            Seleccionar Archivo Local
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          {fileHashes?.fileName && (
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
              {fileHashes.fileName} ({formatBytes(fileHashes.fileSizeBytes || 0)})
            </span>
          )}
        </div>

        {fileHashes && (
          <div className="info-box" style={{ marginTop: '8px' }}>
            <div className="info-row">
              <span className="info-label">MD5:</span>
              <span className="info-value" style={{ fontFamily: 'var(--font-mono)' }}>{fileHashes.md5}</span>
            </div>
            <div className="info-row">
              <span className="info-label">SHA-1:</span>
              <span className="info-value" style={{ fontFamily: 'var(--font-mono)' }}>{fileHashes.sha1}</span>
            </div>
            <div className="info-row">
              <span className="info-label">SHA-256:</span>
              <span className="info-value" style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{fileHashes.sha256}</span>
            </div>
          </div>
        )}
      </div>

      {/* Text Hash Calculator & Verification */}
      <div className="hero-card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Hash size={18} style={{ color: 'var(--accent-color)' }} />
          Generador de Hashes de Texto y Comparador
        </h4>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            TEXTO O CADENA A EVALUAR:
          </label>
          <textarea
            rows={3}
            className="hero-search-input"
            style={{ fontFamily: 'var(--font-mono)', width: '100%' }}
            value={inputText}
            onChange={handleTextChange}
          />
        </div>

        {textHashes && (
          <div className="info-box">
            <div className="info-row">
              <span className="info-label">MD5:</span>
              <span className="info-value" style={{ fontFamily: 'var(--font-mono)' }}>{textHashes.md5}</span>
            </div>
            <div className="info-row">
              <span className="info-label">SHA-1:</span>
              <span className="info-value" style={{ fontFamily: 'var(--font-mono)' }}>{textHashes.sha1}</span>
            </div>
            <div className="info-row">
              <span className="info-label">SHA-256:</span>
              <span className="info-value" style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{textHashes.sha256}</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            COMPARAR CON HASH ESPERADO (VERIFICACIÓN DE INTEGRIDAD):
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="hero-search-input"
              style={{ fontFamily: 'var(--font-mono)' }}
              placeholder="Pega aquí la suma de comprobación esperada..."
              value={compareTarget}
              onChange={(e) => setCompareTarget(e.target.value)}
            />
            <button className="btn-secondary" onClick={handleCompareCheck}>
              Verificar
            </button>
          </div>

          {hashMatchStatus && (
            <div
              className="info-box"
              style={{
                marginTop: '10px',
                borderColor: hashMatchStatus.startsWith('MATCH') ? '#52c41a' : '#ff4d4f',
                color: hashMatchStatus.startsWith('MATCH') ? '#52c41a' : '#ff4d4f',
              }}
            >
              {hashMatchStatus.startsWith('MATCH') ? (
                <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
              ) : (
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px' }} />
              )}
              {hashMatchStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
