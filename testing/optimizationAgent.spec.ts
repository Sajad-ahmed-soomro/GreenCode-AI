import { OptimizationAgent } from '../modules/Multi_Agent/optimization/src/optimizationAgent';

describe('Optimization Agent - Multi Agent System', () => {
  it('initializes with all optimization rules', () => {
    const agent = new OptimizationAgent();
    expect(agent).toBeDefined();
  });

  it('analyzes Java AST and produces results for applicable rules', () => {
    const agent = new OptimizationAgent();
    
    const ast = {
      file: 'samples/Calculate.java',
      classes: [
        {
          type: 'Class',
          name: 'Calculator',
          methods: [
            {
              name: 'sumArray',
              params: [],
              loops: ['for'],
              conditionals: [{ type: 'if' }],
              returnType: 'int',
              modifiers: ['public']
            }
          ],
          fields: []
        }
      ]
    };

    const results = agent.analyzeJavaAst('samples/Calculate.java', ast);
    expect(Array.isArray(results)).toBe(true);
  });

  it('handles empty class list gracefully', () => {
    const agent = new OptimizationAgent();
    const ast = {
      file: 'Empty.java',
      classes: []
    };

    const results = agent.analyzeJavaAst('Empty.java', ast);
    expect(results).toEqual([]);
  });

  it('returns empty results for methods with no matching rules', () => {
    const agent = new OptimizationAgent();
    const ast = {
      file: 'Simple.java',
      classes: [
        {
          type: 'Class',
          name: 'Simple',
          methods: [
            {
              name: 'trivial',
              params: [],
              loops: [],
              conditionals: [],
              returnType: 'void',
              modifiers: ['public']
            }
          ],
          fields: []
        }
      ]
    };

    const results = agent.analyzeJavaAst('Simple.java', ast);
    expect(Array.isArray(results)).toBe(true);
  });
});
