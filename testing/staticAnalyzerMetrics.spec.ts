import { calculateCyclomaticComplexity } from '../modules/static-analyzer/src/analysis/metrics/CyclomaticComplexity';
import { calculateFunctionSize } from '../modules/static-analyzer/src/analysis/metrics/FunctionSize';

describe('Static Analyzer - Code Metrics', () => {
  it('calculates cyclomatic complexity based on conditionals', () => {
    const methodSimple = {
      name: 'simple',
      conditionals: []
    };
    expect(calculateCyclomaticComplexity(methodSimple)).toBe(1);

    const methodWithIfs = {
      name: 'withIfs',
      conditionals: [
        { type: 'if' },
        { type: 'if' },
        { type: 'else-if' }
      ]
    };
    expect(calculateCyclomaticComplexity(methodWithIfs)).toBe(4);
  });

  it('handles null/undefined conditionals gracefully', () => {
    expect(calculateCyclomaticComplexity(null)).toBe(1);
    expect(calculateCyclomaticComplexity(undefined)).toBe(1);
    expect(calculateCyclomaticComplexity({})).toBe(1);
    expect(calculateCyclomaticComplexity({ conditionals: null })).toBe(1);
  });

  it('calculates function size by counting statement nodes', () => {
    const method = {
      body: {
        children: {
          statements: [
            { name: 'ExpressionStatement', children: {} },
            { name: 'ReturnStatement', children: {} },
            { name: 'IfStatement', children: {} }
          ]
        }
      }
    };
    expect(calculateFunctionSize(method)).toBe(3);
  });

  it('counts nested statements correctly', () => {
    const method = {
      body: {
        children: {
          statements: [
            {
              name: 'ForStatement',
              children: {
                body: [
                  { name: 'ExpressionStatement', children: {} },
                  { name: 'IfStatement', children: {} }
                ]
              }
            },
            { name: 'ReturnStatement', children: {} }
          ]
        }
      }
    };
    const size = calculateFunctionSize(method);
    expect(size).toBeGreaterThanOrEqual(3);
  });
});
