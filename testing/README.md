# Testing

This folder contains unit tests for the repository using Vitest.

## Run tests

1. Install dependencies from the repository root:
   ```bash
   npm install
   ```

2. Run the full test suite:
   ```bash
   npm test
   ```

## Included tests

- `complianceAgent.spec.ts` - coverage for compliance rule analysis and raw code checks
- `suggestions.spec.ts` - validation of naming suggestion helpers
- `helpers.spec.ts` - utility validation for CI/CD helper functions
