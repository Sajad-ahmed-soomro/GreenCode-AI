"use strict";
// src/metrics/metricsHelper.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFunctionLength = checkFunctionLength;
exports.checkNestingDepth = checkNestingDepth;
exports.checkComplexity = checkComplexity;
exports.checkParameters = checkParameters;
exports.checkCommentRatio = checkCommentRatio;
exports.checkNamingClarity = checkNamingClarity;
exports.evaluateAllMetrics = evaluateAllMetrics;
/* ---------- Function Length ---------- */
function checkFunctionLength(method, realLoc) {
    const loc = realLoc || estimateLOC(method);
    let status = "Low";
    let penalty = 0;
    if (loc > 50) {
        status = "High";
        penalty = 0.15;
    }
    else if (loc > 30) {
        status = "Medium";
        penalty = 0.08;
    }
    return {
        metric: "Function Length",
        value: loc,
        status,
        penalty,
        message: `${method.name} has ${loc} lines of code (${status}).`
    };
}
/* ---------- Nesting Depth ---------- */
function checkNestingDepth(method) {
    const depth = calculateDepth(method.conditionalsTree || []);
    let status = "Low";
    let penalty = 0;
    if (depth > 3) {
        status = "High";
        penalty = 0.15;
    }
    else if (depth > 1) {
        status = "Medium";
        penalty = 0.08;
    }
    return {
        metric: "Nesting Depth",
        value: depth,
        status,
        penalty,
        message: `${method.name} has nesting depth ${depth} (${status}).`
    };
}
function calculateDepth(nodes) {
    if (!nodes || nodes.length === 0)
        return 0;
    let maxDepth = 0;
    for (const node of nodes) {
        const thenDepth = calculateDepth(node.thenBlock || []);
        const elseDepth = calculateDepth(node.elseBlock || []);
        const typePenalty = node.type === "SwitchStatement" || node.type === "CaseStatement" ? 1 : 0;
        maxDepth = Math.max(maxDepth, 1 + typePenalty + Math.max(thenDepth, elseDepth));
    }
    return maxDepth;
}
/* ---------- Cyclomatic Complexity ---------- */
function checkComplexity(method) {
    const decisionPoints = (method.conditionals?.length || 0) + (method.loops?.length || 0);
    let status = "Low";
    let penalty = 0;
    if (decisionPoints > 10) {
        status = "High";
        penalty = 0.15;
    }
    else if (decisionPoints > 5) {
        status = "Medium";
        penalty = 0.08;
    }
    return {
        metric: "Cyclomatic Complexity",
        value: decisionPoints,
        status,
        penalty,
        message: `${method.name} has ${decisionPoints} decision points (${status}).`
    };
}
/* ---------- Parameter Count ---------- */
function checkParameters(method) {
    const paramCount = method.params?.length || 0;
    let status = "Low";
    let penalty = 0;
    if (paramCount > 5) {
        status = "High";
        penalty = 0.1;
    }
    else if (paramCount > 3) {
        status = "Medium";
        penalty = 0.05;
    }
    return {
        metric: "Parameter Count",
        value: paramCount,
        status,
        penalty,
        message: `${method.name} has ${paramCount} parameters (${status}).`
    };
}
/* ---------- Comment Ratio ---------- */
function checkCommentRatio(method, realLoc, realComments) {
    const total = realLoc || estimateLOC(method);
    const comments = realComments || method.commentsCount || 0;
    const ratio = total > 0 ? (comments / total) * 100 : 0;
    let status = "Low";
    let penalty = 0;
    if (ratio < 20) {
        status = "High";
        penalty = 0.1;
    }
    else if (ratio < 35) {
        status = "Medium";
        penalty = 0.05;
    }
    return {
        metric: "Comment Ratio",
        value: `${ratio.toFixed(1)}%`,
        status,
        penalty,
        message: `${method.name} comment ratio = ${ratio.toFixed(1)}% (${status}).`
    };
}
/* ---------- Naming Clarity ---------- */
function checkNamingClarity(method) {
    const identifiers = (method.params || []).map((p) => p.name);
    const reserved = ["i", "j", "k", "x", "y", "z", "a", "b", "c"];
    const unclear = identifiers.filter((n) => n.length <= 2 && reserved.includes(n));
    let status = "Low";
    let penalty = 0;
    if (unclear.length > 2) {
        status = "High";
        penalty = 0.1;
    }
    else if (unclear.length > 0) {
        status = "Medium";
        penalty = 0.05;
    }
    return {
        metric: "Naming Clarity",
        value: unclear.join(", ") || "Good",
        status,
        penalty,
        message: unclear.length > 0
            ? `${method.name} has unclear identifiers: ${unclear.join(", ")}.`
            : `${method.name} naming is clear.`
    };
}
/* ---------- Utility Estimators ---------- */
function estimateLOC(method) {
    // If analyzer adds real LOC later, update here.
    const proxy = (method.loops?.length || 0) * 10 +
        (method.conditionals?.length || 0) * 5 +
        (method.params?.length || 0) * 2 +
        5;
    return proxy;
}
/* ---------- Aggregator ---------- */
function evaluateAllMetrics(method, realStats) {
    const loc = realStats?.loc || 0;
    const comments = realStats?.comments || 0;
    return [
        checkFunctionLength(method, loc),
        checkNestingDepth(method),
        checkComplexity(method),
        checkParameters(method),
        checkCommentRatio(method, loc, comments),
        checkNamingClarity(method)
    ];
}
