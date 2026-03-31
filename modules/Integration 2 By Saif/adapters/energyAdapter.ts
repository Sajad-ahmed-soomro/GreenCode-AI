export function adaptEnergy(energyData: any): any[] {
    if (!energyData) return [];

    return energyData.results?.map((entry: any) => ({
        type: 'energy',
        functionName: entry.function || 'unknown',
        cpuUsage: entry.cpu || 0,
        memoryUsage: entry.memory || 0,
        energyScore: entry.energy || 0
    })) || [];
}