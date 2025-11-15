"use client"
import React, { useState, useEffect, useMemo } from 'react';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import Navigation from '../../components/Navigation';
import ClassSelector from '../../components/ClassSelector';
import MainContent from '../../components/MainContent';

const API_BASE_URL = process.env.NEXT_PUBLIC_ANALYZER_URL || 'http://localhost:5400/api/energy';

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

  const fetchClassReport = async (className) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/energy/class/${className}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch class report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/energy/statistics`);
      const result = await response.json();
      
      if (result.success) {
        setStatistics(result.statistics);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
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

  const activeMethodsData = useMemo(() => {
    if (!data?.reports) return [];
    
    let filtered = data.reports.filter(m => m.energyScore > 0);
    
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

    const allActiveMethods = data.reports?.filter(m => m.energyScore > 0) || [];
    const totalEnergy = allActiveMethods.reduce((sum, m) => sum + m.energyScore, 0);
    
    return {
      totalActive: allActiveMethods.length,
      avgEnergy: data.statistics?.avgEnergy || 0,
      maxEnergy: data.statistics?.maxEnergy || 0,
      totalEnergy: data.statistics?.totalEnergy || 0,
      energySavings: (totalEnergy * 0.05).toFixed(2),
      carbonReduction: (totalEnergy * 0.02).toFixed(2),
      highComplexity: allActiveMethods.filter(m => m.nestingDepth > 2).length,
      highCpu: allActiveMethods.filter(m => m.cpuScore > 0.7).length
    };
  }, [data]);

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
    </div>
  );
};

export default EnergyAnalyzer;