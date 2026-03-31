import { DEFAULT_CONFIG } from "../config";

/**
 * Estimate joules per op from energyScore and medianMs.
 * energyScore is used as an estimated CPU utilization fraction (heuristic).
 */
export function estimateJoulesPerOp(energyScore: number, medianMs: number, config = DEFAULT_CONFIG) {
  const cpuUtilFraction = Math.max(0, Math.min(1, energyScore));
  const powerW = cpuUtilFraction * config.tdpWatts;
  const timeSeconds = Math.max(0, medianMs) / 1000.0;
  const joules = powerW * timeSeconds;
  return joules;
}

export function joulesToKwh(joules: number) {
  return joules / 3_600_000.0;
}

export function kwhToUSD(kwh: number, config = DEFAULT_CONFIG) {
  return kwh * config.costPerKwhUSD;
}
