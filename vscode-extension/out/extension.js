"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const DIAGNOSTIC_COLLECTION = 'greencode';
let diagnosticCollection;
let statusBarItem;
let highCriticalDecoration;
let mediumCriticalDecoration;
let lowCriticalDecoration;
let highEnergyDecoration;
let classSummaryDecoration;
let codeLensEmitter;
let lastAnalysis = { issues: [], patches: [] };
function activate(context) {
    console.log('GreenCode AI extension activated');
    diagnosticCollection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_COLLECTION);
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    highCriticalDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: 'rgba(255, 76, 76, 0.16)',
        border: '1px solid rgba(255, 76, 76, 0.7)',
        overviewRulerColor: 'rgba(255, 76, 76, 0.95)',
        overviewRulerLane: vscode.OverviewRulerLane.Right
    });
    mediumCriticalDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: 'rgba(255, 179, 71, 0.12)',
        border: '1px solid rgba(255, 179, 71, 0.55)',
        overviewRulerColor: 'rgba(255, 179, 71, 0.9)',
        overviewRulerLane: vscode.OverviewRulerLane.Right
    });
    lowCriticalDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: 'rgba(70, 189, 103, 0.1)',
        border: '1px solid rgba(70, 189, 103, 0.5)',
        overviewRulerColor: 'rgba(70, 189, 103, 0.85)',
        overviewRulerLane: vscode.OverviewRulerLane.Right
    });
    highEnergyDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: 'rgba(255, 45, 85, 0.22)',
        border: '1px solid rgba(255, 45, 85, 0.95)',
        overviewRulerColor: 'rgba(255, 45, 85, 1)',
        overviewRulerLane: vscode.OverviewRulerLane.Full
    });
    classSummaryDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        after: {
            margin: '0 0 0 1.2rem',
            color: 'rgba(120, 220, 140, 0.95)',
            fontStyle: 'italic'
        }
    });
    context.subscriptions.push(diagnosticCollection, statusBarItem);
    context.subscriptions.push(highCriticalDecoration, mediumCriticalDecoration, lowCriticalDecoration, highEnergyDecoration, classSummaryDecoration);
    const config = () => vscode.workspace.getConfiguration('greencode');
    const gatewayUrl = () => (config().get('gatewayUrl') || 'http://localhost:5400').replace(/\/$/, '');
    const runAnalysisCommand = vscode.commands.registerCommand('greencode.runAnalysis', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const doc = editor.document;
        if (doc.languageId !== 'java') {
            vscode.window.showWarningMessage('GreenCode AI analysis is supported for Java files. Use Gateway for other languages.');
        }
        await runAnalysisForDocument(doc, gatewayUrl());
    });
    const applyFixCommand = vscode.commands.registerCommand('greencode.applyFix', async (issueId) => {
        if (issueId) {
            await applyFixById(issueId);
        }
        else {
            const editor = vscode.window.activeTextEditor;
            if (editor)
                await applyFixAtCursor(editor);
            else
                vscode.window.showErrorMessage('No active editor');
        }
    });
    const showEnergyBreakdownCommand = vscode.commands.registerCommand('greencode.showEnergyBreakdown', async (summary) => {
        vscode.window.showInformationMessage(summary);
    });
    const analyzeOnSave = vscode.workspace.onDidSaveTextDocument(async (doc) => {
        if (!config().get('analyzeOnSave') || doc.languageId !== 'java')
            return;
        if (config().get('enabled') !== false) {
            await runAnalysisForDocument(doc, gatewayUrl());
        }
    });
    const codeActionProvider = vscode.languages.registerCodeActionsProvider({ language: 'java' }, {
        provideCodeActions(document, range, context) {
            const actions = [];
            const filePath = path.basename(document.uri.fsPath);
            for (const diag of context.diagnostics) {
                if (diag.source !== DIAGNOSTIC_COLLECTION)
                    continue;
                const issueId = diag.issueId;
                if (!issueId)
                    continue;
                const patch = lastAnalysis.patches.find((p) => p.issueId === issueId);
                if (patch && patch.recommendation) {
                    const action = new vscode.CodeAction(`GreenCode: ${patch.recommendation.slice(0, 50)}...`, vscode.CodeActionKind.QuickFix);
                    action.diagnostics = [diag];
                    action.command = { command: 'greencode.applyFix', title: 'Apply fix', arguments: [issueId] };
                    actions.push(action);
                }
            }
            return actions;
        },
    });
    const hoverProvider = vscode.languages.registerHoverProvider({ scheme: 'file', language: 'java' }, {
        async provideHover(document, position) {
            const filePath = path.basename(document.uri.fsPath);
            const line = position.line;
            const issues = lastAnalysis.issues.filter((i) => i.filePath === filePath && (i.line === line || i.line === line + 1));
            if (issues.length === 0)
                return null;
            const md = new vscode.MarkdownString();
            md.appendMarkdown('**GreenCode AI Insight**\n\n');
            for (const issue of issues) {
                const sevIcon = getSeverityIcon(issue.severity);
                const energyDetails = issue.category === 'energy' || issue.agent === 'energy'
                    ? `\n  🔋 ${buildEnergyInterpretation(issue)}`
                    : '';
                md.appendMarkdown(`- ${sevIcon} **${issue.agent || 'agent'}** (${issue.severity || 'medium'}): ${issue.description || 'Issue'}${energyDetails}\n`);
                if (issue.explanation)
                    md.appendMarkdown(`  ♻️ ${issue.explanation}\n`);
                if (issue.recommendation)
                    md.appendMarkdown(`  ✅ ${issue.recommendation}\n`);
            }
            return new vscode.Hover(md);
        },
    });
    codeLensEmitter = new vscode.EventEmitter();
    const codeLensProvider = {
        onDidChangeCodeLenses: codeLensEmitter.event,
        async provideCodeLenses(document) {
            if (document.languageId !== 'java')
                return [];
            const filePath = path.basename(document.uri.fsPath);
            const fileIssues = lastAnalysis.issues.filter((i) => i.filePath === filePath);
            if (fileIssues.length === 0)
                return [];
            const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri);
            if (!symbols || symbols.length === 0)
                return [];
            const functionSymbols = flattenSymbols(symbols).filter((s) => s.kind === vscode.SymbolKind.Method || s.kind === vscode.SymbolKind.Function);
            const classSymbols = flattenSymbols(symbols).filter((s) => s.kind === vscode.SymbolKind.Class);
            const lenses = [];
            for (const cls of classSymbols) {
                const issuesInClass = fileIssues.filter((issue) => {
                    const line = Math.max(0, issue.line || 0);
                    return line >= cls.range.start.line && line <= cls.range.end.line;
                });
                if (issuesInClass.length === 0)
                    continue;
                const totals = issuesInClass.reduce((acc, issue) => {
                    const e = estimateEnergyImpact(issue);
                    acc.mWh += e.mWhPer1kRuns;
                    acc.co2 += e.co2eMg;
                    return acc;
                }, { mWh: 0, co2: 0 });
                const classTitle = `🌿 Class ${cls.name}: ${totals.mWh.toFixed(1)} mWh/1k · ${totals.co2.toFixed(1)} mg CO2e (${issuesInClass.length} insights)`;
                lenses.push(new vscode.CodeLens(new vscode.Range(cls.range.start, cls.range.start), {
                    title: classTitle,
                    command: 'greencode.showEnergyBreakdown',
                    arguments: [classTitle]
                }));
            }
            for (const fn of functionSymbols) {
                const issuesInFn = fileIssues.filter((issue) => {
                    const line = Math.max(0, issue.line || 0);
                    return line >= fn.range.start.line && line <= fn.range.end.line;
                });
                if (issuesInFn.length === 0)
                    continue;
                const total = issuesInFn.reduce((acc, issue) => {
                    const e = estimateEnergyImpact(issue);
                    acc.mWh += e.mWhPer1kRuns;
                    acc.co2 += e.co2eMg;
                    return acc;
                }, { mWh: 0, co2: 0 });
                const title = `🔋 GreenCode ${fn.name}: ${total.mWh.toFixed(1)} mWh/1k · ${total.co2.toFixed(1)} mg CO2e (${issuesInFn.length} insights)`;
                const details = issuesInFn
                    .slice(0, 5)
                    .map((i) => `L${Math.max(1, i.line || 1)} ${getSeverityIcon(i.severity)} ${i.description || 'Energy issue'}`)
                    .join(' | ');
                lenses.push(new vscode.CodeLens(new vscode.Range(fn.range.start, fn.range.start), {
                    title,
                    command: 'greencode.showEnergyBreakdown',
                    arguments: [`${title}\n${details}${issuesInFn.length > 5 ? ' | ...' : ''}`]
                }));
            }
            return lenses;
        }
    };
    const codeLensRegistration = vscode.languages.registerCodeLensProvider({ language: 'java' }, codeLensProvider);
    context.subscriptions.push(runAnalysisCommand, applyFixCommand, showEnergyBreakdownCommand, analyzeOnSave, codeActionProvider, hoverProvider, codeLensRegistration);
    statusBarItem.text = '$(beaker) GreenCode';
    statusBarItem.tooltip = 'GreenCode AI – Run analysis from Command Palette';
    statusBarItem.show();
}
async function runAnalysisForDocument(document, gatewayUrl) {
    statusBarItem.text = '$(sync~spin) GreenCode analyzing…';
    try {
        const code = document.getText();
        const fileName = path.basename(document.uri.fsPath);
        const res = await fetch(`${gatewayUrl}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, fileName }),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || `HTTP ${res.status}`);
        }
        const data = (await res.json());
        const issues = (data.unifiedIssues || []);
        const patches = data.patches || [];
        lastAnalysis = { issues, patches };
        codeLensEmitter.fire();
        const severityThreshold = vscode.workspace.getConfiguration('greencode').get('severityThreshold') || 'medium';
        const order = { high: 0, medium: 1, low: 2 };
        const threshold = order[severityThreshold] ?? 1;
        const filtered = issues.filter((i) => (order[i.severity] ?? 2) <= threshold);
        const byFile = new Map();
        for (const issue of filtered) {
            const fp = issue.filePath || fileName;
            if (!byFile.has(fp))
                byFile.set(fp, []);
            const range = new vscode.Range(issue.line || 0, 0, issue.line || 0, 256);
            const severity = issue.severity === 'high' ? vscode.DiagnosticSeverity.Error
                : issue.severity === 'medium' ? vscode.DiagnosticSeverity.Warning
                    : vscode.DiagnosticSeverity.Information;
            const diagPrefix = issue.category === 'energy' ? '🔋' : getSeverityIcon(issue.severity);
            const diag = new vscode.Diagnostic(range, `${diagPrefix} [${issue.agent}] ${issue.description}`, severity);
            diag.source = DIAGNOSTIC_COLLECTION;
            diag.issueId = issue.id;
            if (issue.recommendation)
                diag.code = issue.recommendation;
            byFile.get(fp).push(diag);
        }
        diagnosticCollection.clear();
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        for (const [file, diags] of byFile) {
            const uri = workspaceRoot && fs.existsSync(path.join(workspaceRoot, file))
                ? vscode.Uri.file(path.join(workspaceRoot, file))
                : document.uri;
            diagnosticCollection.set(uri, diags);
        }
        applyCriticalityDecorations(document, issues);
        applyClassSummaryDecorations(document, issues);
        statusBarItem.text = `$(check) GreenCode: ${issues.length} issues`;
        const totalEstimate = issues.reduce((acc, issue) => {
            const e = estimateEnergyImpact(issue);
            acc.mWh += e.mWhPer1kRuns;
            acc.co2 += e.co2eMg;
            return acc;
        }, { mWh: 0, co2: 0 });
        statusBarItem.tooltip = `${issues.length} issues, ${patches.length} fixes, ~${totalEstimate.mWh.toFixed(1)} mWh/1k, ~${totalEstimate.co2.toFixed(1)} mg CO2e`;
        vscode.window.showInformationMessage(`GreenCode AI: ${issues.length} issues found. Check Problems panel.`);
    }
    catch (error) {
        statusBarItem.text = '$(warning) GreenCode';
        statusBarItem.tooltip = error?.message || 'Analysis failed';
        const msg = error?.message || String(error);
        const isNetwork = /fetch failed|ECONNREFUSED|ENOTFOUND|network|connection/i.test(msg);
        if (isNetwork) {
            vscode.window.showErrorMessage(`GreenCode AI: Cannot reach the gateway at ${gatewayUrl}. Start it with: cd modules/gateway && npm start`, 'Open settings').then((choice) => {
                if (choice === 'Open settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'greencode.gatewayUrl');
                }
            });
        }
        else {
            vscode.window.showErrorMessage(`GreenCode AI analysis failed: ${msg}`);
        }
    }
}
async function applyFixById(issueId) {
    const patch = lastAnalysis.patches.find((p) => p.issueId === issueId);
    if (!patch) {
        vscode.window.showWarningMessage('Fix not found. Run analysis first.');
        return;
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('Open the file to apply the fix.');
        return;
    }
    const fileName = path.basename(editor.document.uri.fsPath);
    if (patch.filePath !== fileName) {
        vscode.window.showWarningMessage(`Fix is for ${patch.filePath}. Open that file to apply.`);
        return;
    }
    const line = Math.max(0, (patch.line || 1) - 1);
    const range = new vscode.Range(line, 0, line, 1024);
    const replacement = patch.code || patch.recommendation || '';
    await editor.edit((eb) => eb.replace(range, replacement));
    vscode.window.showInformationMessage('Fix applied.');
}
async function applyFixAtCursor(editor) {
    const line = editor.selection.active.line;
    const filePath = path.basename(editor.document.uri.fsPath);
    const patch = lastAnalysis.patches.find((p) => p.filePath === filePath && (p.line === line || p.line === line + 1));
    if (patch)
        await applyFixById(patch.issueId);
    else
        vscode.window.showInformationMessage('No fix available at cursor. Run analysis first.');
}
function deactivate() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.setDecorations(highCriticalDecoration, []);
        editor.setDecorations(mediumCriticalDecoration, []);
        editor.setDecorations(lowCriticalDecoration, []);
        editor.setDecorations(highEnergyDecoration, []);
        editor.setDecorations(classSummaryDecoration, []);
    }
    diagnosticCollection?.dispose();
    statusBarItem?.dispose();
    codeLensEmitter?.dispose();
}
function getSeverityIcon(severity) {
    if (severity === 'high')
        return '🔴';
    if (severity === 'medium')
        return '🟠';
    return '🟢';
}
function buildEnergyInterpretation(issue) {
    const estimate = estimateEnergyImpact(issue);
    if (issue.severity === 'high') {
        return `Very high energy impact zone. Estimated ${estimate.mWhPer1kRuns} mWh per 1k runs (~${estimate.co2eMg} mg CO2e). Battery drain risk is high on repeated execution.`;
    }
    if (issue.severity === 'medium') {
        return `Moderate energy impact. Estimated ${estimate.mWhPer1kRuns} mWh per 1k runs (~${estimate.co2eMg} mg CO2e). Optimization can reduce battery consumption.`;
    }
    return `Low energy impact. Estimated ${estimate.mWhPer1kRuns} mWh per 1k runs (~${estimate.co2eMg} mg CO2e). This section is relatively efficient.`;
}
function applyCriticalityDecorations(document, issues) {
    const editor = vscode.window.visibleTextEditors.find((e) => e.document.uri.toString() === document.uri.toString());
    if (!editor)
        return;
    const highRanges = [];
    const mediumRanges = [];
    const lowRanges = [];
    const highEnergyRanges = [];
    for (const issue of issues) {
        const issueLine = Math.max(0, issue.line || 0);
        if (issueLine >= document.lineCount)
            continue;
        const line = document.lineAt(issueLine);
        const range = new vscode.Range(issueLine, 0, issueLine, Math.max(1, line.text.length));
        const hover = new vscode.MarkdownString(`**${getSeverityIcon(issue.severity)} ${issue.agent || 'agent'}**\n\n` +
            `${issue.description || 'Issue'}\n\n` +
            `🔋 ${buildEnergyInterpretation(issue)}\n\n` +
            `${issue.recommendation ? `✅ ${issue.recommendation}` : ''}`);
        // Keep line labels compact; main calculations are at method/class level via CodeLens.
        const energyInline = issue.severity === 'high' ? buildInlineEnergyLabel(issue) : '';
        const opt = {
            range,
            hoverMessage: hover,
            renderOptions: energyInline
                ? {
                    after: {
                        contentText: `  ${energyInline}`,
                        color: 'rgba(255, 99, 132, 0.95)',
                        margin: '0 0 0 1rem',
                        fontWeight: 'bold'
                    }
                }
                : undefined
        };
        if (issue.severity === 'high')
            highRanges.push(opt);
        else if (issue.severity === 'medium')
            mediumRanges.push(opt);
        else
            lowRanges.push(opt);
        if ((issue.category === 'energy' || issue.agent === 'energy' || issue.severity === 'high') && issue.severity === 'high') {
            highEnergyRanges.push(opt);
        }
    }
    editor.setDecorations(highCriticalDecoration, highRanges);
    editor.setDecorations(mediumCriticalDecoration, mediumRanges);
    editor.setDecorations(lowCriticalDecoration, lowRanges);
    editor.setDecorations(highEnergyDecoration, highEnergyRanges);
}
function applyClassSummaryDecorations(document, issues) {
    const editor = vscode.window.visibleTextEditors.find((e) => e.document.uri.toString() === document.uri.toString());
    if (!editor)
        return;
    const classRegex = /^\s*(public|private|protected)?\s*(abstract|final)?\s*class\s+([A-Za-z_]\w*)/;
    const classLines = [];
    for (let i = 0; i < document.lineCount; i++) {
        const text = document.lineAt(i).text;
        const m = text.match(classRegex);
        if (m?.[3])
            classLines.push({ line: i, name: m[3] });
    }
    if (classLines.length === 0) {
        editor.setDecorations(classSummaryDecoration, []);
        return;
    }
    const classDecorations = [];
    for (let idx = 0; idx < classLines.length; idx++) {
        const start = classLines[idx].line;
        const end = idx + 1 < classLines.length ? classLines[idx + 1].line - 1 : document.lineCount - 1;
        const issuesInClass = issues.filter((issue) => {
            const line = Math.max(0, issue.line || 0);
            return line >= start && line <= end;
        });
        if (issuesInClass.length === 0)
            continue;
        const totals = issuesInClass.reduce((acc, issue) => {
            const e = estimateEnergyImpact(issue);
            acc.mWh += e.mWhPer1kRuns;
            acc.co2 += e.co2eMg;
            return acc;
        }, { mWh: 0, co2: 0 });
        const range = new vscode.Range(start, 0, start, Math.max(1, document.lineAt(start).text.length));
        classDecorations.push({
            range,
            renderOptions: {
                after: {
                    contentText: `  🌿 Class estimate: ${totals.mWh.toFixed(1)} mWh/1k · ${totals.co2.toFixed(1)} mg CO2e`,
                    color: 'rgba(120, 220, 140, 0.95)',
                    margin: '0 0 0 1.2rem',
                    fontStyle: 'italic'
                }
            }
        });
    }
    editor.setDecorations(classSummaryDecoration, classDecorations);
}
function flattenSymbols(symbols) {
    const all = [];
    const walk = (s) => {
        all.push(s);
        for (const c of s.children)
            walk(c);
    };
    for (const s of symbols)
        walk(s);
    return all;
}
function estimateEnergyImpact(issue) {
    const confidence = Math.max(0.2, Math.min(1, issue.confidence ?? 0.7));
    const frequency = Math.max(1, issue.context?.frequency ?? 1);
    const severityBase = issue.severity === 'high' ? 16 : issue.severity === 'medium' ? 8 : 3;
    const mWhPer1kRuns = Math.round(severityBase * confidence * Math.log2(frequency + 1) * 10) / 10;
    // Lightweight approximation for visibility in-editor: 1 mWh ~ 0.4 mg CO2e (workload dependent).
    const co2eMg = Math.round(mWhPer1kRuns * 0.4 * 10) / 10;
    return { mWhPer1kRuns, co2eMg };
}
function buildInlineEnergyLabel(issue) {
    const e = estimateEnergyImpact(issue);
    const battery = issue.severity === 'high' ? '🔋⚠️' : issue.severity === 'medium' ? '🔋' : '🟢🔋';
    const leaf = issue.severity === 'high' ? '🌿' : '🍃';
    return `${battery} ${leaf} ${e.mWhPer1kRuns} mWh/1k · ${e.co2eMg} mg CO2e`;
}
//# sourceMappingURL=extension.js.map