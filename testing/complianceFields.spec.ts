import ComplianceAgent from '../modules/Multi_Agent/compliance/src/compliance_agent';

describe('ComplianceAgent field and getter/setter rules', () => {
  it('flags static final fields that are not UPPER_SNAKE_CASE', () => {
    const code = `class Constants {
  static final int MaxValue = 10;
}`;
    const ast = {
      file: 'Constants.java',
      classes: [
        {
          name: 'Constants',
          line: 1,
          fields: [
            { name: 'MaxValue', line: 2 }
          ]
        }
      ]
    };

    const result = new ComplianceAgent().analyze(code, ast);
    expect(result.issues.some(i => i.name === 'MaxValue')).toBe(true);
    expect(result.issues.some(i => i.message.includes('UPPER_SNAKE_CASE'))).toBe(true);
    expect(result.suggestions.some(s => s.suggestion.includes('USER_NAME'))).toBe(false);
    expect(result.suggestions.some(s => s.suggestion.includes('MAX_VALUE'))).toBe(true);
  });

  it('flags getter/setter methods that do not follow Java naming conventions', () => {
    const code = `class Person {
  public String getname() { return ""; }
  public void setname(String name) { }
}`;
    const ast = {
      file: 'Person.java',
      classes: [
        {
          name: 'Person',
          line: 1,
          methods: [
            { name: 'getname', line: 2 },
            { name: 'setname', line: 3 }
          ],
          fields: []
        }
      ]
    };

    const result = new ComplianceAgent().analyze(code, ast);
    expect(result.issues.some(i => i.name === 'getname')).toBe(true);
    expect(result.issues.some(i => i.name === 'setname')).toBe(true);
    expect(result.suggestions.some(s => s.suggestion.includes('getName()'))).toBe(true);
    expect(result.suggestions.some(s => s.suggestion.includes('setName()'))).toBe(true);
  });
});
