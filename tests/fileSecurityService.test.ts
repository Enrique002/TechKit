import { describe, it, expect } from 'vitest';
import { fileSecurityService } from '../src/services/fileSecurityService';

describe('fileSecurityService (Phase 4 Unit Tests)', () => {
  it('analyzes file info and verifies extension vs content match', async () => {
    const mockFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const result = await fileSecurityService.analyzeFile(mockFile);

    expect(result.name).toBe('test.txt');
    expect(result.extension).toBe('txt');
    expect(result.sizeBytes).toBe(11);
    expect(result.accessStatus).toBe('accessible');
    expect(result.extensionMimeMatch).toBe(true);
  });

  it('calculates real crypto SHA-256 and SHA-512 hashes for File objects', async () => {
    const mockFile = new File(['techkit test'], 'sample.bin', { type: 'application/octet-stream' });
    const hashes = await fileSecurityService.calculateHashes(mockFile);

    expect(hashes.fileName).toBe('sample.bin');
    expect(hashes.sha256).toBeDefined();
    expect(hashes.sha256.length).toBe(64);
    expect(hashes.sha512).toBeDefined();
    expect(hashes.sha512.length).toBe(128);
    expect(hashes.md5).toBeDefined();
    expect(hashes.status).toBe('completed');
  });

  it('compares two identical files and returns match true', async () => {
    const file1 = new File(['same content'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['same content'], 'file2.txt', { type: 'text/plain' });

    const result = await fileSecurityService.compareFiles(file1, file2);

    expect(result.sizesMatch).toBe(true);
    expect(result.hashesMatch).toBe(true);
    expect(result.areIdentical).toBe(true);
  });

  it('compares two different files and returns match false', async () => {
    const file1 = new File(['content A'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content B with extra length'], 'file2.txt', { type: 'text/plain' });

    const result = await fileSecurityService.compareFiles(file1, file2);

    expect(result.areIdentical).toBe(false);
  });

  it('retrieves file metadata and identifies executables vs documents', async () => {
    const exeFile = new File(['binary content'], 'setup.exe', { type: 'application/vnd.microsoft.portable-executable' });
    const meta = await fileSecurityService.getFileMetadata(exeFile);

    expect(meta.name).toBe('setup.exe');
    expect(meta.hasExecutableHeader).toBe(true);
    expect(meta.publisher).toBeDefined();
  });

  it('verifies digital signature status distinguishing valid vs unsigned', async () => {
    const exeRes = await fileSecurityService.verifyDigitalSignature('app.exe');
    expect(exeRes.status).toBe('valid');
    expect(exeRes.signerName).toBeDefined();

    const txtRes = await fileSecurityService.verifyDigitalSignature('document.txt');
    expect(txtRes.status).toBe('unsigned');
    expect(txtRes.signerName).toBeUndefined();
  });

  it('queries Defender status and handles scan requests safely', async () => {
    const status = await fileSecurityService.getDefenderStatus();
    expect(status.isAvailable).toBe(true);
    expect(status.realTimeProtection).toBe('enabled');

    const scanResult = await fileSecurityService.scanFileDefender('sample.exe');
    expect(scanResult.requested).toBe(true);
    expect(scanResult.scanStatus).toBe('requested');
  });
});
