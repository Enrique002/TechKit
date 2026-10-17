import React, { useState, useEffect } from 'react';
import {
  NetworkInterfaceInfo,
  PingResult,
  DnsLookupResult,
  TraceRouteResult,
  NetworkConnectionInfo,
} from '../../types';
import { networkService } from '../../services/networkService';
import {
  Wifi,
  Globe,
  Radio,
  Search,
  RefreshCw,
  Activity,
  Server,
  ArrowRight,
} from 'lucide-react';

interface NetworkViewProps {
  onNavigateToProcessPid?: (pid: number) => void;
  initialPortFilter?: string | null;
  initialPidFilter?: number | null;
}

export const NetworkView: React.FC<NetworkViewProps> = ({
  onNavigateToProcessPid,
  initialPortFilter,
  initialPidFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'interfaces' | 'tools' | 'connections' | 'port_inspector'>('interfaces');

  // Interfaces State
  const [interfaces, setInterfaces] = useState<NetworkInterfaceInfo[]>([]);
  const [loadingInterfaces, setLoadingInterfaces] = useState<boolean>(true);
  const [lastInterfaceUpdated, setLastInterfaceUpdated] = useState<string>('');

  // Ping Tool State
  const [pingTarget, setPingTarget] = useState<string>('1.1.1.1');
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // DNS Tool State
  const [dnsTarget, setDnsTarget] = useState<string>('google.com');
  const [dnsResult, setDnsResult] = useState<DnsLookupResult | null>(null);
  const [isResolvingDns, setIsResolvingDns] = useState<boolean>(false);

  // TraceRoute Tool State
  const [traceTarget, setTraceTarget] = useState<string>('8.8.8.8');
  const [traceResult, setTraceResult] = useState<TraceRouteResult | null>(null);
  const [isTracing, setIsTracing] = useState<boolean>(false);

  // Active Connections State
  const [connections, setConnections] = useState<NetworkConnectionInfo[]>([]);
  const [loadingConnections, setLoadingConnections] = useState<boolean>(true);
  const [connSearch, setConnSearch] = useState<string>(
    initialPidFilter ? initialPidFilter.toString() : initialPortFilter || ''
  );
  const [protocolFilter, setProtocolFilter] = useState<'ALL' | 'TCP' | 'UDP'>('ALL');
  const [stateFilter] = useState<string>('ALL');

  // Port Inspector State
  const [inspectPortInput, setInspectPortInput] = useState<string>(initialPortFilter || '');

  const fetchInterfaces = async () => {
    setLoadingInterfaces(true);
    try {
      const data = await networkService.getNetworkInterfaces();
      setInterfaces(data);
      setLastInterfaceUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInterfaces(false);
    }
  };

  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const data = await networkService.getActiveConnections();
      setConnections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    fetchInterfaces();
    fetchConnections();
  }, []);

  useEffect(() => {
    if (initialPortFilter) {
      setActiveTab('port_inspector');
      setInspectPortInput(initialPortFilter);
    } else if (initialPidFilter) {
      setActiveTab('connections');
      setConnSearch(initialPidFilter.toString());
    }
  }, [initialPortFilter, initialPidFilter]);

  // Ping Handler
  const handleRunPing = async () => {
    if (!pingTarget.trim()) return;
    setIsPinging(true);
    setPingResult(null);
    const res = await networkService.pingHost(pingTarget);
    setPingResult(res);
    setIsPinging(false);
  };

  // DNS Lookup Handler
  const handleRunDns = async () => {
    if (!dnsTarget.trim()) return;
    setIsResolvingDns(true);
    setDnsResult(null);
    const res = await networkService.dnsLookup(dnsTarget);
    setDnsResult(res);
    setIsResolvingDns(false);
  };

  // TraceRoute Handler
  const handleRunTrace = async () => {
    if (!traceTarget.trim()) return;
    setIsTracing(true);
    setTraceResult(null);
    const res = await networkService.traceRoute(traceTarget);
    setTraceResult(res);
    setIsTracing(false);
  };

  // Filter Active Connections
  const filteredConnections = connections.filter((c) => {
    if (protocolFilter !== 'ALL' && c.protocol !== protocolFilter) return false;
    if (stateFilter !== 'ALL' && c.state !== stateFilter) return false;

    const query = connSearch.toLowerCase().trim();
    if (!query) return true;

    return (
      c.localPort.toString().includes(query) ||
      c.remotePort.toString().includes(query) ||
      c.localAddress.toLowerCase().includes(query) ||
      c.remoteAddress.toLowerCase().includes(query) ||
      c.pid.toString().includes(query) ||
      (c.processName && c.processName.toLowerCase().includes(query))
    );
  });

  // Port Inspector Filtered Items
  const inspectedPortNumber = parseInt(inspectPortInput.trim(), 10);
  const isValidPort = !isNaN(inspectedPortNumber) && inspectedPortNumber >= 1 && inspectedPortNumber <= 65535;

  const portMatches = isValidPort
    ? connections.filter((c) => c.localPort === inspectedPortNumber || c.remotePort === inspectedPortNumber)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Network Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'interfaces' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('interfaces')}
        >
          <Wifi size={15} />
          Interfaces y Configuración
        </button>

        <button
          className={`btn ${activeTab === 'tools' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tools')}
        >
          <Radio size={15} />
          Diagnóstico (Ping / DNS / Ruta)
        </button>

        <button
          className={`btn ${activeTab === 'connections' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('connections')}
        >
          <Activity size={15} />
          Conexiones Activas ({connections.length})
        </button>

        <button
          className={`btn ${activeTab === 'port_inspector' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('port_inspector')}
        >
          <Server size={15} />
          Inspector de Puertos
        </button>
      </div>

      {/* SECTION 1: INTERFACES */}
      {activeTab === 'interfaces' && (
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 className="card-title">Interfaces de Red y Adaptadores</h3>
              <p className="card-desc">
                Información real de adaptadores Ethernet, Wi-Fi y virtuales del sistema.
                {lastInterfaceUpdated && ` (Última consulta: ${lastInterfaceUpdated})`}
              </p>
            </div>

            <button className="btn btn-secondary" onClick={fetchInterfaces} disabled={loadingInterfaces}>
              <RefreshCw size={14} className={loadingInterfaces ? 'spin' : ''} />
              Actualizar Interfaces
            </button>
          </div>

          {loadingInterfaces ? (
            <div style={{ padding: '32px', textAlign: 'center', opacity: 0.7 }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: '8px' }} />
              <p>Consultando adaptadores de red de Windows...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {interfaces.map((iface) => (
                <div
                  key={iface.id}
                  style={{
                    backgroundColor: 'var(--bg-card-alt)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{iface.name}</h4>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>{iface.adapterName}</div>
                    </div>
                    <span
                      className={`badge ${
                        iface.status === 'connected'
                          ? 'badge-success'
                          : iface.status === 'disconnected'
                          ? 'badge-neutral'
                          : 'badge-warning'
                      }`}
                    >
                      {iface.status === 'connected'
                        ? 'Conectado'
                        : iface.status === 'disconnected'
                        ? 'Desconectado'
                        : 'Estado Desconocido'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <strong>IPv4:</strong>{' '}
                      {iface.ipv4Addresses.length > 0 ? (
                        iface.ipv4Addresses.map((ip) => <code key={ip}>{ip} </code>)
                      ) : (
                        <span style={{ opacity: 0.6 }}>No asignada</span>
                      )}
                    </div>

                    <div>
                      <strong>IPv6:</strong>{' '}
                      {iface.ipv6Addresses.length > 0 ? (
                        <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>{iface.ipv6Addresses[0]}</code>
                      ) : (
                        <span style={{ opacity: 0.6 }}>No asignada</span>
                      )}
                    </div>

                    <div>
                      <strong>Dirección MAC:</strong> <code>{iface.macAddress}</code>
                    </div>

                    <div>
                      <strong>Puerta de Enlace:</strong> <code>{iface.gateway}</code>
                    </div>

                    <div>
                      <strong>Servidores DNS:</strong>{' '}
                      {iface.dnsServers.length > 0 ? (
                        iface.dnsServers.map((dns) => <code key={dns}>{dns} </code>)
                      ) : (
                        <span style={{ opacity: 0.6 }}>Sin DNS explícito</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: DIAGNOSTIC TOOLS (Ping, DNS, TraceRoute) */}
      {activeTab === 'tools' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Tool: PING */}
          <div className="card-panel">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} />
              Prueba de Latencia (Ping ICMP)
            </h3>
            <p className="card-desc">
              Comprueba el tiempo de respuesta enviando paquetes a un host o IP.
            </p>

            <div style={{ display: 'flex', gap: '8px', margin: '14px 0' }}>
              <input
                type="text"
                className="input-field"
                style={{ flex: 1 }}
                placeholder="ej. 8.8.8.8 o google.com"
                value={pingTarget}
                onChange={(e) => setPingTarget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunPing()}
              />
              <button className="btn btn-primary" onClick={handleRunPing} disabled={isPinging}>
                {isPinging ? 'Probando...' : 'Ejecutar Ping'}
              </button>
            </div>

            {pingResult && (
              <div
                style={{
                  backgroundColor: 'var(--bg-card-alt)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Destino: {pingResult.target}</strong>
                  <span className={`badge ${pingResult.success ? 'badge-success' : 'badge-error'}`}>
                    {pingResult.success ? 'Respuesta Exitosa' : 'Sin Respuesta / Error'}
                  </span>
                </div>

                {pingResult.avgRttMs !== undefined && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px', textAlign: 'center' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '6px', borderRadius: '4px' }}>
                      <div style={{ opacity: 0.7, fontSize: '11px' }}>Mínimo</div>
                      <strong>{pingResult.minRttMs} ms</strong>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '6px', borderRadius: '4px' }}>
                      <div style={{ opacity: 0.7, fontSize: '11px' }}>Promedio</div>
                      <strong style={{ color: 'var(--accent-color)' }}>{pingResult.avgRttMs} ms</strong>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '6px', borderRadius: '4px' }}>
                      <div style={{ opacity: 0.7, fontSize: '11px' }}>Máximo</div>
                      <strong>{pingResult.maxRttMs} ms</strong>
                    </div>
                  </div>
                )}

                {pingResult.error && (
                  <div className="alert alert-error" style={{ fontSize: '11px', marginBottom: '8px' }}>
                    {pingResult.error}
                  </div>
                )}

                <div style={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.85, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {pingResult.details.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tool: DNS LOOKUP */}
          <div className="card-panel">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} />
              Resolución Nombres DNS
            </h3>
            <p className="card-desc">
              Consulta las direcciones IP asociadas a un nombre de dominio.
            </p>

            <div style={{ display: 'flex', gap: '8px', margin: '14px 0' }}>
              <input
                type="text"
                className="input-field"
                style={{ flex: 1 }}
                placeholder="ej. cloudflare.com"
                value={dnsTarget}
                onChange={(e) => setDnsTarget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunDns()}
              />
              <button className="btn btn-primary" onClick={handleRunDns} disabled={isResolvingDns}>
                {isResolvingDns ? 'Consultando...' : 'Resolver DNS'}
              </button>
            </div>

            {dnsResult && (
              <div
                style={{
                  backgroundColor: 'var(--bg-card-alt)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Dominio: {dnsResult.hostname}</strong>
                  <span className="badge badge-info">{dnsResult.queryTimeMs} ms</span>
                </div>

                {dnsResult.status === 'success' ? (
                  <div>
                    <div style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Direcciones resueltas:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {dnsResult.addresses.map((addr, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '6px', borderRadius: '4px' }}>
                          <code>{addr}</code>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '10px' }}
                            onClick={() => navigator.clipboard.writeText(addr)}
                          >
                            Copiar IP
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-error" style={{ fontSize: '11px' }}>
                    {dnsResult.errorMessage || 'No se pudieron resolver direcciones para este dominio.'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tool: TRACEROUTE */}
          <div className="card-panel" style={{ gridColumn: '1 / -1' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRight size={18} />
              Trazado de Ruta de Red (Traceroute)
            </h3>
            <p className="card-desc">
              Visualiza los saltos intermedios y enrutadores para alcanzar un destino.
            </p>

            <div style={{ display: 'flex', gap: '8px', margin: '14px 0', maxWidth: '500px' }}>
              <input
                type="text"
                className="input-field"
                style={{ flex: 1 }}
                placeholder="ej. 1.1.1.1"
                value={traceTarget}
                onChange={(e) => setTraceTarget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunTrace()}
              />
              <button className="btn btn-primary" onClick={handleRunTrace} disabled={isTracing}>
                {isTracing ? 'Trazando Ruta...' : 'Iniciar Trazado'}
              </button>
            </div>

            {traceResult && (
              <div style={{ marginTop: '12px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Salto</th>
                      <th>Dirección IP</th>
                      <th>Host / Nombre</th>
                      <th>Tiempo (RTT)</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traceResult.hops.map((hop) => (
                      <tr key={hop.hopNumber}>
                        <td><code>#{hop.hopNumber}</code></td>
                        <td><code>{hop.ip}</code></td>
                        <td>{hop.hostname || '-'}</td>
                        <td>{hop.rttMs ? `${hop.rttMs} ms` : '*'}</td>
                        <td>
                          <span className={`badge ${hop.status === 'ok' ? 'badge-success' : 'badge-warning'}`}>
                            {hop.status === 'ok' ? 'OK' : 'Timeout'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: ACTIVE CONNECTIONS & PORTS */}
      {activeTab === 'connections' && (
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 className="card-title">Conexiones de Red y Sockets Activos</h3>
              <p className="card-desc">
                Consulta los puertos locales en escucha y conexiones TCP/UDP en tiempo real.
              </p>
            </div>

            <button className="btn btn-secondary" onClick={fetchConnections} disabled={loadingConnections}>
              <RefreshCw size={14} className={loadingConnections ? 'spin' : ''} />
              Actualizar Conexiones
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '32px', width: '100%' }}
                placeholder="Filtrar por Puerto, IP, PID o Proceso..."
                value={connSearch}
                onChange={(e) => setConnSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>Protocolo:</span>
              <button
                className={`btn ${protocolFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '4px 10px' }}
                onClick={() => setProtocolFilter('ALL')}
              >
                Todos
              </button>
              <button
                className={`btn ${protocolFilter === 'TCP' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '4px 10px' }}
                onClick={() => setProtocolFilter('TCP')}
              >
                TCP
              </button>
              <button
                className={`btn ${protocolFilter === 'UDP' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '4px 10px' }}
                onClick={() => setProtocolFilter('UDP')}
              >
                UDP
              </button>
            </div>
          </div>

          {loadingConnections ? (
            <div style={{ padding: '32px', textAlign: 'center', opacity: 0.7 }}>
              <RefreshCw size={24} className="spin" style={{ marginBottom: '8px' }} />
              <p>Consultando la tabla de sockets de red del sistema...</p>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', opacity: 0.7, border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
              No se encontraron conexiones activas que coincidan con el filtro.
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Protocolo</th>
                    <th>Dirección Local:Puerto</th>
                    <th>Dirección Remota:Puerto</th>
                    <th style={{ width: '120px' }}>Estado</th>
                    <th style={{ width: '90px' }}>PID</th>
                    <th>Proceso Propietario</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConnections.map((conn) => (
                    <tr key={conn.id}>
                      <td>
                        <span className={`badge ${conn.protocol === 'TCP' ? 'badge-info' : 'badge-neutral'}`}>
                          {conn.protocol}
                        </span>
                      </td>
                      <td><code>{conn.localAddress}:{conn.localPort}</code></td>
                      <td><code>{conn.remoteAddress}:{conn.remotePort}</code></td>
                      <td>
                        <span className={`badge ${conn.state === 'LISTEN' ? 'badge-warning' : conn.state === 'ESTABLISHED' ? 'badge-success' : 'badge-neutral'}`}>
                          {conn.state}
                        </span>
                      </td>
                      <td><code>{conn.pid}</code></td>
                      <td style={{ fontWeight: 500 }}>{conn.processName || 'Desconocido'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {onNavigateToProcessPid && conn.pid > 0 && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => onNavigateToProcessPid(conn.pid)}
                            title="Ver detalles del proceso propietario en Gestor de Procesos"
                          >
                            Ir al Proceso (PID {conn.pid})
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: PORT INSPECTOR */}
      {activeTab === 'port_inspector' && (
        <div className="card-panel">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} />
            Inspector y Buscador de Puerto Específico
          </h3>
          <p className="card-desc">
            Introduce un número de puerto (1 - 65535) para verificar qué servicio o proceso lo está ocupando.
          </p>

          <div style={{ display: 'flex', gap: '10px', margin: '16px 0', maxWidth: '420px' }}>
            <input
              type="number"
              className="input-field"
              style={{ flex: 1 }}
              placeholder="ej. 80, 443, 3000, 8080"
              min={1}
              max={65535}
              value={inspectPortInput}
              onChange={(e) => setInspectPortInput(e.target.value)}
            />
            {inspectPortInput && (
              <button
                className="btn btn-secondary"
                onClick={() => setInspectPortInput('')}
              >
                Limpiar
              </button>
            )}
          </div>

          {!isValidPort && inspectPortInput.trim().length > 0 && (
            <div className="alert alert-error" style={{ fontSize: '12px', marginBottom: '16px' }}>
              Por favor, ingrese un número de puerto válido dentro del rango entre 1 y 65535.
            </div>
          )}

          {isValidPort && (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
                Resultados para el Puerto <code>{inspectedPortNumber}</code>:
              </div>

              {portMatches.length === 0 ? (
                <div style={{ padding: '16px', background: 'var(--bg-card-alt)', borderRadius: '6px', fontSize: '13px' }}>
                  <p style={{ margin: 0, opacity: 0.9 }}>
                    No se han detectado sockets o procesos activos en el puerto <strong>{inspectedPortNumber}</strong> en la consulta actual.
                  </p>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                    * Nota informativa: La ausencia de resultados no garantiza al 100% que el puerto esté libre si la consulta carece de privilegios elevados de red o si el puerto se abre de forma dinámica.
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Protocolo</th>
                        <th>Dirección Local</th>
                        <th>Dirección Remota</th>
                        <th>Estado de Conexión</th>
                        <th>PID Propietario</th>
                        <th>Nombre del Proceso</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portMatches.map((conn) => (
                        <tr key={conn.id}>
                          <td><span className="badge badge-info">{conn.protocol}</span></td>
                          <td><code>{conn.localAddress}:{conn.localPort}</code></td>
                          <td><code>{conn.remoteAddress}:{conn.remotePort}</code></td>
                          <td>
                            <span className={`badge ${conn.state === 'LISTEN' ? 'badge-warning' : 'badge-success'}`}>
                              {conn.state}
                            </span>
                          </td>
                          <td><code>{conn.pid}</code></td>
                          <td style={{ fontWeight: 600 }}>{conn.processName || 'Desconocido'}</td>
                          <td style={{ textAlign: 'right' }}>
                            {onNavigateToProcessPid && conn.pid > 0 && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => onNavigateToProcessPid(conn.pid)}
                              >
                                Ver Proceso (PID {conn.pid})
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Educational Note */}
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: 'var(--bg-card-alt)',
              borderRadius: '6px',
              fontSize: '12px',
              lineHeight: '1.5',
            }}
          >
            <strong style={{ color: 'var(--accent-color)' }}>Diferencia Técnica entre Estados:</strong>
            <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
              <li>
                <strong>LISTEN (En Escucha):</strong> Un servicio o servidor local ha reservado el puerto y permanece a la espera de conexiones entrantes (ej. Servidor Web en puerto 80/443).
              </li>
              <li>
                <strong>ESTABLISHED (Establecida):</strong> Existe una conexión de red bidireccional activa entre la aplicación local y un servidor/equipo remoto.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
