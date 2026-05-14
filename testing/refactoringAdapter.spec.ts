import { runRefactoringAdapter, prioritize, toPatch } from '../integrations/refactoring-adapter/index.js';

describe('Refactoring Adapter Integration', () => {
  it('prioritizes unified issues by severity and confidence', async () => {
    const issues = [
      {
        id: 'low-1',
        agent: 'compliance',
        category: 'style',
        severity: 'low',
        confidence: 0.4,
        description: 'Low issue',
        recommendation: 'Fix style',
        fix: { autoApply: false }
      },
      {
        id: 'high-1',
        agent: 'optimization',
        category: 'performance',
        severity: 'high',
        confidence: 0.9,
        description: 'High issue',
        recommendation: 'Optimize this',
        fix: { autoApply: true }
      },
      {
        id: 'medium-1',
        agent: 'energy',
        category: 'efficiency',
        severity: 'medium',
        confidence: 0.8,
        description: 'Medium issue',
        recommendation: 'Improve energy',
        fix: { autoApply: false }
      }
    ];

    const result = await runRefactoringAdapter(issues, { useGoEngine: false });

    expect(result.prioritized[0].id).toBe('high-1');
    expect(result.prioritized[1].id).toBe('medium-1');
    expect(result.prioritized[2].id).toBe('low-1');
    expect(result.patches).toHaveLength(3);
    expect(result.patches[0]).toEqual(
      expect.objectContaining({
        issueId: 'high-1',
        autoApply: true,
        recommendation: 'Optimize this'
      })
    );
  });

  it('creates a patch fallback diff when explicit diff is missing', () => {
    const issue = {
      id: 'patch-1',
      filePath: 'src/Example.java',
      line: 12,
      agent: 'optimization',
      category: 'performance',
      severity: 'medium',
      description: 'Example patch issue',
      recommendation: 'Apply fix',
      explanation: 'Use faster algorithm',
      confidence: 0.75,
      fix: { code: 'return fastResult;', autoApply: false }
    };

    const patch = toPatch(issue);

    expect(patch).toEqual(
      expect.objectContaining({
        issueId: 'patch-1',
        filePath: 'src/Example.java',
        line: 12,
        recommendation: 'Apply fix',
        explanation: 'Use faster algorithm',
        autoApply: false,
        confidence: 0.75,
        agent: 'optimization',
        category: 'performance'
      })
    );
    expect(patch.diff).toBe('+ return fastResult;');
  });
});
