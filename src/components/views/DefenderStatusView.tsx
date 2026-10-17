import React, { useState, useEffect } from 'react';
import { DefenderStatus, DefenderScanResult } from '../../types';
import { fileSecurityService } from '../../services/fileSecurityService';
import { Shield, RefreshCw, FileSearch, CheckCircle2, AlertTriangle, ShieldCheck, Play } from 'lucide-react';

export const DefenderStatusView: React.FC = () => {
  const [status, setStatus] = useState<DefenderStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedScanFile, setSelectedScanFile] = useState<File | string | null>(null);
  const [scanResult, setScanResult] = useState<DefenderScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fileSecurityService.getDefenderStatus();
      setStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedScanFile(e.target.files[0]);
      setShowConfirmModal(true);
      setScanResult(null);
    }
  };

  const handleConfirmScan = async () => {
    if (!selectedScanFile) return;
    setShowConfirmModal(false);
    setIsScanning(true);
    try {
      const res = await fileSecurityService.scanFileDefender(selectedScanFile);
      setScanResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="card-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield className="accent-text" size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Consulta de Estado de Microsoft Defender</h3>
            <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>
              Estado del antivirus nativo de Windows y análisis bajo demanda con confirmación.
            </p>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={fetchStatus} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          Actualizar Estado
        </button>
      </div>

      {loading && (
        <div style={{ color: 'var(--accent-color)', fontSize: '14px' }}>
          Consultando la API de Microsoft Defender y el Centro de Seguridad de Windows...
        </div>
      )}

      {status && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Disponibilidad del Antivirus</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <strong style={{ fontSize: '14px' }}>{status.isAvailable ? 'Disponible' : 'No Disponible'}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Protección en Tiempo Real</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                {status.realTimeProtection === 'enabled' ? (
                  <ShieldCheck size={16} style={{ color: '#10b981' }} />
                ) : (
                  <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                )}
                <strong style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                  {status.realTimeProtection === 'enabled' ? 'Activa y Protegida' : status.realTimeProtection}
                </strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Firmas de Seguridad</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                <strong style={{ fontSize: '14px' }}>
                  {status.signaturesStatus === 'up_to_date' ? 'Actualizadas' : status.signaturesStatus}
                </strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span className="text-secondary" style={{ fontSize: '12px', display: 'block' }}>Última Actualización</span>
              <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                {status.signaturesLastUpdated}
              </span>
            </div>
          </div>

          <p className="text-secondary" style={{ fontSize: '12px', margin: 0 }}>
            * {status.limitationsNotice}
          </p>

          {/* On-demand Scan Action */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '15px' }}>Análisis Antivirus Bajo Demanda para un Archivo</h4>
            <p className="text-secondary" style={{ margin: 0, fontSize: '13px' }}>
              Solicita formalmente a Microsoft Defender la inspección de un archivo seleccionado.
            </p>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FileSearch size={16} />
                Seleccionar Archivo a Analizar
                <input type="file" onChange={handleSelectScanFile} style={{ display: 'none' }} />
              </label>
            </div>

            {isScanning && (
              <div style={{ color: 'var(--accent-color)', fontSize: '13px' }}>
                Enviando orden de análisis a Microsoft Defender...
              </div>
            )}

            {scanResult && (
              <div style={{ background: 'var(--bg-card-hover)', padding: '12px 16px', borderRadius: '6px', borderLeft: '4px solid var(--accent-color)' }}>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>Solicitud Transmitida:</strong>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)' }}>{scanResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scan Confirmation Modal */}
      {showConfirmModal && selectedScanFile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Confirmación de Análisis Antivirus</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-main)' }}>
              Se va a solicitar a <strong>Microsoft Defender</strong> que analice el siguiente archivo:
            </p>

            <code style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', wordBreak: 'break-all' }}>
              {typeof selectedScanFile === 'string' ? selectedScanFile : selectedScanFile.name}
            </code>

            <p className="text-secondary" style={{ margin: 0, fontSize: '12px' }}>
              TechKit iniciará el análisis mediante el ejecutable oficial de Windows Defender. La interfaz no declarará el archivo como seguro hasta que Defender complete el examen.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleConfirmScan} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Play size={14} />
                Iniciar Análisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
