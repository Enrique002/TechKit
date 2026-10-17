import { describe, it, expect, vi } from 'vitest';
import { isValidUrl, urlService } from '../src/services/urlService';

describe('urlService Security & External Links', () => {
  it('validates safe HTTP and HTTPS URLs', () => {
    expect(isValidUrl('https://www.hwinfo.com/')).toBe(true);
    expect(isValidUrl('http://crystalmark.info/')).toBe(true);
    expect(isValidUrl('https://learn.microsoft.com/sysinternals')).toBe(true);
  });

  it('rejects unsafe protocols and malicious schemas', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('file:///C:/Windows/System32/calc.exe')).toBe(false);
    expect(isValidUrl('data:text/html,test')).toBe(false);
    expect(isValidUrl('powershell -Command calc')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });

  it('handles invalid URLs gracefully without crashing', async () => {
    const res = await urlService.openExternalUrl('javascript:void(0)');
    expect(res.success).toBe(false);
    expect(res.message).toContain('no es válida');
  });

  it('invokes window.open for valid HTTPS URLs in web fallback environment', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const res = await urlService.openExternalUrl('https://www.wireshark.org/');
    expect(res.success).toBe(true);
    expect(openSpy).toHaveBeenCalledWith('https://www.wireshark.org/', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });
});
