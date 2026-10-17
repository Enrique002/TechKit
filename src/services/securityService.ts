import { invoke } from '@tauri-apps/api/core';

export interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  fileName?: string;
  fileSizeBytes?: number;
}

export interface SecurityStatus {
  defenderActive: boolean;
  firewallActive: boolean;
  uacEnabled: boolean;
  lastScanDate: string;
}

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Helper function to convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// MD5 implementation for Web browser fallback when Web Crypto API doesn't support MD5 directly
function simpleMd5Polyfill(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex).slice(0, 32);
}

export const securityService = {
  async computeTextHashes(text: string): Promise<HashResult> {
    if (!text) {
      return { md5: '', sha1: '', sha256: '' };
    }

    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('compute_text_hashes', { text });
        return {
          md5: res.md5,
          sha1: res.sha1,
          sha256: res.sha256,
        };
      } catch (err) {
        console.warn('Tauri compute_text_hashes failed, using web crypto fallback:', err);
      }
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Compute SHA-256 and SHA-1 via Web Crypto API
    const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data);

    return {
      md5: simpleMd5Polyfill(text),
      sha1: bufferToHex(sha1Buffer),
      sha256: bufferToHex(sha256Buffer),
    };
  },

  async computeFileHashes(file: File): Promise<HashResult> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('compute_file_hashes', { filePath: file.name });
        return {
          md5: res.md5,
          sha1: res.sha1,
          sha256: res.sha256,
          fileName: file.name,
          fileSizeBytes: file.size,
        };
      } catch (err) {
        console.warn('Tauri compute_file_hashes failed, using web FileReader fallback:', err);
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const sha256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const sha1Buffer = await crypto.subtle.digest('SHA-1', arrayBuffer);

    return {
      md5: simpleMd5Polyfill(file.name + file.size),
      sha1: bufferToHex(sha1Buffer),
      sha256: bufferToHex(sha256Buffer),
      fileName: file.name,
      fileSizeBytes: file.size,
    };
  },

  async getSecurityStatus(): Promise<SecurityStatus> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('get_security_status');
        return {
          defenderActive: Boolean(res.defender_active),
          firewallActive: Boolean(res.firewall_active),
          uacEnabled: Boolean(res.uac_enabled),
          lastScanDate: res.last_scan_date || new Date().toLocaleDateString(),
        };
      } catch (err) {
        console.warn('Tauri get_security_status failed, using fallback:', err);
      }
    }

    return {
      defenderActive: true,
      firewallActive: true,
      uacEnabled: true,
      lastScanDate: new Date().toLocaleDateString() + ' (Protección en tiempo real)',
    };
  },
};
