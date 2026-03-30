import { DEFAULT_CONFIG } from "../config";

/** clamp helper */
function clamp01(v: number) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/**
 * Convert AST+CFG raw metrics -> normalized scores [0..1]
 */
/**
 * Normalize benchmark time to energy score (0-1)
 * Uses logarithmic scaling for better distribution
 */
export function computeBenchmarkEnergyScore(
  medianMs: number,
  maxExpectedMs: number = 100
): number {
  // Handle invalid inputs
  if (typeof medianMs !== 'number' || isNaN(medianMs) || medianMs <= 0) {
    return 0;
  }
  
  // Logarithmic scaling: 1ms ≈ 0.1, 10ms ≈ 0.3, 100ms = 1.0
  const score = Math.log10(Math.min(medianMs, maxExpectedMs) + 1) / Math.log10(maxExpectedMs + 1);
  return Math.max(0, Math.min(1, score));
}