/**
 * Unified issue type for GreenCode AI pipeline.
 * All agents normalize to this format for Context Memory and Refactoring Engine.
 */

/** @typedef {'data-structures' | 'compliance' | 'maintainability' | 'optimization' | 'energy'} AgentType */
/** @typedef {'performance' | 'security' | 'maintainability' | 'energy' | 'style' | 'other'} CategoryType */
/** @typedef {'low' | 'medium' | 'high'} SeverityType */
/** @typedef {'code' | 'suggestion' | 'refactor'} FixType */

/**
 * @typedef {Object} UnifiedIssue
 * @property {string} id
 * @property {string} filePath
 * @property {number} line
 * @property {AgentType} agent
 * @property {CategoryType} category
 * @property {SeverityType} severity
 * @property {number} confidence
 * @property {string} description
 * @property {string} explanation
 * @property {string} recommendation
 * @property {{ type: FixType, diff?: string, code?: string, autoApply: boolean }} fix
 * @property {{ projectId?: string, userId?: string, frequency?: number, previouslyFixed?: boolean }} [context]
 */

/**
 * @typedef {Object} OrchestratorResult
 * @property {string} scanId
 * @property {UnifiedIssue[]} issues
 * @property {Object} rawByAgent
 * @property {string} timestamp
 */

export const AGENT_TYPES = ['data-structures', 'compliance', 'maintainability', 'optimization', 'energy'];
export const CATEGORIES = ['performance', 'security', 'maintainability', 'energy', 'style', 'other'];
export const SEVERITIES = ['low', 'medium', 'high'];
