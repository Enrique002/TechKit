import { invoke } from '@tauri-apps/api/core';
import {
  NetworkInterfaceInfo,
  PingResult,
  DnsLookupResult,
  TraceRouteResult,
  NetworkConnectionInfo,
} from '../types';

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

const MOCK_INTERFACES: NetworkInterfaceInfo[] = [
  {
    id: 'eth0',
    name: 'Ethernet',
    adapterName: 'Realtek PCIe GbE Family Controller',
    status: 'connected',
    ipv4Addresses: ['192.168.1.105'],
    ipv6Addresses: ['fe80::8041:12ab:99f1:4321'],
    macAddress: 'B4:2E:99:A1:00:1E',
    gateway: '192.168.1.1',
    dnsServers: ['1.1.1.1', '8.8.8.8'],
    isVirtual: false,
  },
  {
    id: 'wlan0',
    name: 'Wi-Fi',
    adapterName: 'Intel(R) Wi-Fi 6 AX200 160MHz',
    status: 'disconnected',
    ipv4Addresses: [],
    ipv6Addresses: [],
    macAddress: 'A4:80:94:10:22:8C',
    gateway: 'No configurada',
    dnsServers: [],
    isVirtual: false,
  },
];

const MOCK_CONNECTIONS: NetworkConnectionInfo[] = [
  {
    id: 'conn-1',
    protocol: 'TCP',
    localAddress: '0.0.0.0',
    localPort: 80,
    remoteAddress: '0.0.0.0',
    remotePort: 0,
    state: 'LISTEN',
    pid: 4,
    processName: 'System',
  },
  {
    id: 'conn-2',
    protocol: 'TCP',
    localAddress: '192.168.1.105',
    localPort: 54321,
    remoteAddress: '142.250.190.46',
    remotePort: 443,
    state: 'ESTABLISHED',
    pid: 1234,
    processName: 'msedge.exe',
  },
  {
    id: 'conn-3',
    protocol: 'UDP',
    localAddress: '0.0.0.0',
    localPort: 53,
    remoteAddress: '*',
    remotePort: 0,
    state: 'N/A',
    pid: 1100,
    processName: 'svchost.exe',
  },
  {
    id: 'conn-4',
    protocol: 'TCP',
    localAddress: '127.0.0.1',
    localPort: 3000,
    remoteAddress: '0.0.0.0',
    remotePort: 0,
    state: 'LISTEN',
    pid: 3892,
    processName: 'Code.exe',
  },
];

