import { Code, Search } from 'lucide-react';
import MethodCard from './MethodCard';

const MethodsTabContent = ({ 
  activeMethodsData, 
  searchTerm, 
  filterLevel, 
  selectedMethod,
  onSearchChange, 
  onFilterChange, 
  onMethodSelect 
}) => (
  <div className="space-y-4">
    <div className="flex gap-4 mb-4">
      <div className="flex-1 relative">
        <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search methods..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
      <select
        value={filterLevel}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
      >
        <option value="all">All Levels</option>
        <option value="high">High Energy</option>
        <option value="medium">Medium Energy</option>
        <option value="low">Low Energy</option>
      </select>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {activeMethodsData.map((method, index) => (
        <MethodCard
          key={`${method.methodName}-${index}`} // Fixed: Added index to ensure unique keys
          method={method}
          isSelected={selectedMethod?.methodName === method.methodName}
          onSelect={onMethodSelect}
        />
      ))}
    </div>

    {activeMethodsData.length === 0 && (
      <div className="text-center py-12 text-gray-500">
        <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No methods found matching your criteria</p>
      </div>
    )}
  </div>
);

export default MethodsTabContent;