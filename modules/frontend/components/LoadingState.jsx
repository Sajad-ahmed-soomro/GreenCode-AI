import { RefreshCw } from 'lucide-react';

const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
    <div className="text-center">
      <RefreshCw className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading energy reports...</p>
    </div>
  </div>
);

export default LoadingState;