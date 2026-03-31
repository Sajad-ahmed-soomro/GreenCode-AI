import StatsCard from './StatesCard';
import EnvironmentalImpact from './EnvironmentalImpact';
import TabNavigation from './TabNavigation';
import OverviewTabContent from './OverviewTabContent';
import MethodsTabContent from './MethodTabContent';
import AnalysisTabContent from './AnalysisTabContent';

const MainContent = ({ 
  data, 
  stats, 
  activeTab, 
  activeMethodsData, 
  selectedMethod,
  topConsumers,
  searchTerm,
  filterLevel,
  onTabChange,
  onSearchChange,
  onFilterChange,
  onMethodSelect 
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-1 space-y-6">
      <StatsCard stats={stats} />
      <EnvironmentalImpact stats={stats} />
    </div>

    <div className="lg:col-span-2">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
          methodsCount={activeMethodsData.length} 
        />

        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTabContent 
              activeMethodsData={activeMethodsData} 
              topConsumers={topConsumers} 
            />
          )}

          {activeTab === "methods" && (
            <MethodsTabContent
              activeMethodsData={activeMethodsData}
              searchTerm={searchTerm}
              filterLevel={filterLevel}
              selectedMethod={selectedMethod}
              onSearchChange={onSearchChange}
              onFilterChange={onFilterChange}
              onMethodSelect={onMethodSelect}
            />
          )}

          {activeTab === "analysis" && (
            <AnalysisTabContent selectedMethod={selectedMethod} />
          )}
        </div>
      </div>
    </div>
  </div>
);

export default MainContent;