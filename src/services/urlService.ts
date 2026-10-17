import { invoke } from '@tauri-apps/api/core';

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const urlService = {
  async openExternalUrl(url: string): Promise<{ success: boolean; message: string }> {
    if (!isValidUrl(url)) {
      console.warn('URL insegura o no válida rechazada:', url);
      return {
        success: false,
        message: `La dirección URL '${url}' no es válida o utiliza un protocolo no permitido (únicamente se permite http: y https:).`,
      };
    }

    const cleanUrl = url.trim();

    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('open_external_url', { url: cleanUrl });
        return {
          success: Boolean(res.success),
          message: res.message || 'Página web abierta en el navegador predeterminado.',
        };
      } catch (err: any) {
        console.warn('Tauri invoke open_external_url failed, trying window.open fallback:', err);
      }
    }

    try {
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
      return {
        success: true,
        message: 'Dirección abierta en una nueva pestaña del navegador.',
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Error al intentar abrir la dirección web: ${e?.message || e}`,
      };
    }
  },
};
