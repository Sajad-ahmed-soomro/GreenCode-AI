import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
      <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Error Loading Data</h2>
      <p className="text-gray-600 text-center mb-4">{error}</p>
      <button 
        onClick={onRetry}
        className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
      >
        Retry
      </button>
    </div>
  </div>
);

export default ErrorState;