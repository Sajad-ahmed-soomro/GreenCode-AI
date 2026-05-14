import {
  suggestCamelCase,
  suggestPascalCase,
  suggestUpperSnakeCase,
  suggestGetterMethodName,
  suggestSetterMethodName,
  suggestBooleanGetterMethodName,
} from '../modules/Multi_Agent/compliance/src/suggestions';

describe('Compliance suggestion helpers', () => {
  it('converts snake_case and PascalCase to camelCase', () => {
    expect(suggestCamelCase('bad_function')).toContain("'bad_function'");
    expect(suggestCamelCase('BadFunction')).toContain('badFunction');
  });

  it('converts camelCase and snake_case to PascalCase', () => {
    expect(suggestPascalCase('user_name')).toContain('UserName');
    expect(suggestPascalCase('userName')).toContain('UserName');
  });

  it('converts camelCase to UPPER_SNAKE_CASE', () => {
    expect(suggestUpperSnakeCase('userName')).toContain('USER_NAME');
    expect(suggestUpperSnakeCase('MaxValue')).toContain('MAX_VALUE');
  });

  it('produces getter, setter, and boolean getter suggestions', () => {
    expect(suggestGetterMethodName('userName')).toContain('getUserName()');
    expect(suggestSetterMethodName('userName')).toContain('setUserName()');
    expect(suggestBooleanGetterMethodName('active')).toContain('isActive()');
  });
});
