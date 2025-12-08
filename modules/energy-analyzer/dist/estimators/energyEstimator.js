"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateJoulesPerOp = estimateJoulesPerOp;
exports.joulesToKwh = joulesToKwh;
exports.kwhToUSD = kwhToUSD;
const config_1 = require("../config");
/**
 * Estimate joules per op from energyScore and medianMs.
 * energyScore is used as an estimated CPU utilization fraction (heuristic).
 */
function estimateJoulesPerOp(energyScore, medianMs, config = config_1.DEFAULT_CONFIG) {
    const cpuUtilFraction = Math.max(0, Math.min(1, energyScore));
    const powerW = cpuUtilFraction * config.tdpWatts;
    const timeSeconds = Math.max(0, medianMs) / 1000.0;
    const joules = powerW * timeSeconds;
    return joules;
}
function joulesToKwh(joules) {
    return joules / 3600000;
}
function kwhToUSD(kwh, config = config_1.DEFAULT_CONFIG) {
    return kwh * config.costPerKwhUSD;
}
