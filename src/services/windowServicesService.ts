import { invoke } from '@tauri-apps/api/core';
import { WindowsServiceInfo, ServiceControlResult } from '../types';

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

const MOCK_SERVICES: WindowsServiceInfo[] = [
  {
    name: 'wuauserv',
    displayName: 'Windows Update',
    status: 'Running',
    startType: 'Manual',
    description: 'Habilita la detección, descarga e instalación de actualizaciones para Windows.',
    isCritical: false,
  },
  {
    name: 'Spooler',
    displayName: 'Cola de impresión (Print Spooler)',
    status: 'Running',
    startType: 'Automatic',
    description: 'Carga archivos en la memoria para imprimirlos más tarde.',
    isCritical: false,
  },
  {
    name: 'Dnscache',
    displayName: 'Cliente DNS (DNS Cache)',
    status: 'Running',
    startType: 'Automatic',
    description: 'Resuelve y almacena en caché los nombres de dominio para este equipo.',
    isCritical: true,
  },
  {
    name: 'WinDefend',
    displayName: 'Microsoft Defender Antivirus Service',
    status: 'Running',
    startType: 'Automatic',
    description: 'Ayuda a proteger a los usuarios frente a malware y software no deseado.',
    isCritical: true,
  },
  {
    name: 'EventLog',
    displayName: 'Registro de eventos de Windows',
    status: 'Running',
    startType: 'Automatic',
    description: 'Mantiene el registro de eventos generados por aplicaciones y el sistema.',
    isCritical: true,
  },
  {
    name: 'Dhcp',
    displayName: 'Cliente DHCP',
    status: 'Running',
    startType: 'Automatic',
    description: 'Registra y actualiza las direcciones IP y las configuraciones DNS.',
    isCritical: true,
  },
  {
    name: 'sysmain',
    displayName: 'SysMain (Superfetch)',
    status: 'Running',
    startType: 'Automatic',
    description: 'Mantiene y mejora el rendimiento del sistema a lo largo del tiempo.',
    isCritical: false,
  },
  {
    name: 'bits',
    displayName: 'Servicio de transferencia inteligente en segundo plano (BITS)',
    status: 'Stopped',
    startType: 'Manual',
    description: 'Transfiere archivos en segundo plano con el ancho de banda inactivo de red.',
    isCritical: false,
  },
];

export const windowServicesService = {
  async getServices(): Promise<WindowsServiceInfo[]> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any[]>('get_windows_services');
        return res.map((s) => ({
          name: s.name,
          displayName: s.display_name || s.name,
          status: s.status || 'Unknown',
          startType: s.start_type || 'Unknown',
          description: s.description || 'Sin descripción disponible',
          isCritical: Boolean(s.is_critical),
        }));
      } catch (err) {
        console.warn('Tauri invoke get_windows_services failed, using fallback:', err);
      }
    }
    return MOCK_SERVICES;
  },

  async controlService(serviceName: string, action: 'start' | 'stop'): Promise<ServiceControlResult> {
    const target = MOCK_SERVICES.find((s) => s.name.toLowerCase() === serviceName.toLowerCase());
    if (target?.isCritical) {
      return {
        success: false,
        message: `El servicio '${serviceName}' es esencial para el sistema operativo Windows y no puede alterarse.`,
        serviceName,
      };
    }

    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('control_windows_service', { serviceName, action });
        return {
          success: Boolean(res.success),
          message: res.message || 'Operación de servicio enviada a Windows.',
          serviceName,
          newStatus: res.new_status,
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Error al intentar ${action === 'start' ? 'iniciar' : 'detener'} el servicio: ${err?.message || err}`,
          serviceName,
        };
      }
    }

    // Mock response
    return {
      success: true,
      message: `El servicio '${serviceName}' se ha ${action === 'start' ? 'iniciado' : 'detenido'} correctamente (Entorno de pruebas web).`,
      serviceName,
      newStatus: action === 'start' ? 'Running' : 'Stopped',
    };
  },
};
