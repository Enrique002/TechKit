import { describe, it, expect, vi } from 'vitest';
import { urlService } from '../src/services/urlService';

describe('urlService Unit Tests', () => {
  it('validates correct HTTP and HTTPS URLs', () => {
    const resHttps = urlService.validateUrl('https://www.hwinfo.com/');
    expect(resHttps.valid).toBe(true);
    expect(resHttps.parsedUrl?.protocol).toBe('https:');

    const resHttp = urlService.validateUrl('http://nmap.org/download.html');
    expect(resHttp.valid).toBe(true);
    expect(resHttp.parsedUrl?.protocol).toBe('http:');
  });

  it('rejects empty, whitespace or malformed URLs', () => {
    const resEmpty = urlService.validateUrl('');
    expect(resEmpty.valid).toBe(false);
    expect(resEmpty.error).toContain('vacía');

    const resWhitespace = urlService.validateUrl('   ');
    expect(resWhitespace.valid).toBe(false);

    const resMalformed = urlService.validateUrl('not-a-valid-url');
    expect(resMalformed.valid).toBe(false);
    expect(resMalformed.error).toContain('no válido');
  });

  it('rejects potentially dangerous or disallowed schemes', () => {
    const resJs = urlService.validateUrl('javascript:alert("hacked")');
    expect(resJs.valid).toBe(false);
    expect(resJs.error).toContain('Protocolo no permitido');

    const resFile = urlService.validateUrl('file:///C:/Windows/System32/cmd.exe');
    expect(resFile.valid).toBe(false);
    expect(resFile.error).toContain('Protocolo no permitido');

    const resData = urlService.validateUrl('data:text/html,<h1>Test</h1>');
    expect(resData.valid).toBe(false);

    const resFtp = urlService.validateUrl('ftp://files.example.com');
    expect(resFtp.valid).toBe(false);
  });

  it('handles openUrl with valid and invalid URLs', async () => {
    // Invalid URL should fail immediately without attempting window.open
    const resInvalid = await urlService.openUrl('javascript:void(0)');
    expect(resInvalid.success).toBe(false);
    expect(resInvalid.error).toBeDefined();

    // Valid URL in mock browser environment
    const originalOpen = window.open;
    window.open = vi.fn().mockReturnValue({ closed: false });

    const resValid = await urlService.openUrl('https://crystalmark.info/');
    expect(resValid.success).toBe(true);
    expect(window.open).toHaveBeenCalledWith('https://crystalmark.info/', '_blank', 'noopener,noreferrer');

    window.open = originalOpen;
  });

  it('returns appropriate error if browser popup is blocked', async () => {
    const originalOpen = window.open;
    window.open = vi.fn().mockReturnValue(null); // Popup blocked

    const res = await urlService.openUrl('https://www.wireshark.org/');
    expect(res.success).toBe(false);
    expect(res.error).toContain('bloqueó');

    window.open = originalOpen;
  });
});
