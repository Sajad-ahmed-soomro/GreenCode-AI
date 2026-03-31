import { Zap, RefreshCw } from 'lucide-react';

const Navigation = ({ statistics, onRefresh }) => (
  <nav className="bg-white border-b border-gray-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Energy Analyzer
            </h1>
            <p className="text-sm text-gray-600">Code Performance & Energy Metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {statistics && (
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{statistics.totalClasses}</div>
              <div className="text-sm text-gray-600">Classes</div>
            </div>
          )}
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </nav>
);

export default Navigation;