const ClassSelector = ({ allReports, selectedClass, onClassSelect }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-800">Select Class to Analyze</h2>
      <span className="text-sm text-gray-600">{allReports.length} classes available</span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {allReports.map((report, index) => (
        <button
          key={`${report.className}-${index}`} // Fixed: Added index to ensure unique keys
          onClick={() => onClassSelect(report.className)}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedClass === report.className
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-300'
          }`}
        >
          <div className="font-semibold text-gray-800">{report.className}</div>
          <div className="text-sm text-gray-600">{report.totalMethods} methods</div>
        </button>
      ))}
    </div>
  </div>
);

export default ClassSelector;