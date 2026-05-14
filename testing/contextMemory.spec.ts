import fs from 'fs';
import os from 'os';
import path from 'path';
import { createContextMemory } from '../integrations/context-memory/index.js';

describe('Context Memory Integration', () => {
  it('stores analysis and retrieves cached issues', async () => {
    const storeRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'greencode-context-'));
    const memory = createContextMemory(storeRoot);
    const projectId = 'project-123';
    const analysisData = {
      issues: [
        { id: 'issue-1', description: 'Example issue' }
      ],
      metadata: { version: '1.0' }
    };

    await memory.storeAnalysis(projectId, analysisData);
    const cachedIssues = await memory.getCachedIssues(projectId);

    expect(cachedIssues).toEqual(analysisData.issues);

    const context = await memory.getContext(projectId, 'Example.java');
    expect(context).toEqual({});

    await memory.recordFix(projectId, 'issue-1');
    const historyPath = path.join(storeRoot, projectId, 'history.json');
    const storedHistory = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

    expect(storedHistory.fixed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ issueId: 'issue-1' })
      ])
    );

    fs.rmSync(storeRoot, { recursive: true, force: true });
  });
});
