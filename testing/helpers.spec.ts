import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  exists,
  readJsonFile,
  getFirstJsonFile,
  getDirectories,
  getLatestDirectory,
  safeStringify,
} from '../modules/CI/CD/utils/helpers';

describe('CI/CD helper utilities', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'greencode-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('validates path existence correctly', () => {
    const filePath = path.join(tempDir, 'example.txt');
    expect(exists(filePath)).toBe(false);
    fs.writeFileSync(filePath, 'hello');
    expect(exists(filePath)).toBe(true);
  });

  it('reads JSON files and returns null for invalid paths', () => {
    const jsonPath = path.join(tempDir, 'data.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ hello: 'world' }));

    expect(readJsonFile(jsonPath)).toEqual({ hello: 'world' });
    expect(readJsonFile(path.join(tempDir, 'missing.json'))).toBeNull();
  });

  it('locates the first JSON file in a directory', () => {
    const a = path.join(tempDir, 'a.json');
    const b = path.join(tempDir, 'b.json');
    fs.writeFileSync(a, '{}');
    fs.writeFileSync(b, '{}');

    expect(getFirstJsonFile(tempDir)).toBe(a);
  });

  it('lists directories and finds the latest modified directory', () => {
    const dirA = path.join(tempDir, 'one');
    const dirB = path.join(tempDir, 'two');
    fs.mkdirSync(dirA);
    fs.mkdirSync(dirB);
    fs.writeFileSync(path.join(dirB, 'content.txt'), 'x');
    fs.utimesSync(dirB, new Date(Date.now() + 1000), new Date(Date.now() + 1000));

    expect(getDirectories(tempDir).sort()).toEqual([dirA, dirB].sort());
    expect(getLatestDirectory(tempDir)).toBe(dirB);
  });

  it('returns a stable fallback string for circular objects', () => {
    const circular: Record<string, any> = { a: 1 };
    circular.self = circular;

    const result = safeStringify(circular);
    expect(result).toContain('Failed to stringify data');
  });
});
