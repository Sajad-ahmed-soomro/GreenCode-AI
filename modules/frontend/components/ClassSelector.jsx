import React from 'react';

const ClassSelector = ({ allReports, selectedClass, onClassSelect }) => {
  // Filter out duplicate classes
  const uniqueClasses = React.useMemo(() => {
    const classMap = new Map();
    allReports.forEach(report => {
      if (!classMap.has(report.className)) {
        classMap.set(report.className, report);
      }
    });
    return Array.from(classMap.values());
  }, [allReports]);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Select Class to Analyze</h2>
        <span className="text-sm text-gray-600">{uniqueClasses.length} classes available</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {uniqueClasses.map((report, index) => (
          <button
            key={report.className || `class-${index}`}
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
};

export default ClassSelector;