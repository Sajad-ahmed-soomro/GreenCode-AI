import { performance } from "perf_hooks";

/**
 * Minimal bench runner for a JS/TS module that exports `work()` (sync or async).
 * targetModule is a path that can be imported via require() (relative to process.cwd()).
 */
export async function runBench(targetModulePath: string, runs = 10, warmup = 3) {
  // dynamic require (compiled JS) - in dev with ts-node this will load .ts
  // Accept target exports: module.exports = { work } or exports.work = ...
  // If targetModulePath is relative, require from process.cwd()
  const target = require(targetModulePath);
  const work = target.work || target.default || target;

  if (!work || typeof work !== "function") {
    throw new Error("Target module must export a function or an object with work()");
  }

  // warmup
  for (let i = 0; i < warmup; i++) {
    const r = work();
    if (r && typeof r.then === "function") await r;
  }

  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    const r = work();
    if (r && typeof r.then === "function") await r;
    const end = performance.now();
    times.push(end - start);
    // keep console feedback small
    if ((i + 1) % 5 === 0 || i === runs - 1) {
      // no-op
    }
  }

  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  const mean = times.reduce((s, v) => s + v, 0) / times.length;
  const p95 = times[Math.floor(times.length * 0.95)];

  return { medianMs: median, meanMs: mean, p95Ms: p95, raw: times };
}
