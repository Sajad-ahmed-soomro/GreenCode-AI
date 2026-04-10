"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptEnergy = adaptEnergy;
function adaptEnergy(energyData) {
    if (!energyData)
        return [];
    const reports = Array.isArray(energyData.reports)
        ? energyData.reports
        : Array.isArray(energyData.results)
            ? energyData.results
            : [];
    return reports.map((entry, idx) => {
        const score = Number(entry.energyScore ?? entry.combinedEnergyScore ?? entry.staticEnergyScore ?? entry.energy ?? 0);
        const severity = score >= 0.56 ? 'high' : score >= 0.48 ? 'medium' : 'low';
        const methodName = entry.methodName || entry.function || 'unknown';
        const className = entry.className || 'Unknown';
        return {
            id: `energy_${className}_${methodName}_${idx}`,
            source: 'energy',
            filePath: `${className}.java`,
            methodName,
            line: entry.line ?? 0,
            severity,
            issueType: 'ENERGY_HOTSPOT',
            description: `Elevated energy usage in ${className}.${methodName}()`,
            explanation: `Energy score ${score.toFixed(3)} (loops=${entry.loopCount ?? 0}, nesting=${entry.nestingDepth ?? 0})`,
            recommendation: 'Optimize loops/conditions and reduce repeated heavy operations.',
            fixedCode: '',
            confidence: entry.confidenceLevel === 'high' ? 0.9 : entry.confidenceLevel === 'medium' ? 0.8 : 0.7,
            energyScore: score,
            tags: ['energy', 'runtime']
        };
    });
}
