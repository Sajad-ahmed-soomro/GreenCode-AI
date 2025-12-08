"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeScores = computeScores;
const config_1 = require("../config");
/** clamp helper */
function clamp01(v) {
    if (Number.isNaN(v))
        return 0;
    return Math.max(0, Math.min(1, v));
}
/**
 * Convert AST+CFG raw metrics -> normalized scores [0..1]
 */
function computeScores(params, config = config_1.DEFAULT_CONFIG) {
    const { loopCount, cyclomatic, nestingDepth, objectCreations, methodCalls, ioCalls } = params;
    const cpuScoreRaw = (loopCount * 0.25) + ((cyclomatic - 1) * 0.05) + ((nestingDepth - 1) * 0.15);
    const memScoreRaw = (objectCreations * 0.08) + (loopCount * 0.03);
    const ioScoreRaw = (ioCalls * 0.25) + (methodCalls * 0.02);
    const cpuScore = clamp01(cpuScoreRaw);
    const memScore = clamp01(memScoreRaw);
    const ioScore = clamp01(ioScoreRaw);
    const energyScore = clamp01(config.weights.cpu * cpuScore +
        config.weights.mem * memScore +
        config.weights.io * ioScore);
    return { cpuScore, memScore, ioScore, energyScore };
}
