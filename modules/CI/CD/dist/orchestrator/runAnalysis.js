"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jobResolver_1 = require("./jobResolver");
const parseAst_1 = require("./parseAst");
const formatter_1 = require("./formatter");
const fileReader_1 = require("../api-client/fileReader");
const energyAdapter_1 = require("../adapters/energyAdapter");
const agentAdapter_1 = require("../adapters/agentAdapter");
const refactorAdapter_1 = require("../adapters/refactorAdapter");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function parseArgs(argv) {
    const options = { format: 'json', ci: false, failOn: 'high' };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--job' && argv[i + 1])
            options.jobPath = argv[++i];
        else if (a === '--out' && argv[i + 1])
            options.outFile = argv[++i];
        else if (a === '--format' && argv[i + 1])
            options.format = argv[++i];
        else if (a === '--ci')
            options.ci = true;
        else if (a === '--fail-on' && argv[i + 1])
            options.failOn = argv[++i];
    }
    return options;
}
function buildInlineSuggestions(issues) {
    return issues.map((issue, idx) => ({
        id: issue.id || `inline_${idx}`,
        filePath: issue.filePath || 'Unknown.java',
        line: issue.line || 0,
        severity: issue.severity,
        message: issue.description,
        replacement: issue.fixedCode || issue.recommendation || ''
    }));
}
function buildReport(jobPath, issues, astMethodsScanned, energyFindings, refactorFixes, agentSuggestions) {
    const bySeverity = { high: 0, medium: 0, low: 0 };
    const bySource = {};
    for (const issue of issues) {
        bySeverity[issue.severity] += 1;
        const source = issue.source || 'ast';
        bySource[source] = (bySource[source] || 0) + 1;
    }
    return {
        generatedAt: new Date().toISOString(),
        jobPath,
        summary: { totalIssues: issues.length, bySeverity, bySource },
        issues,
        inlineSuggestions: buildInlineSuggestions(issues),
        detailed: { astMethodsScanned, energyFindings, refactorFixes, agentSuggestions }
    };
}
function toMarkdown(report) {
    const lines = [];
    lines.push('# GreenCode Integration Report', '');
    lines.push(`Generated: ${report.generatedAt}`);
    lines.push(`Job: ${report.jobPath}`, '');
    lines.push('## Summary');
    lines.push(`- Total issues: ${report.summary.totalIssues}`);
    lines.push(`- High: ${report.summary.bySeverity.high}`);
    lines.push(`- Medium: ${report.summary.bySeverity.medium}`);
    lines.push(`- Low: ${report.summary.bySeverity.low}`, '');
    lines.push('## Inline Suggestions');
    for (const s of report.inlineSuggestions.slice(0, 50)) {
        lines.push(`- [${s.severity.toUpperCase()}] ${s.filePath}:${s.line} - ${s.message}`);
    }
    lines.push('', '## Detailed Issues');
    report.issues.forEach((i) => {
        lines.push(`- ${i.filePath || 'Unknown'}:${i.line} [${i.severity}] ${i.issueType} - ${i.description}`);
    });
    return lines.join('\n');
}
function toSarif(report) {
    return {
        version: '2.1.0',
        runs: [
            {
                tool: { driver: { name: 'GreenCode Integration Module', version: '1.0.0' } },
                results: report.issues.map((issue) => ({
                    ruleId: issue.issueType,
                    level: issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'note',
                    message: { text: issue.description },
                    locations: [{
                            physicalLocation: {
                                artifactLocation: { uri: issue.filePath || 'Unknown.java' },
                                region: { startLine: Math.max(1, issue.line || 1) }
                            }
                        }]
                }))
            }
        ]
    };
}
function shouldFailCi(report, failOn) {
    if (failOn === 'low')
        return report.summary.totalIssues > 0;
    if (failOn === 'medium')
        return report.summary.bySeverity.high > 0 || report.summary.bySeverity.medium > 0;
    return report.summary.bySeverity.high > 0;
}
function getDefaultOutputPath(jobPath, format) {
    const integrationDir = path.join(jobPath, 'integration');
    const ext = format === 'markdown' ? 'md' : format === 'sarif' ? 'sarif' : 'json';
    return path.join(integrationDir, `integration-report.${ext}`);
}
async function run() {
    try {
        const opts = parseArgs(process.argv.slice(2));
        const jobPath = opts.jobPath || (0, jobResolver_1.getLatestJobFolder)();
        const ast = (0, parseAst_1.readAstJson)(jobPath);
        const astIssues = (0, formatter_1.formatIssuesFromAst)(ast);
        const energyIssues = (0, energyAdapter_1.adaptEnergy)((0, fileReader_1.readModuleOutput)(jobPath, 'energy'));
        const agentIssues = (0, agentAdapter_1.adaptAgent)((0, fileReader_1.readModuleOutput)(jobPath, 'agent'));
        const refactorIssues = (0, refactorAdapter_1.adaptRefactor)((0, fileReader_1.readModuleOutput)(jobPath, 'refactor'));
        const issues = [...astIssues, ...energyIssues, ...agentIssues, ...refactorIssues];
        const astMethodsScanned = Array.isArray(ast?.classes)
            ? ast.classes.reduce((acc, cls) => acc + (cls.methods?.length || 0), 0)
            : 0;
        const report = buildReport(jobPath, issues, astMethodsScanned, energyIssues.length, refactorIssues.length, agentIssues.length);
        let output = JSON.stringify(report, null, 2);
        if (opts.format === 'markdown')
            output = toMarkdown(report);
        if (opts.format === 'sarif')
            output = JSON.stringify(toSarif(report), null, 2);
        const outPath = opts.outFile
            ? (path.isAbsolute(opts.outFile) ? opts.outFile : path.join(process.cwd(), opts.outFile))
            : getDefaultOutputPath(jobPath, opts.format);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, output, 'utf8');
        console.log(JSON.stringify({ status: 'ok', output: outPath }));
        if (opts.ci && shouldFailCi(report, opts.failOn))
            process.exit(2);
    }
    catch (error) {
        console.error(JSON.stringify({
            error: error.message
        }));
        process.exit(1);
    }
}
run();
