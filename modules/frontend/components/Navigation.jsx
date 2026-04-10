import { Zap, RefreshCw, Scale } from 'lucide-react';
import Link from 'next/link';

const Navigation = ({ statistics, onRefresh, onShowComparison }) => (
  <nav className="bg-white border-b border-gray-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Energy Analyzer
            </h1>
            <p className="text-sm text-gray-600">Code Performance & Energy Metrics</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-sm font-semibold"
            title="Open scanner"
          >
            Scanner
          </Link>
          <button
            onClick={onShowComparison}
            className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-semibold flex items-center gap-1"
            title="Compare before and after module impact"
          >
            <Scale className="w-4 h-4" />
            Comparison
          </button>
          {statistics && (
            <div className="text-right ml-auto sm:ml-0">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">{statistics.totalClasses}</div>
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