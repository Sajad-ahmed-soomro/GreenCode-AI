import { Activity } from 'lucide-react';

const StatsCard = ({ stats }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Activity className="w-5 h-5 text-emerald-600" />
      Performance Stats
    </h2>
    
    <div className="space-y-3">
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-gray-600 text-sm">Active Methods:</span>
        <span className="font-semibold text-gray-800">{stats.totalActive}</span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-gray-600 text-sm">Avg Energy:</span>
        <span className="font-semibold text-gray-800">{stats.avgEnergy.toFixed(3)}</span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-gray-600 text-sm">Max Energy:</span>
        <span className="font-semibold text-red-600">{stats.maxEnergy.toFixed(3)}</span>
      </div>
      <div className="flex justify-between items-center py-2">
        <span className="text-gray-600 text-sm">High CPU:</span>
        <span className="font-semibold text-blue-600">{stats.highCpu}</span>
      </div>
    </div>
  </div>
);

export default StatsCard;