export const networkService = {
  async getNetworkInterfaces(): Promise<NetworkInterfaceInfo[]> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any[]>('get_network_interfaces');
        return res.map((item) => ({
          id: item.id || item.name,
          name: item.name || 'Interfaz',
          adapterName: item.adapter_name || item.name,
          status: item.status || 'unknown',
          ipv4Addresses: item.ipv4_addresses || [],
          ipv6Addresses: item.ipv6_addresses || [],
          macAddress: item.mac_address || 'No disponible',
          gateway: item.gateway || 'N/A',
          dnsServers: item.dns_servers || [],
          isVirtual: Boolean(item.is_virtual),
        }));
      } catch (err) {
        console.warn('Tauri invoke get_network_interfaces failed, using fallback:', err);
      }
    }
    return MOCK_INTERFACES;
  },

  async pingHost(target: string, count: number = 4): Promise<PingResult> {
    const cleanTarget = target.trim();
    if (!cleanTarget) {
      return {
        target: '',
        packetsSent: 0,
        packetsReceived: 0,
        packetsLost: 0,
        success: false,
        error: 'Por favor, introduce una dirección IP o un nombre de host válido.',
        details: ['Error: Entrada vacía.'],
      };
    }

    if (/[;&|<>$\\]/.test(cleanTarget)) {
      return {
        target: cleanTarget,
        packetsSent: 0,
        packetsReceived: 0,
        packetsLost: 0,
        success: false,
        error: 'Caracteres no permitidos detectados por motivos de seguridad.',
        details: ['Error: Inyección de comandos rechazada.'],
      };
    }

    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('ping_host', { target: cleanTarget, count });
        return {
          target: res.target || cleanTarget,
          packetsSent: res.packets_sent || count,
          packetsReceived: res.packets_received || 0,
          packetsLost: res.packets_lost || 0,
          minRttMs: res.min_rtt_ms,
          avgRttMs: res.avg_rtt_ms,
          maxRttMs: res.max_rtt_ms,
          success: Boolean(res.success),
          error: res.error,
          details: res.details || [],
        };
      } catch (err: any) {
        return {
          target: cleanTarget,
          packetsSent: count,
          packetsReceived: 0,
          packetsLost: count,
          success: false,
          error: `Error de ejecución de ping: ${err?.message || err}`,
          details: [`Fallo al comunicar con la utilidad de red nativa.`],
        };
      }
    }

    // Mock ping response for web / tests
    const isSuccess = !cleanTarget.toLowerCase().includes('fail') && !cleanTarget.includes('192.168.254.254');
    if (isSuccess) {
      return {
        target: cleanTarget,
        packetsSent: count,
        packetsReceived: count,
        packetsLost: 0,
        minRttMs: 12,
        avgRttMs: 18,
        maxRttMs: 25,
        success: true,
        details: [
          `Respuesta desde ${cleanTarget}: bytes=32 tiempo=12ms TTL=117`,
          `Respuesta desde ${cleanTarget}: bytes=32 tiempo=18ms TTL=117`,
          `Respuesta desde ${cleanTarget}: bytes=32 tiempo=19ms TTL=117`,
          `Respuesta desde ${cleanTarget}: bytes=32 tiempo=23ms TTL=117`,
        ],
      };
    } else {
      return {
        target: cleanTarget,
        packetsSent: count,
        packetsReceived: 0,
        packetsLost: count,
        success: false,
        error: 'Tiempo de espera agotado para la solicitud (Request timed out).',
        details: [`Aviso: Los paquetes no obtuvieron respuesta. Algunos hosts bloquean tráfico ICMP/ping.`],
      };
    }
  },

  async dnsLookup(hostname: string): Promise<DnsLookupResult> {
    const cleanHost = hostname.trim();
    const startTime = performance.now();

    if (!cleanHost) {
      return {
        hostname: '',
        addresses: [],
        status: 'execution_failed',
        errorMessage: 'El nombre de dominio ingresado está vacío.',
        queryTimeMs: 0,
      };
    }

    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('dns_lookup', { hostname: cleanHost });
        return {
          hostname: res.hostname || cleanHost,
          addresses: res.addresses || [],
          status: res.status || 'success',
          errorMessage: res.error_message,
          queryTimeMs: res.query_time_ms || 20,
        };
      } catch (err: any) {
        return {
          hostname: cleanHost,
          addresses: [],
          status: 'dns_error',
          errorMessage: `Fallo en la resolución DNS: ${err?.message || err}`,
          queryTimeMs: Math.round(performance.now() - startTime),
        };
      }
    }

    // Web mock
    if (cleanHost.toLowerCase().includes('invalid') || cleanHost.includes('notfound')) {
      return {
        hostname: cleanHost,
        addresses: [],
        status: 'no_records',
        errorMessage: 'El nombre de dominio no existe o no tiene registros A/AAAA configurados.',
        queryTimeMs: 18,
      };
    }

    return {
      hostname: cleanHost,
      addresses: ['142.250.190.46', '2607:f8b0:4004:809::200e'],
      status: 'success',
      queryTimeMs: 15,
    };
  },

  async traceRoute(target: string, maxHops: number = 15): Promise<TraceRouteResult> {
    const cleanTarget = target.trim();
    if (!cleanTarget) {
      return {
        target: '',
        hops: [],
        completed: false,
        error: 'Destino no especificado.',
      };
    }

    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('trace_route', { target: cleanTarget, maxHops });
        return {
          target: res.target || cleanTarget,
          hops: (res.hops || []).map((h: any) => ({
            hopNumber: h.hop_number,
            ip: h.ip,
            hostname: h.hostname,
            rttMs: h.rtt_ms,
            status: h.status || 'ok',
          })),
          completed: Boolean(res.completed),
          error: res.error,
        };
      } catch (err: any) {
        return {
          target: cleanTarget,
          hops: [],
          completed: false,
          error: `Error al trazar la ruta: ${err?.message || err}`,
        };
      }
    }

    return {
      target: cleanTarget,
      hops: [
        { hopNumber: 1, ip: '192.168.1.1', hostname: 'gateway.local', rttMs: 2, status: 'ok' },
        { hopNumber: 2, ip: '10.20.0.1', hostname: 'isp-node.net', rttMs: 14, status: 'ok' },
        { hopNumber: 3, ip: '142.250.190.46', hostname: cleanTarget, rttMs: 24, status: 'ok' },
      ],
      completed: true,
    };
  },

  async getActiveConnections(): Promise<NetworkConnectionInfo[]> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any[]>('get_active_connections');
        return res.map((c) => ({
          id: c.id,
          protocol: c.protocol as 'TCP' | 'UDP',
          localAddress: c.local_address,
          localPort: c.local_port,
          remoteAddress: c.remote_address,
          remotePort: c.remote_port,
          state: c.state,
          pid: c.pid,
          processName: c.process_name,
        }));
      } catch (err) {
        console.warn('Tauri invoke get_active_connections failed, using fallback:', err);
      }
    }
    return MOCK_CONNECTIONS;
  },
};
