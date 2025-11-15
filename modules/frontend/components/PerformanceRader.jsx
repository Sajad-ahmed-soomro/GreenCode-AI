import { Activity } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const PerformanceRadar = ({ selectedMethod }) => {
  if (!selectedMethod) return null;

  const radarData = [
    { metric: 'CPU', value: selectedMethod.cpuScore * 100 },
    { metric: 'Memory', value: selectedMethod.memScore * 100 },
    { metric: 'I/O', value: selectedMethod.ioScore * 100 },
    { metric: 'Energy', value: selectedMethod.energyScore * 100 },
    { metric: 'Complexity', value: Math.min((selectedMethod.nestingDepth / 5) * 100, 100) }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-600" />
        Performance Profile: {selectedMethod.methodName}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
          <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>

      {selectedMethod.metrics && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Complexity Score:</span>
            <span className="text-sm font-semibold">{selectedMethod.metrics.complexityScore}</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">Optimization Potential:</span>
            <span className={`text-sm font-semibold ${
              selectedMethod.metrics.optimizationPotential === 'high' ? 'text-red-600' :
              selectedMethod.metrics.optimizationPotential === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {selectedMethod.metrics.optimizationPotential.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceRadar;