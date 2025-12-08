'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, ArrowLeft, AlertTriangle, FileText, Code, Hash, 
  Sparkles, Filter, FileCode, TrendingUp, BarChart, Search, XCircle, Info, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const ComplianceAgentPage=()=> {
  const router = useRouter();
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aggregatedMetrics, setAggregatedMetrics] = useState(null);

  // Helper functions for safe data access
  const safeToLower = (str) => {
    if (!str) return '';
    if (typeof str !== 'string') return String(str).toLowerCase();
    return str.toLowerCase();
  };

  const safeGet = (obj, prop, defaultValue = '') => {
    return obj && obj[prop] !== undefined ? obj[prop] : defaultValue;
  };

  useEffect(() => {
    // Get selected files from query params or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const fileIds = urlParams.get('files')?.split(',') || 
                    JSON.parse(sessionStorage.getItem('selectedFiles') || '[]');
    
    if (fileIds.length > 0) {
      loadAgentData(fileIds);
    } else {
      router.push('/multi-agent-review');
    }
  }, []);

  const loadAgentData = async (fileIds) => {
    setIsLoading(true);
    
    try {
      console.log('📋 Loading compliance data for files:', fileIds);
      
      const response = await fetch(`http://localhost:5400/api/compliance?files=${fileIds.join(',')}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Backend returned non-JSON: ${contentType}`);
      }
      
      const data = await response.json();
      console.log('🔍 Compliance backend response:', data);
      
      if (data.success && data.files && data.files.length > 0) {
        console.log('✅ Processing', data.files.length, 'files from backend');
        
        // Process backend data to match frontend structure
        const processedFiles = data.files.map(file => {
          const analysisData = file.analysis || {};
          const issues = analysisData.issues || [];
          const suggestions = analysisData.suggestions || [];
          
          // Calculate metrics
          const totalIssues = analysisData.totalIssues || issues.length || 0;
          const namingIssues = analysisData.issueCategories?.naming || 
                             issues.filter(i => i.type && i.type.includes('Naming')).length || 0;
          const formattingIssues = analysisData.issueCategories?.style || 
                                  issues.filter(i => i.type && i.type.includes('Formatting')).length || 0;
          
          return {
            id: file.id || `file-${Math.random()}`,
            name: safeGet(file, 'name', 'Unknown File'),
            fileName: safeGet(file, 'fileName', 'Unknown File'),
            path: safeGet(file, 'path', 'Unknown Path'),
            folder: safeGet(file, 'folder', 'unknown'),
            analysis: {
              ...analysisData,
              fileName: file.name || file.fileName,
              agent: analysisData.agent || "ComplianceAgent",
              issues: issues,
              suggestions: suggestions,
              totalIssues: totalIssues,
              severitySummary: analysisData.severitySummary || {
                critical: issues.filter(i => i.severity === 'critical').length,
                high: issues.filter(i => i.severity === 'high').length,
                medium: issues.filter(i => i.severity === 'medium').length,
                low: issues.filter(i => i.severity === 'low').length
              },
              issueCategories: analysisData.issueCategories || {
                naming: namingIssues,
                style: formattingIssues,
                documentation: issues.filter(i => i.type && i.type.includes('Documentation')).length,
                security: issues.filter(i => i.type && i.type.includes('Security')).length,
                performance: issues.filter(i => i.type && i.type.includes('Performance')).length,
                other: issues.filter(i => !i.type || !i.type.includes('Naming') && !i.type.includes('Formatting')).length
              },
              summary: {
                totalIssues: totalIssues,
                namingIssues: namingIssues,
                formattingIssues: formattingIssues,
                complianceScore: analysisData.complianceScore || 
                               Math.max(0, 100 - (totalIssues * 2))
              }
            }
          };
        });
        
        console.log('✅ Processed files:', processedFiles.length);
        
        setFiles(processedFiles);
        setSelectedFileId(processedFiles[0]?.id);
        
        // Calculate aggregated metrics
        const aggregated = calculateAggregatedMetrics(processedFiles);
        setAggregatedMetrics(aggregated);
        
      } else {
        console.log('❌ No data from compliance endpoint');
        // Set empty data structure
        setFiles([]);
        setAggregatedMetrics({
          totalFiles: 0,
          totalIssues: 0,
          avgComplianceScore: 0,
          mostCommonIssue: 'None'
        });
      }
    } catch (error) {
      console.error('Error loading compliance analysis:', error);
      // Set empty data on error
      setFiles([]);
      setAggregatedMetrics({
        totalFiles: 0,
        totalIssues: 0,
        avgComplianceScore: 0,
        mostCommonIssue: 'None'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAggregatedMetrics = (files) => {
    const totalIssues = files.reduce((sum, file) => sum + (file.analysis?.totalIssues || 0), 0);
    const totalNamingIssues = files.reduce((sum, file) => sum + (file.analysis?.issueCategories?.naming || 0), 0);
    const totalFormattingIssues = files.reduce((sum, file) => sum + (file.analysis?.issueCategories?.style || 0), 0);
    const totalFiles = files.length;
    
    // Calculate average compliance score
    const totalScore = files.reduce((sum, file) => {
      const score = file.analysis?.complianceScore || file.analysis?.summary?.complianceScore || 0;
      return sum + (isNaN(score) ? 0 : score);
    }, 0);
    const avgComplianceScore = totalFiles > 0 ? Math.round(totalScore / totalFiles) : 0;
    
    // Find most common issue type
    const issueTypes = files.flatMap(file => 
      (file.analysis?.issues || []).map(issue => issue.type)
    );
    const issueTypeCounts = issueTypes.reduce((acc, type) => {
      if (type) {
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    }, {});
    const mostCommonIssue = Object.entries(issueTypeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    
    // Calculate severity distribution
    const severitySummary = files.reduce((acc, file) => {
      const severity = file.analysis?.severitySummary || {};
      acc.critical = (acc.critical || 0) + (severity.critical || 0);
      acc.high = (acc.high || 0) + (severity.high || 0);
      acc.medium = (acc.medium || 0) + (severity.medium || 0);
      acc.low = (acc.low || 0) + (severity.low || 0);
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 });
    
    return {
      totalFiles,
      totalIssues,
      totalNamingIssues,
      totalFormattingIssues,
      avgComplianceScore,
      mostCommonIssue,
      severitySummary,
      filesBySeverity: {
        high: files.filter(f => (f.analysis?.severitySummary?.high || 0) > 0).length,
        medium: files.filter(f => (f.analysis?.severitySummary?.medium || 0) > 0).length,
        low: files.filter(f => (f.analysis?.severitySummary?.low || 0) > 0).length
      }
    };
  };

  const getIssueTypeColor = (type) => {
    if (!type) return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-800', badge: 'bg-gray-600' };
    
    const typeLower = safeToLower(type);
    if (typeLower.includes('naming')) {
      return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', badge: 'bg-blue-600' };
    }
    if (typeLower.includes('formatting') || typeLower.includes('style')) {
      return { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', badge: 'bg-purple-600' };
    }
    if (typeLower.includes('syntax')) {
      return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', badge: 'bg-red-600' };
    }
    if (typeLower.includes('documentation')) {
      return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', badge: 'bg-yellow-600' };
    }
    if (typeLower.includes('security')) {
      return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', badge: 'bg-red-600' };
    }
    return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-800', badge: 'bg-gray-600' };
  };

  const getSeverityColor = (severity) => {
    const severityLower = safeToLower(severity);
    if (severityLower === 'critical') return { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-600' };
    if (severityLower === 'high') return { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-600' };
    if (severityLower === 'medium') return { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-600' };
    if (severityLower === 'low') return { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-600' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-600' };
  };

  const getSeverityIcon = (severity) => {
    const severityLower = safeToLower(severity);
    switch (severityLower) {
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getComplianceScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return { text: 'text-gray-600', bg: 'bg-gray-100' };
    if (numScore >= 90) return { text: 'text-green-600', bg: 'bg-green-100' };
    if (numScore >= 80) return { text: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (numScore >= 70) return { text: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'text-red-600', bg: 'bg-red-100' };
  };

  const getCategoryColor = (category) => {
    const categoryLower = safeToLower(category);
    if (categoryLower === 'naming') return 'bg-blue-100 text-blue-800';
    if (categoryLower === 'style') return 'bg-purple-100 text-purple-800';
    if (categoryLower === 'documentation') return 'bg-yellow-100 text-yellow-800';
    if (categoryLower === 'security') return 'bg-red-100 text-red-800';
    if (categoryLower === 'performance') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const selectedFile = files.find(f => f.id === selectedFileId);
  const analysisData = selectedFile?.analysis;

  // Get issues from analysis data
  const issues = analysisData?.issues || [];
  const suggestions = analysisData?.suggestions || [];

  // Filter issues based on current filter and search
  const filteredIssues = issues.filter(issue => {
    if (!issue) return false;
    
    // Apply type filter
    if (filter === 'naming' && !issue.type?.includes('Naming')) return false;
    if (filter === 'formatting' && !issue.type?.includes('Formatting')) return false;
    if (filter === 'syntax' && !issue.type?.includes('Syntax')) return false;
    
    // Apply severity filter
    if (filter === 'high' && issue.severity !== 'high') return false;
    if (filter === 'medium' && issue.severity !== 'medium') return false;
    if (filter === 'low' && issue.severity !== 'low') return false;
    
    // Apply search query
    if (searchQuery) {
      const query = safeToLower(searchQuery);
      return (
        safeToLower(issue.type || '').includes(query) ||
        safeToLower(issue.message || '').includes(query) ||
        safeToLower(issue.description || '').includes(query) ||
        safeToLower(issue.name || '').includes(query)
      );
    }
    
    return true;
  });

  // Calculate file-level metrics
  const fileMetrics = {
    totalIssues: analysisData?.totalIssues || issues.length || 0,
    criticalIssues: analysisData?.severitySummary?.critical || 
                   issues.filter(i => i.severity === 'critical').length || 0,
    highIssues: analysisData?.severitySummary?.high || 
               issues.filter(i => i.severity === 'high').length || 0,
    mediumIssues: analysisData?.severitySummary?.medium || 
                 issues.filter(i => i.severity === 'medium').length || 0,
    lowIssues: analysisData?.severitySummary?.low || 
              issues.filter(i => i.severity === 'low').length || 0,
    complianceScore: analysisData?.complianceScore || 
                    analysisData?.summary?.complianceScore || 
                    Math.max(0, 100 - (issues.length * 2)) || 0
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-800 font-semibold text-lg">Loading Compliance Analysis...</p>
          <p className="text-slate-600 text-sm mt-2">Reading issues from backend...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Compliance Data Found</h2>
          <p className="text-slate-600 mb-4">Could not load compliance analysis from the backend.</p>
          <button
            onClick={() => router.push('/multi-agent-review')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/multi-agent-review')}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Multi-Agent Review</span>
          </button>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800">Compliance Agent</h1>
                <p className="text-slate-600 mt-1">
                  Analyzing {files.length} file{files.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-600">Project Compliance</p>
              <p className={`text-2xl font-bold ${getComplianceScoreColor(aggregatedMetrics?.avgComplianceScore).text}`}>
                {aggregatedMetrics?.avgComplianceScore || 0}%
              </p>
            </div>
          </div>

          {/* File Navigation Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {files.map((file) => {
                const isSelected = selectedFileId === file.id;
                const score = file.analysis?.complianceScore || file.analysis?.summary?.complianceScore || 0;
                const scoreColor = getComplianceScoreColor(score);
                const totalIssues = file.analysis?.totalIssues || 0;
                
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    {file.name}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isSelected
                        ? 'bg-green-700 text-green-100'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {totalIssues} issues
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${scoreColor.bg} ${scoreColor.text}`}>
                      {score}%
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Currently viewing: <span className="font-semibold">{selectedFile?.name}</span>
              {selectedFile?.folder && (
                <span className="text-slate-500 ml-2">(from {selectedFile.folder})</span>
              )}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-slate-800">{fileMetrics.totalIssues}</p>
                <p className="text-xs text-slate-500 mt-1">In this file</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Critical/High</p>
                <p className="text-3xl font-bold text-red-600">{fileMetrics.criticalIssues + fileMetrics.highIssues}</p>
                <p className="text-xs text-slate-500 mt-1">Require attention</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Naming Issues</p>
                <p className="text-3xl font-bold text-blue-600">{analysisData?.issueCategories?.naming || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Style violations</p>
              </div>
              <Hash className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Compliance Score</p>
                <p className={`text-3xl font-bold ${getComplianceScoreColor(fileMetrics.complianceScore).text}`}>
                  {fileMetrics.complianceScore.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Adherence to standards</p>
              </div>
              <Sparkles className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Project Aggregated Metrics */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart className="w-6 h-6 text-green-600" />
            Project-Wide Compliance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-800">Total Issues</p>
              <p className="text-2xl font-bold text-green-800">{aggregatedMetrics?.totalIssues || 0}</p>
              <p className="text-xs text-green-600">Across all files</p>
            </div>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800">Critical/High</p>
              <p className="text-2xl font-bold text-red-800">
                {(aggregatedMetrics?.severitySummary?.critical || 0) + (aggregatedMetrics?.severitySummary?.high || 0)}
              </p>
              <p className="text-xs text-red-600">Require immediate attention</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800">Naming Issues</p>
              <p className="text-2xl font-bold text-blue-800">{aggregatedMetrics?.totalNamingIssues || 0}</p>
              <p className="text-xs text-blue-600">Most common: {aggregatedMetrics?.mostCommonIssue || 'None'}</p>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800">Avg. Compliance</p>
              <p className={`text-2xl font-bold ${getComplianceScoreColor(aggregatedMetrics?.avgComplianceScore).text}`}>
                {aggregatedMetrics?.avgComplianceScore || 0}%
              </p>
              <p className="text-xs text-yellow-600">Project score</p>
            </div>
          </div>
          
          {/* Severity Distribution */}
          {aggregatedMetrics?.severitySummary && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-3">Severity Distribution</h3>
              <div className="flex flex-wrap gap-4">
                {Object.entries(aggregatedMetrics.severitySummary).map(([severity, count]) => (
                  <div key={severity} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity).badge}`}></div>
                    <span className="text-sm font-medium text-slate-700 capitalize">{severity}:</span>
                    <span className="text-sm font-bold text-slate-800">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search issues by type, message, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Issues ({issues.length})
              </button>
              <button
                onClick={() => setFilter('naming')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'naming' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Naming ({analysisData?.issueCategories?.naming || 0})
              </button>
              <button
                onClick={() => setFilter('formatting')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'formatting' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Formatting ({analysisData?.issueCategories?.style || 0})
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'high' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                High ({fileMetrics.highIssues})
              </button>
              <button
                onClick={() => setFilter('medium')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'medium' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Medium ({fileMetrics.mediumIssues})
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-slate-600">
            Showing {filteredIssues.length} of {issues.length} issues
            {searchQuery && ` matching "${searchQuery}"`}
            {filter !== 'all' && ` with filter "${filter}"`}
          </div>
        </div>

        {/* Issue Display */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Code className="w-6 h-6 text-green-600" />
            Compliance Issues ({filteredIssues.length} Issues)
            {suggestions.length > 0 && (
              <span className="text-sm font-normal text-green-600 ml-2">
                • {suggestions.length} suggestions available
              </span>
            )}
          </h2>
          
          {filteredIssues.length > 0 ? (
            <div className="space-y-4">
              {filteredIssues.map((issue, idx) => {
                const typeColors = getIssueTypeColor(issue.type);
                const severityColors = getSeverityColor(issue.severity || 'medium');
                const isExpanded = selectedIssue === idx;
                
                // Find corresponding suggestion
                const suggestion = suggestions.find(s => s.line === issue.line);
                
                return (
                  <div
                    key={idx}
                    className={`border-2 ${typeColors.border} ${typeColors.bg} rounded-xl overflow-hidden transition-all hover:shadow-md`}
                  >
                    {/* Issue Header */}
                    <button
                      onClick={() => setSelectedIssue(isExpanded ? null : idx)}
                      className="w-full p-5 text-left hover:bg-opacity-70 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`${severityColors.bg} flex items-center gap-1 text-xs font-bold uppercase px-3 py-1 rounded-full`}>
                            {getSeverityIcon(issue.severity)}
                            {issue.severity || 'medium'}
                          </span>
                          <span className={`${typeColors.badge} text-white text-xs font-bold uppercase px-3 py-1 rounded-full`}>
                            {issue.type || 'Compliance Issue'}
                          </span>
                          <span className="text-sm font-mono text-slate-700 font-semibold">
                            Line {issue.line || issue.lineNumber || 'N/A'}
                          </span>
                          {issue.name && (
                            <code className="text-sm bg-white px-2 py-1 rounded border border-slate-300">
                              {issue.name}
                            </code>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 font-semibold">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`font-semibold ${typeColors.text} text-lg mb-2`}>
                        {issue.message || issue.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Click to view details and fix suggestion</span>
                      </div>
                    </button>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-current border-opacity-20 p-5 bg-white bg-opacity-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Issue Details */}
                          <div>
                            <h4 className={`font-semibold ${typeColors.text} mb-4 flex items-center gap-2`}>
                              <FileText className="w-4 h-4" />
                              Issue Details
                            </h4>
                            <div className="space-y-4">
                              <div className="bg-white border border-slate-300 rounded-lg p-4">
                                <p className="font-semibold text-slate-700 mb-2">Description</p>
                                <p className="text-sm text-slate-600">
                                  {issue.message || issue.description || 'No description available'}
                                </p>
                              </div>
                              
                              {suggestion?.suggestion && (
                                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                                  <p className="font-semibold text-green-700 mb-2">Fix Suggestion</p>
                                  <p className="text-sm text-green-800">{suggestion.suggestion}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Additional Information */}
                          <div>
                            <h4 className={`font-semibold ${typeColors.text} mb-4 flex items-center gap-2`}>
                              <Info className="w-4 h-4" />
                              Additional Information
                            </h4>
                            <div className="space-y-4">
                              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                                <p className="font-semibold text-blue-700 mb-2">Why This Matters</p>
                                <p className="text-sm text-blue-800">
                                  {issue.type === 'Naming Issue' 
                                    ? 'Consistent naming conventions improve code readability, maintainability, and collaboration. Following established standards makes the codebase more approachable for new developers.'
                                    : issue.type === 'Formatting Issue'
                                    ? 'Proper formatting ensures code is clean, professional, and easier to review. It prevents git diff noise and makes the codebase more maintainable in the long term.'
                                    : 'Maintaining code quality standards ensures better collaboration and reduces technical debt.'
                                  }
                                </p>
                              </div>
                              
                              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                                <p className="font-semibold text-yellow-700 mb-2">Impact Level</p>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${severityColors.badge}`}></div>
                                  <span className="text-sm font-medium capitalize">{issue.severity || 'medium'} Priority</span>
                                </div>
                                <p className="text-xs text-yellow-700 mt-2">
                                  {issue.severity === 'critical' 
                                    ? 'Should be fixed immediately'
                                    : issue.severity === 'high'
                                    ? 'Should be addressed soon'
                                    : issue.severity === 'medium'
                                    ? 'Consider fixing in next update'
                                    : 'Can be addressed when convenient'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-green-300 p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {issues.length === 0 ? 'No Issues Found!' : 'No Matching Issues'}
              </h3>
              <p className="text-green-700">
                {issues.length === 0 
                  ? 'Great job! This file has no compliance issues.' 
                  : 'No issues match the current filter or search query.'}
              </p>
            </div>
          )}
        </div>

        {/* Recommendations Summary */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white mb-8">
          <h3 className="text-xl font-bold mb-4">Compliance Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Follow Naming Conventions</h4>
              <p className="text-sm text-green-100">
                Use consistent naming patterns (snake_case for functions, PascalCase for classes)
              </p>
            </div>
            <div className="bg-green-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Maintain Clean Formatting</h4>
              <p className="text-sm text-green-100">
                Remove trailing spaces, consistent indentation, and proper line breaks
              </p>
            </div>
            <div className="bg-green-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Document Your Code</h4>
              <p className="text-sm text-green-100">
                Add comments for complex logic and maintain consistent documentation style
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-green-400">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-green-200">Project Compliance Score</p>
                <p className="text-lg font-bold">
                  {aggregatedMetrics?.avgComplianceScore || 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-green-200">Files Analyzed</p>
                <p className="text-lg font-bold">
                  {files.length} of {aggregatedMetrics?.totalFiles || files.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-200">Critical Issues</p>
                <p className="text-lg font-bold text-red-300">
                  {aggregatedMetrics?.severitySummary?.critical || 0} need immediate attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplianceAgentPage