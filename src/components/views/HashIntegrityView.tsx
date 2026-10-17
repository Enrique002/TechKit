import React, { useState } from 'react';
import { FileHashes } from '../../types';
import { fileSecurityService } from '../../services/fileSecurityService';
import { Hash, Copy, Check, FileCheck, AlertCircle } from 'lucide-react';

export const HashIntegrityView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<FileHashes | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [compareHashInput, setCompareHashInput] = useState<string>('');
  const [comparisonMatch, setComparisonMatch] = useState<boolean | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await computeHashes(file);
    }
  };

  const computeHashes = async (target: File | string) => {
    setLoading(true);
    setComparisonMatch(null);
    try {
      const res = await fileSecurityService.calculateHashes(target);
      setHashes(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCompareUserHash = () => {
    if (!hashes || !compareHashInput.trim()) return;
    const cleanUser = compareHashInput.trim().toLowerCase().replace(/\s+/g, '');
    const cleanSha256 = hashes.sha256.trim().toLowerCase().replace(/\s+/g, '');
    const cleanSha512 = hashes.sha512.trim().toLowerCase().replace(/\s+/g, '');
    const cleanMd5 = hashes.md5.trim().toLowerCase().replace(/\s+/g, '');

    const isMatch = cleanUser === cleanSha256 || cleanUser === cleanSha512 || cleanUser === cleanMd5;
    setComparisonMatch(isMatch);
  };

  return (
    <div className="card-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <Hash className="accent-text" size={24} />
        <div>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Cálculo de Hashes e Integridad Criptográfica</h3>
          <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>
            Generación de sumas de comprobación SHA-256, SHA-512 y MD5 sobre contenido real.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={16} />
          Seleccionar Archivo
          <input type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
        </label>

        <span className="text-secondary" style={{ fontSize: '13px' }}>
          {selectedFile ? `Archivo: ${selectedFile.name}` : 'o ingrese ruta para calcular hash'}
        </span>
      </div>

      {loading && (
        <div style={{ color: 'var(--accent-color)', fontSize: '14px' }}>
          Calculando hashes criptográficos por bloques...
        </div>
      )}

      {hashes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card-hover)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Archivo: {hashes.fileName}</strong>
              <span className="text-secondary" style={{ fontSize: '12px' }}>Analizado: {hashes.calculationDate}</span>
            </div>

            {/* SHA-256 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>SHA-256 (Recomendado)</span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => copyToClipboard(hashes.sha256, 'sha256')}
                >
                  {copiedKey === 'sha256' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedKey === 'sha256' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <code style={{ background: 'var(--bg-main)', padding: '8px', borderRadius: '4px', fontSize: '12px', wordBreak: 'break-all' }}>
                {hashes.sha256}
              </code>
            </div>

            {/* SHA-512 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success" style={{ fontSize: '11px' }}>SHA-512</span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => copyToClipboard(hashes.sha512, 'sha512')}
                >
                  {copiedKey === 'sha512' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedKey === 'sha512' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <code style={{ background: 'var(--bg-main)', padding: '8px', borderRadius: '4px', fontSize: '12px', wordBreak: 'break-all' }}>
                {hashes.sha512}
              </code>
            </div>

            {/* MD5 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                  MD5 (Algoritmo antiguo - No recomendado para seguridad)
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => copyToClipboard(hashes.md5, 'md5')}
                >
                  {copiedKey === 'md5' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedKey === 'md5' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <code style={{ background: 'var(--bg-main)', padding: '8px', borderRadius: '4px', fontSize: '12px', wordBreak: 'break-all' }}>
                {hashes.md5}
              </code>
            </div>
          </div>

          {/* User Hash Verification Section */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '14px' }}>Comparar con Hash Esperado del Usuario</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="search-input"
                style={{ flex: 1, padding: '8px 12px' }}
                placeholder="Pegue la suma de comprobación esperada (SHA-256 / SHA-512 / MD5)"
                value={compareHashInput}
                onChange={(e) => {
                  setCompareHashInput(e.target.value);
                  setComparisonMatch(null);
                }}
              />
              <button className="btn btn-secondary" onClick={handleCompareUserHash} disabled={!compareHashInput.trim()}>
                Validar Hash
              </button>
            </div>

            {comparisonMatch !== null && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: comparisonMatch ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: comparisonMatch ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: comparisonMatch ? '#10b981' : '#ef4444',
                }}
              >
                {comparisonMatch ? <Check size={18} /> : <AlertCircle size={18} />}
                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                  {comparisonMatch
                    ? '¡Coincidencia exacta! El hash introducido coincide con el hash calculado del archivo.'
                    : 'No coincide. El hash introducido difiere del hash calculado.'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
