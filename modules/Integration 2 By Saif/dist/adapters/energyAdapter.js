"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptEnergy = adaptEnergy;
function adaptEnergy(energyData) {
    if (!energyData)
        return [];
    return energyData.results?.map((entry) => ({
        type: 'energy',
        functionName: entry.function || 'unknown',
        cpuUsage: entry.cpu || 0,
        memoryUsage: entry.memory || 0,
        energyScore: entry.energy || 0
    })) || [];
}
