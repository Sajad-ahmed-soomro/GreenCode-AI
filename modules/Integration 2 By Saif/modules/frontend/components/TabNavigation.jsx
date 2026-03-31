import { Activity, Code } from 'lucide-react';

const TabNavigation = ({ activeTab, onTabChange, methodsCount }) => (
  <div className="border-b border-gray-200 bg-gray-50">
    <nav className="flex">
      <button
        onClick={() => onTabChange("overview")}
        className={`px-6 py-4 font-medium text-sm transition-colors relative ${
          activeTab === "overview"
            ? "text-emerald-600 bg-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Activity className="w-4 h-4 inline mr-2" />
        Overview
        {activeTab === "overview" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
        )}
      </button>
      <button
        onClick={() => onTabChange("methods")}
        className={`px-6 py-4 font-medium text-sm transition-colors relative ${
          activeTab === "methods"
            ? "text-emerald-600 bg-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Code className="w-4 h-4 inline mr-2" />
        Methods ({methodsCount})
        {activeTab === "methods" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
        )}
      </button>
      <button
        onClick={() => onTabChange("analysis")}
        className={`px-6 py-4 font-medium text-sm transition-colors relative ${
          activeTab === "analysis"
            ? "text-emerald-600 bg-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Activity className="w-4 h-4 inline mr-2" />
        Analysis
        {activeTab === "analysis" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
        )}
      </button>
    </nav>
  </div>
);

export default TabNavigation;