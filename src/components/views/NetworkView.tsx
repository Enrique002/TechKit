import React, { useEffect, useState } from 'react';
import { Wifi, RefreshCw, Send, CheckCircle2, AlertCircle, Server } from 'lucide-react';
import { networkService, NetworkInterfaceInfo, PingResult } from '../../services/networkService';
import { formatBytes } from '../../services/systemService';

export const NetworkView: React.FC = () => {
  const [interfaces, setInterfaces] = useState<NetworkInterfaceInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Ping tool state
  const [targetHost, setTargetHost] = useState<string>('8.8.8.8');
  const [pingLoading, setPingLoading] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);

  const fetchNetwork = async () => {
    setLoading(true);
    try {
      const data = await networkService.getNetworkInterfaces();
      setInterfaces(data);
    } catch (err) {
      console.error('Error al obtener interfaces de red:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  const handlePingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHost.trim()) return;

    setPingLoading(true);
    setPingError(null);
    try {
      const res = await networkService.pingHost(targetHost);
      setPingResult(res);
    } catch (err: any) {
      setPingError(err?.message || 'Error al realizar prueba de latencia.');
    } finally {
      setPingLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wifi size={20} style={{ color: 'var(--accent-color)' }} />
            Redes y Conectividad
          </h3>
          <p className="section-desc">Adaptadores de red activos, direcciones IP/MAC y utilidad de diagnóstico de latencia ping.</p>
        </div>
        <button className="btn-secondary" onClick={fetchNetwork} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Consultando...' : 'Actualizar Interfaces'}
        </button>
      </div>

      {/* Network Interfaces List */}
      <div className="tools-grid">
        {interfaces.map((iface, i) => (
          <div key={i} className="hero-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                {iface.name}
              </div>
              <span className={`status-badge ${iface.isUp ? 'status-available' : 'status-pending'}`}>
                {iface.isUp ? 'Activo' : 'Desconectado'}
              </span>
            </div>

            <div className="info-box" style={{ marginTop: '8px' }}>
              <div className="info-row">
                <span className="info-label">Dirección IP:</span>
                <span className="info-value" style={{ fontFamily: 'var(--font-mono)' }}>{iface.ipAddress}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Dirección MAC:</span>
                <span className="info-value" style={{ fontFamily: 'var(--font-mono)' }}>{iface.macAddress}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Enviado / Recibido:</span>
                <span className="info-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  ↑ {formatBytes(iface.bytesSent)} / ↓ {formatBytes(iface.bytesReceived)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ping & Connectivity Diagnostic Tool */}
      <div className="hero-card">
        <h4 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} style={{ color: 'var(--accent-color)' }} />
          Herramienta de Diagnóstico de Latencia (Ping / ICMP)
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Introduce una dirección IP o nombre de dominio (ej. 8.8.8.8, google.com) para verificar la conectividad y respuesta.
        </p>

        <form onSubmit={handlePingSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
          <input
            type="text"
            className="hero-search-input"
            style={{ paddingLeft: '12px' }}
            placeholder="Ej. 8.8.8.8 o google.com"
            value={targetHost}
            onChange={(e) => setTargetHost(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={pingLoading}>
            <Send size={16} />
            {pingLoading ? 'Probando...' : 'Realizar Ping'}
          </button>
        </form>

        {pingError && (
          <div className="info-box" style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {pingError}
          </div>
        )}

        {pingResult && (
          <div className="info-box" style={{ marginTop: '10px' }}>
            <div className="info-row">
              <span className="info-label">Host Consultado:</span>
              <span className="info-value" style={{ fontFamily: 'var(--font-mono)' }}>{pingResult.host} ({pingResult.ip})</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tiempo de Respuesta (Latencia):</span>
              <span className="info-value" style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {pingResult.latencyMs} ms
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Pérdida de Paquetes:</span>
              <span className="info-value">{pingResult.packetLossPercentage}%</span>
            </div>
            <div className="info-row">
              <span className="info-label">Estado de la Conexión:</span>
              <span className="info-value" style={{ color: '#52c41a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> {pingResult.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
