/**
 * Context Memory Integration Layer
 * - Store/retrieve analysis history per project/file
 * - Provide context to refactoring engine
 * - Cache frequent issues
 *
 * Storage: JSON files under a configurable root (e.g. modules/Context_Memory/output or a dedicated store).
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_STORE_ROOT = path.resolve(__dirname, '../../modules/Context_Memory/output');

/**
 * @param {string} [storeRoot]
 * @returns {{ getContext: (projectId: string, filePath?: string) => Promise<Object>, storeAnalysis: (projectId: string, data: Object) => Promise<void>, getCachedIssues: (projectId: string) => Promise<Array>, recordFix: (projectId: string, issueId: string) => Promise<void> }}
 */
export function createContextMemory(storeRoot = DEFAULT_STORE_ROOT) {
  const projectDir = (projectId) => path.join(storeRoot, projectId);
  const contextFile = (projectId, fileName) => path.join(projectDir(projectId), fileName || 'context.json');
  const historyFile = (projectId) => path.join(projectDir(projectId), 'history.json');

  return {
    async getContext(projectId, filePath) {
      const base = path.basename(filePath || '', '.java');
      const file = base ? `${base}.json` : 'context.json';
      const fp = contextFile(projectId, file);
      try {
        const data = await fs.readFile(fp, 'utf8');
        return JSON.parse(data);
      } catch {
        return {};
      }
    },

    async storeAnalysis(projectId, data) {
      const dir = projectDir(projectId);
      await fs.mkdir(dir, { recursive: true });
      const fp = path.join(dir, 'last_analysis.json');
      await fs.writeFile(fp, JSON.stringify({ ...data, storedAt: new Date().toISOString() }, null, 2), 'utf8');
    },

    async getCachedIssues(projectId) {
      try {
        const fp = path.join(projectDir(projectId), 'last_analysis.json');
        const data = await fs.readFile(fp, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.issues || [];
      } catch {
        return [];
      }
    },

    async recordFix(projectId, issueId) {
      const fp = historyFile(projectId);
      let history = { fixed: [] };
      try {
        const data = await fs.readFile(fp, 'utf8');
        history = JSON.parse(data);
      } catch {}
      if (!history.fixed) history.fixed = [];
      history.fixed.push({ issueId, at: new Date().toISOString() });
      await fs.mkdir(path.dirname(fp), { recursive: true });
      await fs.writeFile(fp, JSON.stringify(history, null, 2), 'utf8');
    }
  };
}

export const defaultContextMemory = createContextMemory();
