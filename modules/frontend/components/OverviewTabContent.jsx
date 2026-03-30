import EnergyDistributionChart from './EnergyDistributionChart';

const OverviewTabContent = ({ activeMethodsData, topConsumers }) => (
  <div className="space-y-6">
    <EnergyDistributionChart activeMethodsData={activeMethodsData} />
    
    {topConsumers.length > 0 && (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Global Top Energy Consumers</h3>
        <div className="space-y-2">
          {topConsumers.slice(0, 5).map((method, index) => (
            <div key={`${method.className}-${method.methodName}-${index}`} className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="font-medium text-gray-700">
                {method.className}.{method.methodName}
              </span>
              <span className="text-red-600 font-semibold">
                {method.energyScore.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default OverviewTabContent;