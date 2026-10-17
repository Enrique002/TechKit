import { describe, it, expect } from 'vitest';
import { securityService } from '../src/services/securityService';

describe('securityService', () => {
  it('computes MD5, SHA1, SHA256 hashes for text', async () => {
    const hashes = await securityService.computeTextHashes('TechKit Test');
    expect(hashes.md5).toBeTruthy();
    expect(hashes.sha1).toBeTruthy();
    expect(hashes.sha256).toBeTruthy();
  });

  it('fetches security status', async () => {
    const status = await securityService.getSecurityStatus();
    expect(status.defenderActive).toBe(true);
    expect(status.firewallActive).toBe(true);
  });
});
