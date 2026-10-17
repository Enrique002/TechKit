import { openUrl as openTauriUrl } from '@tauri-apps/plugin-opener';

export interface UrlValidationResult {
  valid: boolean;
  parsedUrl?: URL;
  error?: string;
}

export interface OpenUrlResult {
  success: boolean;
  error?: string;
}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const urlService = {
  validateUrl(urlStr: string): UrlValidationResult {
    if (!urlStr || typeof urlStr !== 'string' || !urlStr.trim()) {
      return {
        valid: false,
        error: 'La dirección URL está vacía.',
      };
    }

    const cleanUrl = urlStr.trim();

    try {
      const parsed = new URL(cleanUrl);
      if (!ALLOWED_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
        return {
          valid: false,
          error: `Protocolo no permitido '${parsed.protocol}'. Solo se admiten conexiones 'http:' y 'https:'.`,
        };
      }

      return {
        valid: true,
        parsedUrl: parsed,
      };
    } catch {
      return {
        valid: false,
        error: `Formato de URL no válido: '${cleanUrl}'. Debe incluir un protocolo válido (ej: https://...).`,
      };
    }
  },

  async openUrl(urlStr: string): Promise<OpenUrlResult> {
    const validation = this.validateUrl(urlStr);
    if (!validation.valid || !validation.parsedUrl) {
      const errMsg = validation.error || 'URL no válida.';
      console.warn('URL bloqueada o no válida:', errMsg);
      return {
        success: false,
        error: errMsg,
      };
    }

    const targetUrl = validation.parsedUrl.toString();

    if (isTauriEnv()) {
      try {
        await openTauriUrl(targetUrl);
        return { success: true };
      } catch (err: any) {
        const errorDetail = err?.message || String(err);
        console.error('Error al abrir URL con plugin-opener de Tauri:', errorDetail);
        return {
          success: false,
          error: `No se pudo abrir el navegador predeterminado: ${errorDetail}`,
        };
      }
    } else {
      try {
        const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          return {
            success: false,
            error: 'El navegador bloqueó la apertura de la ventana emergente.',
          };
        }
        return { success: true };
      } catch (err: any) {
        const errorDetail = err?.message || String(err);
        console.error('Error al abrir URL en navegador web:', errorDetail);
        return {
          success: false,
          error: `Error al intentar abrir la ventana: ${errorDetail}`,
        };
      }
    }
  },
};
