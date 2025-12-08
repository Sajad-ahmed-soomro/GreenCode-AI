"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportsFromASTandCFGs = generateReportsFromASTandCFGs;
exports.collectCFGPathsFromDir = collectCFGPathsFromDir;
// src/core/orchestrator.ts - FIXED VERSION
const astAnalyzer_1 = require("../analyzers/astAnalyzer");
const cfgAnalyzer_1 = require("../analyzers/cfgAnalyzer");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function clamp01(v) {
    if (Number.isNaN(v))
        return 0;
    return Math.max(0, Math.min(1, v));
}
function computeScoresFromMetrics(metrics) {
    const { loopCount, cyclomatic, nestingDepth, objectCreations, methodCalls, ioCalls, dbCalls, methodCallsInsideLoop, recursion, conditionalsCount } = metrics;
    let cpuRaw = (loopCount * 0.3) +
        ((cyclomatic - 1) * 0.1) +
        ((nestingDepth - 1) * 0.2) +
        (conditionalsCount * 0.05);
    if (methodCallsInsideLoop > 0)
        cpuRaw += methodCallsInsideLoop * 0.1;
    if (recursion)
        cpuRaw += 0.3;
    let memRaw = (objectCreations * 0.15) +
        (loopCount * 0.05) +
        (methodCalls * 0.02);
    if (objectCreations > 5)
        memRaw += 0.2;
    let ioRaw = (ioCalls * 0.4) +
        (dbCalls * 0.6) +
        (methodCalls * 0.03);
    if (dbCalls > 0 && loopCount > 0)
        ioRaw += 0.5;
    const cpuScore = clamp01(cpuRaw);
    const memScore = clamp01(memRaw);
    const ioScore = clamp01(ioRaw);
    const energyScore = clamp01(0.5 * cpuScore + 0.3 * memScore + 0.2 * ioScore);
    return { cpuScore, memScore, ioScore, energyScore };
}
function extractMethodNameFromCFG(cfgPath, cfg) {
    if (cfg.methodName) {
        return cfg.methodName;
    }
    const filename = path_1.default.basename(cfgPath, '.json');
    const parts = filename.split('_');
    if (parts.length >= 3) {
        return parts[parts.length - 2];
    }
    return filename.replace('_cfg', '');
}
function extractClassNameFromCFG(cfgPath) {
    const filename = path_1.default.basename(cfgPath, '.json');
    const parts = filename.split('_');
    if (parts.length >= 2) {
        return parts[0];
    }
    return 'UnknownClass';
}
function normalizeMethodName(name) {
    return name.toLowerCase().trim();
}
/**
 * 🔥 FIXED VERSION - Properly deduplicates methods
 * Generate method reports by combining a single AST file with many CFG files
 */
