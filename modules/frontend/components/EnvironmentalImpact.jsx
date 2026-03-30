import { Leaf, Zap, TrendingDown } from 'lucide-react';

const EnvironmentalImpact = ({ stats }) => (
  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <Leaf className="w-5 h-5" />
      Environmental Impact
    </h3>
    <div className="space-y-3">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-medium">Potential Savings</span>
        </div>
        <p className="text-2xl font-bold">{stats.energySavings} kWh</p>
      </div>
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">Carbon Reduction</span>
        </div>
        <p className="text-2xl font-bold">{stats.carbonReduction} kg CO₂</p>
      </div>
    </div>
  </div>
);

export default EnvironmentalImpact;