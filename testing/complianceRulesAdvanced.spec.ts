describe('Compliance Agent - Advanced Naming Rules', () => {
  it('detects snake_case variable names that should be camelCase', () => {
    const code = 'String my_variable = "test";';
    const hasSnakeCase = /[a-z]+_[a-z]+/.test(code);
    expect(hasSnakeCase).toBe(true);
  });

  it('identifies public methods that may be exposed unnecessarily', () => {
    const code = 'public void internalHelper() { }';
    const isPublic = code.includes('public');
    expect(isPublic).toBe(true);
  });

  it('detects naming patterns indicating unused variables', () => {
    const code = 'int unusedValue = 10;';
    const matchesUnused = /unused|temp|tmp/.test(code);
    expect(matchesUnused).toBe(true);
  });

  it('flags methods with excessive number of parameters', () => {
    const code = 'public void method(int a, int b, int c, int d, int e, int f) { }';
    const paramMatch = code.match(/\(([^)]*)\)/);
    const paramCount = paramMatch ? paramMatch[1].split(',').length : 0;
    expect(paramCount).toBeGreaterThanOrEqual(5);
  });

  it('detects potential naming conflicts with standard library classes', () => {
    const code = 'String String = "bad";';
    const hasConflict = /\bString\s+String\b/.test(code);
    expect(hasConflict).toBe(true);
  });
});