function generateReportsFromASTandCFGs(astPath, cfgPaths) {
    const astFile = (0, astAnalyzer_1.loadASTFile)(astPath);
    const reports = [];
    // Build method map from AST for easy lookup
    const astMethodMap = new Map();
    for (const cls of astFile.classes || []) {
        const className = cls.name || "UnknownClass";
        for (const m of cls.methods || []) {
            const methodName = m.name;
            const key = `${className}.${methodName}`;
            astMethodMap.set(normalizeMethodName(key), { ...m, className });
        }
    }
    console.log(`📊 AST Methods found: ${astMethodMap.size}`);
    console.log(`📊 CFG Files to process: ${cfgPaths.length}`);
    // 🔥 FIX 1: Build CFG map to avoid processing same method multiple times
    const cfgMap = new Map();
    for (const cfgPath of cfgPaths) {
        try {
            const cfg = (0, cfgAnalyzer_1.loadCFGFile)(cfgPath);
            const methodName = extractMethodNameFromCFG(cfgPath, cfg);
            const className = extractClassNameFromCFG(cfgPath);
            const methodKey = `${className}.${methodName}`;
            const normalizedKey = normalizeMethodName(methodKey);
            // Keep the first CFG for each method (or implement priority logic)
            if (!cfgMap.has(normalizedKey)) {
                cfgMap.set(normalizedKey, { cfg, cfgPath });
                console.log(`✓ Loaded CFG for: ${methodKey}`);
            }
            else {
                console.log(`⚠️  Duplicate CFG skipped: ${methodKey} (from ${path_1.default.basename(cfgPath)})`);
            }
        }
        catch (err) {
            console.warn(`❌ Failed to load CFG at ${cfgPath}:`, err);
        }
    }
    console.log(`📊 Unique CFG methods: ${cfgMap.size}`);
    // 🔥 FIX 2: Process each unique method exactly once
    const processedMethods = new Set();
    // Process methods that have both AST and CFG
    for (const [normalizedKey, { cfg, cfgPath }] of cfgMap.entries()) {
        const astMethod = astMethodMap.get(normalizedKey);
        if (astMethod) {
            // Method has both AST and CFG data
            const astMetrics = (0, astAnalyzer_1.analyzeJavaASTMethod)(astMethod);
            const cyclomatic = (0, cfgAnalyzer_1.computeCyclomatic)(cfg);
            const nestingDepth = astMetrics.nestingDepth || (0, cfgAnalyzer_1.estimateNestingDepth)(cfg);
            const cyclePresent = (0, cfgAnalyzer_1.hasCycle)(cfg);
            const recursion = astMetrics.recursion || cyclePresent;
            const scores = computeScoresFromMetrics({
                loopCount: astMetrics.loopCount,
                cyclomatic,
                nestingDepth,
                objectCreations: astMetrics.objectCreations,
                methodCalls: astMetrics.methodCalls,
                ioCalls: astMetrics.ioCalls,
                dbCalls: astMetrics.dbCalls,
                methodCallsInsideLoop: astMetrics.methodCallsInsideLoop,
                recursion,
                conditionalsCount: astMetrics.conditionalsCount
            });
            const report = {
                className: astMethod.className,
                methodName: astMethod.name,
                loopCount: astMetrics.loopCount,
                loops: astMetrics.loops,
                conditionalsCount: astMetrics.conditionalsCount,
                methodCalls: astMetrics.methodCalls,
                objectCreations: astMetrics.objectCreations,
                ioCalls: astMetrics.ioCalls,
                dbCalls: astMetrics.dbCalls,
                methodCallsInsideLoop: astMetrics.methodCallsInsideLoop,
                recursion,
                cyclomatic,
                nestingDepth,
                cpuScore: scores.cpuScore,
                memScore: scores.memScore,
                ioScore: scores.ioScore,
                energyScore: scores.energyScore
            };
            reports.push(report);
            processedMethods.add(normalizedKey);
            console.log(`✅ Merged (AST+CFG): ${astMethod.className}.${astMethod.name} - Energy: ${scores.energyScore.toFixed(3)}`);
        }
        else {
            // Method has CFG but no AST data
            const methodName = extractMethodNameFromCFG(cfgPath, cfg);
            const className = extractClassNameFromCFG(cfgPath);
            const cyclomatic = (0, cfgAnalyzer_1.computeCyclomatic)(cfg);
            const nestingDepth = (0, cfgAnalyzer_1.estimateNestingDepth)(cfg);
            const scores = computeScoresFromMetrics({
                loopCount: 0,
                cyclomatic,
                nestingDepth,
                objectCreations: 0,
                methodCalls: 0,
                ioCalls: 0,
                dbCalls: 0,
                methodCallsInsideLoop: 0,
                recursion: false,
                conditionalsCount: 0
            });
            const report = {
                className,
                methodName,
                loopCount: 0,
                loops: [],
                conditionalsCount: 0,
                methodCalls: 0,
                objectCreations: 0,
                ioCalls: 0,
                dbCalls: 0,
                methodCallsInsideLoop: 0,
                recursion: false,
                cyclomatic,
                nestingDepth,
                cpuScore: scores.cpuScore,
                memScore: scores.memScore,
                ioScore: scores.ioScore,
                energyScore: scores.energyScore
            };
            reports.push(report);
            processedMethods.add(normalizedKey);
            console.log(`⚠️  CFG-only: ${className}.${methodName} - Energy: ${scores.energyScore.toFixed(3)}`);
        }
    }
    // 🔥 FIX 3: Process AST methods that don't have CFG (optional)
    // Only include these if you want to report on methods without CFG data
    const includeASTOnlyMethods = false; // Set to true if you want these
    if (includeASTOnlyMethods) {
        for (const [normalizedKey, astMethod] of astMethodMap.entries()) {
            if (!processedMethods.has(normalizedKey)) {
                const astMetrics = (0, astAnalyzer_1.analyzeJavaASTMethod)(astMethod);
                const scores = computeScoresFromMetrics({
                    loopCount: astMetrics.loopCount,
                    cyclomatic: 1, // Default cyclomatic without CFG
                    nestingDepth: astMetrics.nestingDepth || 1,
                    objectCreations: astMetrics.objectCreations,
                    methodCalls: astMetrics.methodCalls,
                    ioCalls: astMetrics.ioCalls,
                    dbCalls: astMetrics.dbCalls,
                    methodCallsInsideLoop: astMetrics.methodCallsInsideLoop,
                    recursion: astMetrics.recursion,
                    conditionalsCount: astMetrics.conditionalsCount
                });
                const report = {
                    className: astMethod.className,
                    methodName: astMethod.name,
                    loopCount: astMetrics.loopCount,
                    loops: astMetrics.loops,
                    conditionalsCount: astMetrics.conditionalsCount,
                    methodCalls: astMetrics.methodCalls,
                    objectCreations: astMetrics.objectCreations,
                    ioCalls: astMetrics.ioCalls,
                    dbCalls: astMetrics.dbCalls,
                    methodCallsInsideLoop: astMetrics.methodCallsInsideLoop,
                    recursion: astMetrics.recursion,
                    cyclomatic: 1,
                    nestingDepth: astMetrics.nestingDepth || 1,
                    cpuScore: scores.cpuScore,
                    memScore: scores.memScore,
                    ioScore: scores.ioScore,
                    energyScore: scores.energyScore
                };
                reports.push(report);
                console.log(`ℹ️  AST-only: ${astMethod.className}.${astMethod.name} - Energy: ${scores.energyScore.toFixed(3)}`);
            }
        }
    }
    console.log(`\n📊 Summary:`);
    console.log(`   Total unique methods: ${reports.length}`);
    console.log(`   Duplicates avoided: ${cfgPaths.length - cfgMap.size}`);
    const nonZeroEnergy = reports.filter(r => r.energyScore > 0).length;
    console.log(`   Methods with energy > 0: ${nonZeroEnergy}/${reports.length}`);
    return reports;
}
function collectCFGPathsFromDir(dir) {
    const result = [];
    if (!fs_1.default.existsSync(dir))
        return result;
    const stat = fs_1.default.statSync(dir);
    if (stat.isFile() && dir.endsWith(".json"))
        return [dir];
    if (stat.isDirectory()) {
        const files = fs_1.default.readdirSync(dir);
        for (const f of files) {
            if (f.endsWith(".json")) {
                result.push(path_1.default.join(dir, f));
            }
        }
    }
    return result;
}
