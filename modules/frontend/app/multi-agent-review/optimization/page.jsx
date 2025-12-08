'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, ArrowLeft, AlertTriangle, TrendingUp, Cpu, Clock, 
  Gauge, Filter, FileCode, BarChart, ChevronDown, Database, 
  Code, Battery, FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OptimizationAgentPage() {
  const router = useRouter();
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [aggregatedMetrics, setAggregatedMetrics] = useState(null);

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
      // Call backend API for optimization analysis
      const response = await fetch(`http://localhost:5400/api/optimization?files=${fileIds.join(',')}`);
      const data = await response.json();
      
      if (data.success && data.files && data.files.length > 0) {
        // Transform the backend data to match frontend structure
        const processedFiles = data.files.map(file => ({
          id: file.id,
          name: file.name,
          path: file.path || file.analysis?.sourcePath,
          folder: file.folder || 'unknown',
          analysis: file.analysis
        }));
        
        setFiles(processedFiles);
        setSelectedFileId(processedFiles[0]?.id);
        setAggregatedMetrics(data.aggregated);
        
        console.log('✅ Loaded optimization data:', {
          fileCount: processedFiles.length,
          firstFile: processedFiles[0]?.name,
          aggregatedMetrics: data.aggregated
        });
      } else {
        console.warn('No optimization data found from backend');
        // Try loading individual files
        await loadIndividualFileData(fileIds);
      }
    } catch (error) {
      console.error('Error loading optimization analysis:', error);
      await loadIndividualFileData(fileIds);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIndividualFileData = async (fileIds) => {
    try {
      const processedFiles = [];
      const allResults = [];
      
      for (const fileId of fileIds) {
        try {
          const response = await fetch(`http://localhost:5400/api/optimization/file/${fileId}`);
          if (response.ok) {
            const fileData = await response.json();
            
            if (fileData.success && fileData.file) {
              processedFiles.push(fileData.file);
              if (fileData.file.analysis?.results) {
                allResults.push(...fileData.file.analysis.results);
              }
            }
          }
        } catch (error) {
          console.error(`Error loading file ${fileId}:`, error);
        }
      }
      
      if (processedFiles.length > 0) {
        setFiles(processedFiles);
        setSelectedFileId(processedFiles[0]?.id);
        
        // Calculate aggregated metrics manually
        const aggregated = calculateAggregatedMetrics(processedFiles);
        setAggregatedMetrics(aggregated);
        
        console.log('✅ Loaded individual optimization files:', {
          fileCount: processedFiles.length,
          totalResults: allResults.length
        });
      }
    } catch (error) {
      console.error('Error loading individual file data:', error);
    }
  };

  const calculateAggregatedMetrics = (files) => {
    const totalIssues = files.reduce((sum, file) => sum + (file.analysis?.summary?.totalIssues || 0), 0);
    const totalCriticalIssues = files.reduce((sum, file) => sum + (file.analysis?.summary?.criticalIssues || 0), 0);
    const totalFiles = files.length;
    
    // Calculate severity breakdown
    const severityBreakdown = { high: 0, medium: 0, low: 0 };
    const issueTypes = {};
    
    files.forEach(file => {
      const breakdown = file.analysis?.summary?.severityBreakdown;
      if (breakdown) {
        severityBreakdown.high += breakdown.high || 0;
        severityBreakdown.medium += breakdown.medium || 0;
        severityBreakdown.low += breakdown.low || 0;
      }
      
      // Collect issue types from results
      file.analysis?.results?.forEach(result => {
        const type = result.issueType || result.type || 'GeneralOptimization';
        issueTypes[type] = (issueTypes[type] || 0) + 1;
      });
    });
    
    const mostCommonIssue = Object.entries(issueTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    
    // Calculate performance score
    const performanceScore = calculatePerformanceScore(totalIssues, totalCriticalIssues, totalFiles);
    
    // Calculate estimated energy savings
    const estimatedSavings = Math.min(95, (totalCriticalIssues * 70) + ((totalIssues - totalCriticalIssues) * 40));
    
    return {
      totalFiles,
      totalIssues,
      totalCriticalIssues,
      avgIssuesPerFile: totalFiles > 0 ? (totalIssues / totalFiles).toFixed(2) : 0,
      severityBreakdown,
      issueTypes,
      mostCommonIssue,
      performanceScore,
      estimatedSavings
    };
  };

  const calculatePerformanceScore = (totalIssues, criticalIssues, fileCount) => {
    if (fileCount === 0) return 100;
    
    const avgIssues = totalIssues / fileCount;
    const criticalRatio = criticalIssues / totalIssues || 0;
    
    let score = 100;
    score -= avgIssues * 2;
    score -= criticalRatio * 30;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300', badge: 'bg-red-600' };
      case 'medium':
        return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300', badge: 'bg-yellow-600' };
      case 'low':
        return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300', badge: 'bg-green-600' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-300', badge: 'bg-gray-600' };
    }
  };

  const getIssueTypeColor = (issueType) => {
    switch (issueType) {
      case 'NestedLoops':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'LoopOptimization':
        return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'LinearScan':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
    }
  };

  const getPerformanceScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const selectedFile = files.find(f => f.id === selectedFileId);
  const analysisData = selectedFile?.analysis;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-yellow-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="animate-spin w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-800 font-semibold text-lg">Loading Optimization Analysis...</p>
          <p className="text-slate-600 text-sm mt-2">Reading data from backend...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-yellow-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Optimization Data Found</h2>
          <p className="text-slate-600 mb-4">Could not load optimization analysis from the backend.</p>
          <button
            onClick={() => router.push('/multi-agent-review')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/multi-agent-review')}
            className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Multi-Agent Review</span>
          </button>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800">Optimization Agent</h1>
                <p className="text-slate-600 mt-1">
                  Analyzing {files.length} file{files.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-600">Performance Score</p>
              <p className={`text-2xl font-bold ${getPerformanceScoreColor(aggregatedMetrics?.performanceScore)}`}>
                {aggregatedMetrics?.performanceScore || 0}/100
              </p>
            </div>
          </div>

          {/* File Navigation Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {files.map((file) => {
                const isSelected = selectedFileId === file.id;
                const totalIssues = file.analysis?.summary?.totalIssues || 0;
                const criticalIssues = file.analysis?.summary?.criticalIssues || 0;
                
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-yellow-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    {file.name}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isSelected
                        ? 'bg-yellow-700 text-yellow-100'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {totalIssues} issues
                    </span>
                    {criticalIssues > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white">
                        {criticalIssues} critical
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Currently viewing: <span className="font-semibold">{selectedFile?.name}</span>
              {analysisData?.summary && (
                <span className="ml-2">
                  • {analysisData.summary.totalIssues} optimization opportunities
                  • {analysisData.summary.energySavings || 0}% energy savings
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-slate-800">
                  {analysisData?.summary?.totalIssues || 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">Optimization opportunities</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Critical Issues</p>
                <p className="text-3xl font-bold text-red-600">
                  {analysisData?.summary?.criticalIssues || 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">High priority fixes</p>
              </div>
              <Zap className="w-12 h-12 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Energy Savings</p>
                <p className="text-3xl font-bold text-green-600">
                  {analysisData?.summary?.energySavings || aggregatedMetrics?.estimatedSavings || 0}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Potential reduction</p>
              </div>
              <Battery className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Methods Affected</p>
                <p className="text-3xl font-bold text-slate-800">
                  {analysisData?.summary?.methodsAffected || 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">Requiring optimization</p>
              </div>
              <Code className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Project Aggregated Metrics */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart className="w-6 h-6 text-yellow-600" />
            Project-Wide Optimization Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800">Total Issues</p>
              <p className="text-2xl font-bold text-yellow-800">{aggregatedMetrics?.totalIssues || 0}</p>
              <p className="text-xs text-yellow-600">Across all files</p>
            </div>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800">Critical Issues</p>
              <p className="text-2xl font-bold text-red-800">{aggregatedMetrics?.totalCriticalIssues || 0}</p>
              <p className="text-xs text-red-600">Require immediate attention</p>
            </div>
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-800">Est. Savings</p>
              <p className="text-2xl font-bold text-green-800">{aggregatedMetrics?.estimatedSavings || 0}%</p>
              <p className="text-xs text-green-600">Potential energy savings</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800">Avg. Issues/File</p>
              <p className="text-2xl font-bold text-blue-800">{aggregatedMetrics?.avgIssuesPerFile || 0}</p>
              <p className="text-xs text-blue-600">Average per file</p>
            </div>
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-2 border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Issue Priority Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analysisData?.summary?.severityBreakdown || {}).map(([severity, count]) => {
              if (count === 0) return null;
              const colors = getSeverityColor(severity);
              return (
                <div key={severity} className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${colors.text} capitalize`}>{severity} Priority</p>
                      <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                      <p className={`text-xs ${colors.text} opacity-75 mt-1`}>Optimization opportunities</p>
                    </div>
                    <div className={`${colors.badge} text-white rounded-full w-10 h-10 flex items-center justify-center font-bold`}>
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Issues */}
        {analysisData?.results && analysisData.results.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-600" />
              Performance Optimization Opportunities ({analysisData.results.length} Issues)
            </h2>
            
            <div className="space-y-4">
              {analysisData.results.map((issue, idx) => {
                const colors = getSeverityColor(issue.severity);
                const issueTypeColor = getIssueTypeColor(issue.issueType || issue.type);
                const isExpanded = selectedIssue === idx;
                
                return (
                  <div
                    key={idx}
                    className={`border-2 ${colors.border} ${colors.bg} rounded-xl overflow-hidden transition-all`}
                  >
                    {/* Issue Header */}
                    <button
                      onClick={() => setSelectedIssue(isExpanded ? null : idx)}
                      className="w-full p-5 text-left hover:bg-opacity-70 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`${colors.badge} text-white text-xs font-bold uppercase px-3 py-1 rounded-full`}>
                            {issue.severity || 'medium'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${issueTypeColor.bg} ${issueTypeColor.text}`}>
                            {issue.issueType || issue.type || 'Optimization'}
                          </span>
                          <span className="text-sm font-mono text-slate-700 font-semibold">
                            {issue.methodName || issue.method} • Line {issue.lineNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 font-semibold">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`font-semibold ${colors.text} text-lg mb-3`}>{issue.message}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Zap className="w-4 h-4" />
                        <span>Click to view optimization details</span>
                      </div>
                    </button>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-current border-opacity-20 p-5 bg-white bg-opacity-50">
                        <div className="space-y-4">
                          {/* Impact Analysis */}
                          <div>
                            <h4 className={`font-semibold ${colors.text} mb-2 flex items-center gap-2`}>
                              <AlertTriangle className="w-4 h-4" />
                              Performance Impact
                            </h4>
                            <p className="text-slate-700 text-sm leading-relaxed">
                              {issue.energyImpact || "This optimization opportunity could significantly improve performance and reduce energy consumption."}
                            </p>
                          </div>
                          
                          {/* Recommendation */}
                          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Recommended Optimization
                            </h4>
                            <p className="text-yellow-800 text-sm font-medium">
                              {issue.suggestion || "Consider algorithmic improvements and data structure optimization."}
                            </p>
                            {(issue.complexity || issue.optimizedComplexity) && (
                              <div className="mt-2 flex items-center gap-4">
                                {issue.complexity && (
                                  <div>
                                    <span className="text-xs text-yellow-700">Current: </span>
                                    <code className="text-sm font-bold text-red-600">{issue.complexity}</code>
                                  </div>
                                )}
                                {issue.optimizedComplexity && (
                                  <div>
                                    <span className="text-xs text-yellow-700">Optimized: </span>
                                    <code className="text-sm font-bold text-green-600">{issue.optimizedComplexity}</code>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Energy Impact */}
                          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Expected Improvement
                            </h4>
                            <p className="text-green-800 text-sm">
                              Implementing this optimization could reduce CPU cycles by 30-50% and 
                              decrease energy consumption proportional to usage frequency.
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Cpu className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-700">Reduces computational overhead</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border-2 border-slate-200 mb-8">
            <Zap className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Great Job!</h3>
            <p className="text-slate-600">No optimization issues found in this file.</p>
            <p className="text-slate-500 text-sm mt-1">Your code is already well-optimized.</p>
          </div>
        )}

        {/* Recommendations Summary */}
        <div className="mt-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Key Optimization Strategies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Replace Nested Loops</h4>
              <p className="text-sm text-yellow-100">Use HashMap/Set to eliminate O(n²) nested loops</p>
            </div>
            <div className="bg-yellow-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Optimize Linear Scans</h4>
              <p className="text-sm text-yellow-100">Hash-based data structures for O(1) lookups</p>
            </div>
            <div className="bg-yellow-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Reduce Loop Overhead</h4>
              <p className="text-sm text-yellow-100">Extract heavy operations and implement caching</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-200">Potential Energy Savings</p>
                <p className="text-lg font-bold">Up to {aggregatedMetrics?.estimatedSavings || 0}% CPU reduction</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-yellow-200">Files Analyzed</p>
                <p className="text-lg font-bold">{files.length} of {files.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}