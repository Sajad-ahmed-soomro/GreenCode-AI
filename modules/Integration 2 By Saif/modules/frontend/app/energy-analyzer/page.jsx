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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchAllReports} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navigation statistics={statistics} onRefresh={fetchAllReports} />
      
      <div className="max-w-7xl mx-auto p-6">
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