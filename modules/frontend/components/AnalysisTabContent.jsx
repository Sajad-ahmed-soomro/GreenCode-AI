import { Shield } from 'lucide-react';
import PerformanceRadar from './PerformanceRader';

const AnalysisTabContent = ({ selectedMethod }) => (
  <div className="space-y-6">
    {selectedMethod ? (
      <PerformanceRadar selectedMethod={selectedMethod} />
    ) : (
      <div className="text-center py-12 text-gray-500">
        <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>Select a method from the Methods tab to view detailed analysis</p>
      </div>
    )}
  </div>
);

export default AnalysisTabContent;