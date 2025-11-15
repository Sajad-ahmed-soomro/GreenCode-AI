import { Code, Activity, AlertCircle } from 'lucide-react';

const MethodCard = ({ method, isSelected, onSelect }) => {
  const getEnergyLevel = (score) => {
    if (score > 0.5) return { label: "High", color: "bg-red-100 text-red-800 border-red-200", icon: <AlertCircle className="w-4 h-4" /> };
    if (score > 0.3) return { label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <AlertCircle className="w-4 h-4" /> };
    return { label: "Low", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <AlertCircle className="w-4 h-4" /> };
  };

  const energyLevel = getEnergyLevel(method.energyScore);
  const metrics = method.metrics || {};

  return (
    <div 
      className={`bg-white rounded-xl shadow-md border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'border-emerald-500' : 'border-gray-200'
      }`}
      onClick={() => onSelect(method)}
    >
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Code className="w-5 h-5" />
            {method.methodName}
          </h3>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${energyLevel.color} bg-white`}>
              {energyLevel.icon}
              <span className="ml-1">{energyLevel.label}</span>
            </span>
            {metrics.riskLevel === 'critical' && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white">
                Critical
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs text-purple-600 mb-1">Energy</p>
            <p className="text-xl font-bold text-purple-700">{method.energyScore.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 mb-1">CPU</p>
            <p className="text-xl font-bold text-blue-700">{method.cpuScore.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-xs text-orange-600 mb-1">Memory</p>
            <p className="text-xl font-bold text-orange-700">{method.memScore.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-xs text-teal-600 mb-1">Efficiency</p>
            <p className="text-xl font-bold text-teal-700">{metrics.efficiencyScore?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Loop Count
            </span>
            <span className="font-semibold text-gray-800">{method.loopCount}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Nesting Depth
            </span>
            <span className="font-semibold text-gray-800">{method.nestingDepth}</span>
          </div>
          {metrics.hasPerformanceIssues && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              ⚠️ Performance issues detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MethodCard;