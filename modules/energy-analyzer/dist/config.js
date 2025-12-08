"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    tdpWatts: 15, // default CPU TDP per core for energy estimates
    costPerKwhUSD: 0.15,
    weights: { cpu: 0.5, mem: 0.25, io: 0.25 },
    bench: { runs: 10, warmup: 3, concurrency: 1 },
    topKToBench: 3
};
