'use client';

import React, { useState, useEffect } from 'react';
import { Code2, ArrowLeft, AlertCircle, CheckCircle, TrendingUp, FileText, BarChart, MessageSquare, FileCode, Zap, Database, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function MaintainabilityAgentPage() {
  const router = useRouter();
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [aggregatedMetrics, setAggregatedMetrics] = useState(null);

  useEffect(() => {
    // Get selected files from query params or session storage - EXACTLY like data-structure
    const urlParams = new URLSearchParams(window.location.search);
    const fileIds = urlParams.get('files')?.split(',') || 
                    JSON.parse(sessionStorage.getItem('selectedFiles') || '[]');
    
    console.log('Maintainability Agent - Loading files:', fileIds);
    
    if (fileIds.length > 0) {
      loadAgentData(fileIds);
    } else {
      router.push('/multi-agent-review');
    }
  }, []);

  const loadAgentData = async (fileIds) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Maintainability Agent - Fetching data for:', fileIds);
      
      // Call backend EXACTLY like data-structure does
      const response = await fetch(`http://localhost:5400/api/maintainability?files=${fileIds.join(',')}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load maintainability analysis`);
      }
      
      const data = await response.json();
      console.log('Maintainability Agent - Backend response:', data);
      
      if (data.success && data.files && data.files.length > 0) {
        // Backend returns data with matching IDs
        setFiles(data.files);
        setSelectedFileId(data.files[0].id);
        setAggregatedMetrics(data.aggregated);
      } else {
        // If no data from backend but we have available files info
        if (data.availableFiles) {
          console.log('Available maintainability files:', data.availableFiles);
          setError(`No maintainability analysis found for selected files. Available files: ${data.availableFiles.join(', ')}`);
        } else {
          setError(data.message || 'No maintainability analysis data available');
        }
        setFiles([]);
      }
    } catch (error) {
      console.error('Error in maintainability agent:', error);
      setError(error.message);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (numScore >= 85) return { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-600' };
    if (numScore >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-600' };
    return { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-600' };
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'excellent':
      case 'good':
      case 'low': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
      case 'fair':
      case 'poor':
      case 'high': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    }
  };

  const getIssueTypeColor = (issueType) => {
    const colors = {
      'LowMaintainability': 'bg-red-100 text-red-800 border-red-300',
      'MetricIssue': 'bg-orange-100 text-orange-800 border-orange-300',
      'MaintainabilityIssue': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'default': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[issueType] || colors.default;
  };

  const getSeverityColor = (score) => {
    if (score < 50) return 'bg-red-100 text-red-800';
    if (score < 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const selectedFile = files.find(f => f.id === selectedFileId);
  const analysisData = selectedFile?.analysis;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-800 font-semibold text-lg">Loading Maintainability Analysis...</p>
          <p className="text-slate-600 text-sm mt-2">Analyzing code maintainability metrics...</p>
        </div>
      </div>
    );
  }

  if (error && files.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Maintainability Data</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/multi-agent-review')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - EXACTLY like data-structure */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/multi-agent-review')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Multi-Agent Review</span>
          </button>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl">
                <Code2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800">Maintainability Agent</h1>
                <p className="text-slate-600 mt-1">
                  Analyzing {files.length} file{files.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-600">Aggregated Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(aggregatedMetrics?.averageScore).text}`}>
                {aggregatedMetrics?.averageScore || '0.0'}
              </p>
            </div>
          </div>

          {/* File Navigation Tabs - EXACTLY like data-structure */}
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {files.map((file) => {
                const isSelected = selectedFileId === file.id;
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    {file.name}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isSelected
                        ? 'bg-purple-700 text-purple-100'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {file.analysis?.totalMethods || 0} methods
                    </span>
                    {file.analysis?.criticalIssues > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white">
                        {file.analysis.criticalIssues} critical
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Currently viewing: <span className="font-semibold">{selectedFile?.name}</span>
            </p>
          </div>
        </div>

        {/* Summary Cards - Similar to data-structure */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Average Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(analysisData?.averageScore).text}`}>
                  {analysisData?.averageScore?.toFixed(1) || 'N/A'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Maintainability score</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Methods</p>
                <p className="text-3xl font-bold text-slate-800">{analysisData?.totalMethods || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Across {analysisData?.totalClasses || 0} class{analysisData?.totalClasses !== 1 ? 'es' : ''}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Lines of Code</p>
                <p className="text-3xl font-bold text-slate-800">{analysisData?.realLOC || 0}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Comments: {analysisData?.realComments || 0}
                </p>
              </div>
              <BarChart className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-slate-800">{analysisData?.totalIssues || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Maintainability issues</p>
              </div>
              <AlertCircle className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Project Aggregated Metrics - EXACTLY like data-structure */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart className="w-6 h-6 text-blue-600" />
            Project-Wide Analysis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800">Total Methods</p>
              <p className="text-2xl font-bold text-blue-800">{aggregatedMetrics?.totalMethods || 0}</p>
              <p className="text-xs text-blue-600">Across all files</p>
            </div>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800">Critical Issues</p>
              <p className="text-2xl font-bold text-red-800">{aggregatedMetrics?.criticalIssues || 0}</p>
              <p className="text-xs text-red-600">Require immediate attention</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-800">Avg. Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(aggregatedMetrics?.averageScore).text}`}>
                {aggregatedMetrics?.averageScore || '0.0'}
              </p>
              <p className="text-xs text-purple-600">Maintainability score</p>
            </div>
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-800">Most Common</p>
              <p className="text-lg font-bold text-green-800 truncate">
                {aggregatedMetrics?.mostCommonIssue || 'None'}
              </p>
              <p className="text-xs text-green-600">Issue type</p>
            </div>
          </div>
        </div>

        {/* Method Analysis Section */}
        {/* Method Analysis Section */}
        {analysisData?.results && analysisData.results.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              Method Analysis ({analysisData.results.length} methods)
            </h2>
            
            <div className="space-y-4">
              {analysisData.results.map((method, idx) => {
                const scoreColors = getScoreColor(method.methodScore);
                const severityColor = getSeverityColor(method.methodScore);
                const isExpanded = selectedMethod === idx;
                
                // Filter out function length metrics from both display areas
                const filteredMetrics = method.metrics ? 
                  method.metrics.filter(metric => {
                    const metricName = metric.metric.toLowerCase();
                    return !metricName.includes('function') && !metricName.includes('length');
                  }) : [];
                
                return (
                  <div
                    key={idx}
                    className="border-2 border-slate-200 rounded-xl overflow-hidden transition-all hover:border-purple-300"
                  >
                    {/* Method Header */}
                    <button
                      onClick={() => setSelectedMethod(isExpanded ? null : idx)}
                      className="w-full p-5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`${severityColor} text-xs font-bold uppercase px-3 py-1 rounded-full`}>
                            Score: {method.methodScore}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              {method.className} <span className="text-slate-500">::</span> {method.methodName}
                            </p>
                            <p className="text-xs text-slate-500">Level: {method.maintainabilityLevel}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 font-semibold">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Metrics Summary - Use filtered metrics */}
                      {filteredMetrics.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-4">
                          {filteredMetrics.slice(0, 6).map((metric, mIdx) => {
                            const statusColor = getStatusColor(metric.status);
                            return (
                              <div key={mIdx} className={`${statusColor.bg} border ${statusColor.border} rounded p-2 text-center`}>
                                <p className="text-xs font-semibold truncate">{metric.metric}</p>
                                <p className="text-sm font-bold">{metric.value}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </button>
                    
                    {/* Expanded Details - Use filtered metrics */}
                    {isExpanded && filteredMetrics.length > 0 && (
                      <div className="border-t-2 border-slate-200 p-5 bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Metrics Details */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                              <BarChart className="w-4 h-4" />
                              Detailed Metrics
                            </h4>
                            <div className="space-y-3">
                              {filteredMetrics.map((metric, mIdx) => {
                                const statusColor = getStatusColor(metric.status);
                                return (
                                  <div key={mIdx} className={`${statusColor.bg} border ${statusColor.border} rounded-lg p-3`}>
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-semibold text-sm">{metric.metric}</span>
                                      <span className={`text-sm font-bold`}>{metric.value}</span>
                                    </div>
                                    {metric.message && (
                                      <p className="text-xs text-slate-700">{metric.message}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Suggestions */}
                          {method.suggestions && method.suggestions.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Improvement Suggestions
                              </h4>
                              <div className="space-y-3">
                                {method.suggestions.map((suggestion, sIdx) => (
                                  <div key={sIdx} className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800">{suggestion}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
      ) 
        : analysisData?.suggestions && analysisData.suggestions.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database className="w-6 h-6 text-purple-600" />
              Maintainability Issues ({analysisData.suggestions.length} found)
            </h2>
            
            <div className="space-y-4">
              {analysisData.suggestions.map((issue, idx) => {
                const issueTypeColor = getIssueTypeColor(issue.issueType);
                
                return (
                  <div
                    key={idx}
                    className="border-2 border-slate-200 rounded-xl overflow-hidden transition-all hover:border-purple-300"
                  >
                    {/* Issue Header */}
                    <div className="w-full p-5 text-left">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`${issueTypeColor} text-xs font-bold uppercase px-3 py-1 rounded-full`}>
                            {issue.issueType}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              Line {issue.lineNumber}: {issue.pattern}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Issue Details */}
                      <div className="mt-3">
                        <p className="text-sm text-slate-600 mb-2">{issue.why}</p>
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                          <p className="font-semibold text-yellow-700 mb-1">Energy Impact</p>
                          <p className="text-sm text-yellow-800">{issue.energyImpact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border-2 border-slate-200 mb-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Issues Found!</h3>
            <p className="text-slate-600">Great job! No maintainability issues detected in this file.</p>
          </div>
        )}

        {/* Recommendations Summary */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Maintainability Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Code Structure</h4>
              <p className="text-sm text-purple-100">Keep methods focused and under 50 lines, limit nesting depth</p>
            </div>
            <div className="bg-purple-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Documentation</h4>
              <p className="text-sm text-purple-100">Maintain 10-30% comment ratio for complex logic</p>
            </div>
            <div className="bg-purple-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Complexity</h4>
              <p className="text-sm text-purple-100">Keep cyclomatic complexity under 10 per method</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-200">Potential Maintenance Reduction</p>
                <p className="text-lg font-bold">Up to 40% less technical debt</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-200">Files Analyzed</p>
                <p className="text-lg font-bold">{files.length} of {files.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}