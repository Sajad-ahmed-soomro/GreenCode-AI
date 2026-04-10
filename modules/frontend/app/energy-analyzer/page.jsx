"use client";

import React, { useState, useEffect, useMemo } from 'react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import Navigation from '../../components/Navigation';
import ClassSelector from '../../components/ClassSelector';
import MainContent from '../../components/MainContent';

// Use consistent environment variable name
const API_BASE_URL = process.env.NEXT_PUBLIC_ANALYZER_URL || 'http://localhost:5400';

const EnergyAnalyzer = () => {
  const [data, setData] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [filterLevel, setFilterLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statistics, setStatistics] = useState(null);
  const [topConsumers, setTopConsumers] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);

  useEffect(() => {
    console.log('API Base URL:', API_BASE_URL);
  }, []);

  useEffect(() => {
    fetchAllReports();
    fetchStatistics();
    fetchTopConsumers();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassReport(selectedClass);
    }
  }, [selectedClass]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/energy/reports`);
      const result = await response.json();
      
      if (result.success) {
        setAllReports(result.reports);
        if (result.reports.length > 0 && !selectedClass) {
          setSelectedClass(result.reports[0].className);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch reports: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to normalize method data
  const normalizeMethodData = (method) => {
    return {
      className: method.className || 'Unknown',
      methodName: method.methodName || 'unknown_method',
      energyScore: method.energyScore || method.combinedEnergyScore || method.staticEnergyScore || 0,
      cpuScore: method.cpuScore || method.staticCpuScore || 0,
      memScore: method.memScore || method.staticMemScore || 0,
      ioScore: method.ioScore || method.staticIoScore || 0,
      loopCount: method.loopCount || 0,
      nestingDepth: method.nestingDepth || 0,
      metrics: method.metrics || {},
      // Include original data for debugging
      _raw: method
    };
  };

  // Add this updated fetchClassReport function
  const fetchClassReport = async (className) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/energy/class/${className}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Validate the data structure
        if (!result.data || !Array.isArray(result.data.reports)) {
          console.warn('Unexpected data structure for class report:', result);
          // Try to extract reports from different possible structures
          const reports = result.reports || result.data || [];
          setData({ reports, statistics: result.statistics || {} });
        } else {
          setData(result.data);
        }
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch class report');
      }
    } catch (err) {
      console.error('Failed to fetch class report:', err);
      setError(`Failed to fetch data for ${className}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/energy/statistics`);
      const result = await response.json();
      
      if (result.success) {
        // Handle different response structures
        setStatistics(result.statistics || result.summary || result);
      } else {
        console.error('Failed to fetch statistics:', result.error);
        // Create fallback statistics from available data
        createFallbackStatistics();
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      createFallbackStatistics();
    }
  };

  const createFallbackStatistics = () => {
    // Create basic statistics from allReports
    if (allReports.length > 0) {
      const totalClasses = new Set(allReports.map(r => r.className)).size;
      const totalMethods = allReports.reduce((sum, r) => sum + (r.totalMethods || 0), 0);
      
      setStatistics({
        totalClasses,
        totalMethods,
        avgEnergy: allReports.reduce((sum, r) => sum + (r.statistics?.avgEnergy || 0), 0) / allReports.length
      });
    }
  };

  const fetchTopConsumers = async (limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/energy/top-consumers?limit=${limit}`);
      const result = await response.json();
      
      if (result.success) {
        setTopConsumers(result.methods);
      }
    } catch (err) {
      console.error('Failed to fetch top consumers:', err);
    }
  };

  const fetchImpactComparison = async () => {
    try {
      setComparisonLoading(true);
      setComparisonError(null);
      const response = await fetch(`${API_BASE_URL}/api/energy/impact-comparison?monthlyExecutions=100000&costPerKwhUsd=0.12&co2KgPerKwh=0.475&baselineOverheadRatio=0.3`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load comparison');
      }
      setComparisonData(result);
      setComparisonOpen(true);
    } catch (err) {
      setComparisonError(err.message || 'Failed to load comparison');
      setComparisonOpen(true);
    } finally {
      setComparisonLoading(false);
    }
  };

  // Update activeMethodsData calculation with normalization
  const activeMethodsData = useMemo(() => {
    if (!data?.reports) return [];
    
    let filtered = data.reports
      .map(normalizeMethodData)
      .filter(m => m.energyScore > 0);
    
    if (filterLevel === "high") {
      filtered = filtered.filter(m => m.energyScore > 0.5);
    } else if (filterLevel === "medium") {
      filtered = filtered.filter(m => m.energyScore > 0.3 && m.energyScore <= 0.5);
    } else if (filterLevel === "low") {
      filtered = filtered.filter(m => m.energyScore <= 0.3);
    }

    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.methodName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [data, filterLevel, searchTerm]);

  const stats = useMemo(() => {
    if (!data) return null;

    // Use normalized methods
    const allActiveMethods = activeMethodsData;
    const totalEnergy = allActiveMethods.reduce((sum, m) => sum + (m.energyScore || 0), 0);
    
    // Use statistics from data if available, otherwise calculate
    const dataStats = data.statistics || {};
    
    return {
      totalActive: allActiveMethods.length,
      avgEnergy: dataStats.avgEnergy || (allActiveMethods.length > 0 ? totalEnergy / allActiveMethods.length : 0),
      maxEnergy: dataStats.maxEnergy || Math.max(...allActiveMethods.map(m => m.energyScore || 0)),
      totalEnergy: totalEnergy,
      // Consider making these calculations more realistic or configurable
      energySavings: (totalEnergy * 0.05).toFixed(2),
      carbonReduction: (totalEnergy * 0.02).toFixed(2),
      highComplexity: allActiveMethods.filter(m => m.nestingDepth > 2).length,
      highCpu: allActiveMethods.filter(m => (m.cpuScore || 0) > 0.7).length
    };
  }, [data, activeMethodsData]);

  const comparisonRows = useMemo(() => {
    const apiRows = comparisonData?.fileComparisons;
    if (Array.isArray(apiRows) && apiRows.length > 0) return apiRows;
    if (!comparisonData || !Array.isArray(allReports) || allReports.length === 0) return [];

    const assumptions = comparisonData.assumptions || {};
    const monthlyExecutions = Number(assumptions.monthlyExecutions || 100000);
    const costPerKwhUsd = Number(assumptions.costPerKwhUsd || 0.12);
    const co2KgPerKwh = Number(assumptions.co2KgPerKwh || 0.475);
    const baselineOverheadRatio = Number(assumptions.baselineOverheadRatio || 0.3);

    const totalMethods = Math.max(
      1,
      allReports.reduce((sum, r) => sum + Number(r.totalMethods || 0), 0)
    );

    const rawRows = allReports
      .map((report) => {
        const methods = Math.max(1, Number(report.totalMethods || 1));
        const share = methods / totalMethods;
        const classExecutions = Math.max(1, monthlyExecutions * share);
        const avgEnergy = Number(report.statistics?.avgEnergy || 0);
        const postKwhPerRun = Math.max(0.000001, avgEnergy * 0.00002);
        const highEnergyDensity = Math.min(1, Number(report.statistics?.highEnergyMethods || 0) / methods);
        const loopDensity = Math.min(1, Number(report.statistics?.methodsWithLoops || 0) / methods);
        const fileOverheadRatio = Math.max(
          0.08,
          baselineOverheadRatio + (avgEnergy * 0.18) + (highEnergyDensity * 0.2) + (loopDensity * 0.12)
        );
        const baseKwhPerRun = postKwhPerRun * (1 + fileOverheadRatio);

        const beforeMonthlyKwh = baseKwhPerRun * classExecutions;
        const afterMonthlyKwh = postKwhPerRun * classExecutions;
        const beforeCost = beforeMonthlyKwh * costPerKwhUsd;
        const afterCost = afterMonthlyKwh * costPerKwhUsd;
        const beforeCo2 = beforeMonthlyKwh * co2KgPerKwh;
        const afterCo2 = afterMonthlyKwh * co2KgPerKwh;
        const savedKwh = beforeMonthlyKwh - afterMonthlyKwh;
        const savedCost = beforeCost - afterCost;
        const savedCo2 = beforeCo2 - afterCo2;

        const className = report.className || (report.fileName ? report.fileName.replace('-energy-report.json', '') : 'Unknown');
        return {
          file: `${className}.java`,
          methods,
          before: { monthlyCostUsd: beforeCost },
          after: { monthlyCostUsd: afterCost },
          savings: {
            costUsd: savedCost,
            kwh: savedKwh,
            co2Kg: savedCo2,
            efficiencyGainPercent: beforeMonthlyKwh > 0 ? (savedKwh / beforeMonthlyKwh) * 100 : 0
          }
        };
      });

    // Keep only one latest/strongest row per file.
    const deduped = Array.from(
      rawRows.reduce((map, row) => {
        const prev = map.get(row.file);
        if (!prev || row.savings.costUsd >= prev.savings.costUsd) map.set(row.file, row);
        return map;
      }, new Map()).values()
    );
    return deduped.sort((a, b) => b.savings.costUsd - a.savings.costUsd);
  }, [comparisonData, allReports]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchAllReports} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navigation
        statistics={statistics}
        onRefresh={fetchAllReports}
        onShowComparison={fetchImpactComparison}
      />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {comparisonOpen && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Before vs After Module Impact</h2>
              <button
                onClick={() => setComparisonOpen(false)}
                className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
            {comparisonLoading && <p className="text-gray-600">Loading comparison...</p>}
            {comparisonError && <p className="text-red-600">{comparisonError}</p>}
            {!comparisonLoading && comparisonData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border bg-red-50 border-red-200">
                    <p className="text-sm text-red-700">Before Analysis (Monthly Cost)</p>
                    <p className="text-2xl font-bold text-red-800">${comparisonData.before.monthlyCostUsd.toFixed(2)}</p>
                    <p className="text-xs text-red-700">{comparisonData.before.monthlyKwh.toFixed(2)} kWh</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                    <p className="text-sm text-emerald-700">After Analysis (Monthly Cost)</p>
                    <p className="text-2xl font-bold text-emerald-800">${comparisonData.after.monthlyCostUsd.toFixed(2)}</p>
                    <p className="text-xs text-emerald-700">{comparisonData.after.monthlyKwh.toFixed(2)} kWh</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-700">Savings</p>
                    <p className="text-2xl font-bold text-blue-800">${comparisonData.savings.costUsd.toFixed(2)}</p>
                    <p className="text-xs text-blue-700">{comparisonData.savings.efficiencyGainPercent.toFixed(1)}% efficiency gain</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-gray-50">
                    <p className="font-semibold text-gray-800 mb-2">Monthly Impact</p>
                    <p className="text-sm text-gray-700">Energy saved: {comparisonData.savings.kwh.toFixed(2)} kWh</p>
                    <p className="text-sm text-gray-700">CO2 reduced: {comparisonData.savings.co2Kg.toFixed(2)} kg</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-gray-50">
                    <p className="font-semibold text-gray-800 mb-2">Annualized Impact</p>
                    <p className="text-sm text-gray-700">Cost saved: ${comparisonData.annualized.costUsd.toFixed(2)}</p>
                    <p className="text-sm text-gray-700">Energy saved: {comparisonData.annualized.kwh.toFixed(2)} kWh</p>
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Per-File Comparison</h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-gray-700">
                          <th className="px-4 py-2">File</th>
                          <th className="px-4 py-2">Methods</th>
                          <th className="px-4 py-2">Before ($/mo)</th>
                          <th className="px-4 py-2">After ($/mo)</th>
                          <th className="px-4 py-2">Savings ($/mo)</th>
                          <th className="px-4 py-2">Energy Saved (kWh/mo)</th>
                          <th className="px-4 py-2">CO2 Saved (kg/mo)</th>
                          <th className="px-4 py-2">Efficiency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows.map((f, idx) => (
                          <tr key={`${f.file}-${idx}`} className="border-t border-gray-100 hover:bg-emerald-50/40">
                            <td className="px-4 py-2 font-medium text-gray-800">{f.file}</td>
                            <td className="px-4 py-2 text-gray-700">{f.methods}</td>
                            <td className="px-4 py-2 text-red-700">${f.before.monthlyCostUsd.toFixed(3)}</td>
                            <td className="px-4 py-2 text-emerald-700">${f.after.monthlyCostUsd.toFixed(3)}</td>
                            <td className="px-4 py-2 text-blue-700 font-semibold">${f.savings.costUsd.toFixed(3)}</td>
                            <td className="px-4 py-2 text-gray-700">{f.savings.kwh.toFixed(3)}</td>
                            <td className="px-4 py-2 text-gray-700">{f.savings.co2Kg.toFixed(3)}</td>
                            <td className="px-4 py-2 text-gray-700">{f.savings.efficiencyGainPercent.toFixed(1)}%</td>
                          </tr>
                        ))}
                        {comparisonRows.length === 0 && (
                          <tr>
                            <td className="px-4 py-3 text-gray-500" colSpan={8}>No per-file comparison available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <ClassSelector 
          allReports={allReports} 
          selectedClass={selectedClass} 
          onClassSelect={setSelectedClass} 
        />

        {data && stats && (
          <MainContent
            data={data}
            stats={stats}
            activeTab={activeTab}
            activeMethodsData={activeMethodsData}
            selectedMethod={selectedMethod}
            topConsumers={topConsumers}
            searchTerm={searchTerm}
            filterLevel={filterLevel}
            onTabChange={setActiveTab}
            onSearchChange={setSearchTerm}
            onFilterChange={setFilterLevel}
            onMethodSelect={setSelectedMethod}
          />
        )}
      </div>

      {/* Debug Panel */}
      {debugMode && data && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md max-h-96 overflow-auto text-xs z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Debug Info</h3>
            <button 
              onClick={() => setDebugMode(false)}
              className="text-red-400 hover:text-red-300"
            >
              Close
            </button>
          </div>
          <div className="space-y-1">
            <div>Active Methods: {activeMethodsData.length}</div>
            <div>Selected Class: {selectedClass}</div>
            <div>API Base: {API_BASE_URL}</div>
            <div>Data Structure: {data.reports ? 'reports array' : 'unknown'}</div>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-300">Raw Statistics</summary>
            <pre className="mt-1 p-2 bg-gray-900 rounded overflow-auto max-h-40">
              {JSON.stringify(data.statistics, null, 2)}
            </pre>
          </details>
          <button 
            onClick={() => console.log('Active methods:', activeMethodsData)}
            className="mt-2 text-sm text-blue-300 hover:text-blue-200"
          >
            Log Active Methods to Console
          </button>
        </div>
      )}

      {/* Debug Toggle Button */}
      <button
        onClick={() => setDebugMode(!debugMode)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full text-xs opacity-50 hover:opacity-100 z-40"
        title="Toggle Debug Mode"
      >
        {debugMode ? '🔴' : '🐛'}
      </button>
    </div>
  );
};

export default EnergyAnalyzer;