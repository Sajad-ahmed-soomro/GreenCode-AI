import { getLatestJobFolder } from './jobResolver';
import { readAstJson } from './parseAst';
import { formatIssuesFromAst } from './formatter';
import { readModuleOutput } from '../api-client/fileReader';
import { adaptEnergy } from '../adapters/energyAdapter';
import { adaptAgent } from '../adapters/agentAdapter';
import { adaptRefactor } from '../adapters/refactorAdapter';
import { IntegrationReport, Issue, InlineSuggestion } from '../api-client/types';
import * as fs from 'fs';
import * as path from 'path';

type CliOptions = {
    jobPath?: string;
    outFile?: string;
    format: 'json' | 'markdown' | 'sarif';
    ci: boolean;
    failOn: 'high' | 'medium' | 'low';
};

function parseArgs(argv: string[]): CliOptions {
    const options: CliOptions = { format: 'json', ci: false, failOn: 'high' };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--job' && argv[i + 1]) options.jobPath = argv[++i];
        else if (a === '--out' && argv[i + 1]) options.outFile = argv[++i];
        else if (a === '--format' && argv[i + 1]) options.format = (argv[++i] as CliOptions['format']);
        else if (a === '--ci') options.ci = true;
        else if (a === '--fail-on' && argv[i + 1]) options.failOn = (argv[++i] as CliOptions['failOn']);
    }
    return options;
}

function buildInlineSuggestions(issues: Issue[]): InlineSuggestion[] {
    return issues.map((issue, idx) => ({
        id: issue.id || `inline_${idx}`,
        filePath: issue.filePath || 'Unknown.java',
        line: issue.line || 0,
        severity: issue.severity,
        message: issue.description,
        replacement: issue.fixedCode || issue.recommendation || ''
    }));
}

function buildReport(jobPath: string, issues: Issue[], astMethodsScanned: number, energyFindings: number, refactorFixes: number, agentSuggestions: number): IntegrationReport {
    const bySeverity: Record<'high' | 'medium' | 'low', number> = { high: 0, medium: 0, low: 0 };
    const bySource: Record<string, number> = {};
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

function toMarkdown(report: IntegrationReport): string {
    const lines: string[] = [];
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

function toSarif(report: IntegrationReport): any {
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

function shouldFailCi(report: IntegrationReport, failOn: CliOptions['failOn']): boolean {
    if (failOn === 'low') return report.summary.totalIssues > 0;
    if (failOn === 'medium') return report.summary.bySeverity.high > 0 || report.summary.bySeverity.medium > 0;
    return report.summary.bySeverity.high > 0;
}

function getDefaultOutputPath(jobPath: string, format: CliOptions['format']): string {
    const integrationDir = path.join(jobPath, 'integration');
    const ext = format === 'markdown' ? 'md' : format === 'sarif' ? 'sarif' : 'json';
    return path.join(integrationDir, `integration-report.${ext}`);
}

async function run() {
    try {
        const opts = parseArgs(process.argv.slice(2));
        const jobPath = opts.jobPath || getLatestJobFolder();
        const ast = readAstJson(jobPath);
        const astIssues = formatIssuesFromAst(ast) as Issue[];
        const energyIssues = adaptEnergy(readModuleOutput(jobPath, 'energy')) as Issue[];
        const agentIssues = adaptAgent(readModuleOutput(jobPath, 'agent')) as Issue[];
        const refactorIssues = adaptRefactor(readModuleOutput(jobPath, 'refactor')) as Issue[];
        const issues: Issue[] = [...astIssues, ...energyIssues, ...agentIssues, ...refactorIssues];
        const astMethodsScanned = Array.isArray(ast?.classes)
            ? ast.classes.reduce((acc: number, cls: any) => acc + (cls.methods?.length || 0), 0)
            : 0;
        const report = buildReport(jobPath, issues, astMethodsScanned, energyIssues.length, refactorIssues.length, agentIssues.length);

        let output = JSON.stringify(report, null, 2);
        if (opts.format === 'markdown') output = toMarkdown(report);
        if (opts.format === 'sarif') output = JSON.stringify(toSarif(report), null, 2);

        const outPath = opts.outFile
            ? (path.isAbsolute(opts.outFile) ? opts.outFile : path.join(process.cwd(), opts.outFile))
            : getDefaultOutputPath(jobPath, opts.format);
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, output, 'utf8');
        console.log(JSON.stringify({ status: 'ok', output: outPath }));

        if (opts.ci && shouldFailCi(report, opts.failOn)) process.exit(2);
    } catch (error: any) {
        console.error(JSON.stringify({
            error: error.message
        }));
        process.exit(1);
    }
}

run();