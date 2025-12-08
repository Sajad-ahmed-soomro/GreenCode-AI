// File: app/multi-agent-review/data-structure/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle,
  Layers, ArrowLeft, AlertCircle, TrendingUp, FileText, 
  BarChart, Cpu, Zap, Database, Code, Filter 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DataStructureAgentPage() {
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
    const response = await fetch(`http://localhost:5400/api/data-structure?files=${fileIds.join(',')}`);
    const data = await response.json();
    
    if (data.success && data.files && data.files.length > 0) {
      // The backend now returns enriched data structure
      setFiles(data.files);
      setSelectedFileId(data.files[0].id);
      setAggregatedMetrics(data.aggregated);
      
      // Store available folders if needed
      if (data.availableFolders) {
        // You can use this for filtering if you add folder filter UI
      }
    } else {
      // If no data, show available files from backend if provided
      if (data.availableFiles) {
        console.log('Available files from backend:', data.availableFiles);
      }
      loadMockData(fileIds);
    }
  } catch (error) {
    console.error('Error loading data structure analysis:', error);
    loadMockData(fileIds);
  } finally {
    setIsLoading(false);
  }
};

  // const loadMockData = (fileIds) => {
  //   const mockData = {
  //     files: [
  //       {
  //         id: "ChessGameEngine",
  //         name: "ChessGameEngine.java",
  //         path: "/dataStructures/ChessGameEngine.json",
  //         analysis: {
  //           fileName: "ChessGameEngine.java",
  //           suggestions: [
  //             {
  //               issueType: "ManualArraySearch",
  //               pattern: "Manual arr[i] search inside loop",
  //               recommendedDataStructure: "Use Set or Map depending on logic",
  //               why: "Manual scanning inside loop is slow (O(n)). Hashed lookup is O(1).",
  //               energyImpact: "Reduces unnecessary CPU usage and energy waste.",
  //               lineNumber: 24
  //             },
  //             {
  //               issueType: "NestedLoops",
  //               pattern: "Nested loops detected",
  //               recommendedDataStructure: "Use HashMap/HashSet for matching instead of O(n²) nested scans.",
  //               why: "Nested loops cause O(n²) complexity. Converting one list to a Map reduces time to O(n).",
  //               energyImpact: "Massive CPU & energy reduction (up to 95%).",
  //               lineNumber: 115
  //             }
  //           ],
  //           totalIssues: 2,
  //           criticalIssues: 1,
  //           issueTypes: {
  //             ManualArraySearch: 1,
  //             NestedLoops: 1
  //           }
  //         }
  //       }
  //     ],
  //     aggregated: {
  //       totalIssues: 2,
  //       criticalIssues: 1,
  //       avgIssuesPerFile: "1.00",
  //       issueTypes: { ManualArraySearch: 1, NestedLoops: 1 },
  //       totalFiles: 1,
  //       mostCommonIssue: "ManualArraySearch"
  //     }
  //   };
    
  //   setFiles(mockData.files.filter(file => fileIds.includes(file.id)));
  //   setSelectedFileId(mockData.files[0]?.id || null);
  //   setAggregatedMetrics(mockData.aggregated);
  // };

  const getIssueTypeColor = (issueType) => {
    const colors = {
      'ManualArraySearch': 'bg-red-100 text-red-800 border-red-300',
      'NestedLoops': 'bg-orange-100 text-orange-800 border-orange-300',
      'ListAsDictionary': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'default': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[issueType] || colors.default;
  };

  const getSeverityColor = (issueType) => {
    const isCritical = issueType === 'NestedLoops' || issueType === 'ManualArraySearch';
    return isCritical 
      ? 'bg-red-100 text-red-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation.includes('Map')) return 'bg-purple-100 text-purple-800';
    if (recommendation.includes('Set')) return 'bg-green-100 text-green-800';
    if (recommendation.includes('Tree')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const selectedFile = files.find(f => f.id === selectedFileId);
  const analysisData = selectedFile?.analysis;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-800 font-semibold text-lg">Loading Data Structure Analysis...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Files Selected</h2>
          <button
            onClick={() => router.push('/multi-agent-review')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mt-4"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/multi-agent-review')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Multi-Agent Review</span>
          </button>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl">
                <Layers className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800">Data Structure Advisor</h1>
                <p className="text-slate-600 mt-1">
                  Analyzing {files.length} file{files.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-600">Total Issues Found</p>
              <p className="text-2xl font-bold text-blue-600">
                {aggregatedMetrics?.totalIssues || 0}
              </p>
            </div>
          </div>

          {/* File Navigation Tabs */}
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    {file.name}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isSelected
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {file.analysis?.totalIssues || 0} issues
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-slate-800">{analysisData?.totalIssues || 0}</p>
                <p className="text-xs text-slate-500 mt-1">In this file</p>
              </div>
              <AlertCircle className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Critical Issues</p>
                <p className="text-3xl font-bold text-red-600">{analysisData?.criticalIssues || 0}</p>
                <p className="text-xs text-slate-500 mt-1">High priority fixes</p>
              </div>
              <Zap className="w-12 h-12 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Issue Types</p>
                <p className="text-3xl font-bold text-slate-800">
                  {Object.keys(analysisData?.issueTypes || {}).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Different patterns</p>
              </div>
              <Filter className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Energy Impact</p>
                <p className="text-3xl font-bold text-green-600">High</p>
                <p className="text-xs text-slate-500 mt-1">Potential savings</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Project Aggregated Metrics */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart className="w-6 h-6 text-blue-600" />
            Project-Wide Analysis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-800">Total Issues</p>
              <p className="text-2xl font-bold text-blue-800">{aggregatedMetrics?.totalIssues || 0}</p>
              <p className="text-xs text-blue-600">Across all files</p>
            </div>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800">Critical Issues</p>
              <p className="text-2xl font-bold text-red-800">{aggregatedMetrics?.criticalIssues || 0}</p>
              <p className="text-xs text-red-600">Require immediate attention</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-800">Avg. Issues/File</p>
              <p className="text-2xl font-bold text-purple-800">{aggregatedMetrics?.avgIssuesPerFile || '0'}</p>
              <p className="text-xs text-purple-600">Average per file</p>
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

        {/* Issue Analysis Section */}
        {analysisData?.suggestions && analysisData.suggestions.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600" />
              Data Structure Issues ({analysisData.suggestions.length} found)
            </h2>
            
            <div className="space-y-4">
              {analysisData.suggestions.map((issue, idx) => {
                const isExpanded = selectedIssue === idx;
                const issueTypeColor = getIssueTypeColor(issue.issueType);
                const severityColor = getSeverityColor(issue.issueType);
                const recommendationColor = getRecommendationColor(issue.recommendedDataStructure);
                
                return (
                  <div
                    key={idx}
                    className="border-2 border-slate-200 rounded-xl overflow-hidden transition-all hover:border-blue-300"
                  >
                    {/* Issue Header */}
                    <button
                      onClick={() => setSelectedIssue(isExpanded ? null : idx)}
                      className="w-full p-5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`${severityColor} text-xs font-bold uppercase px-3 py-1 rounded-full`}>
                            {issue.issueType === 'NestedLoops' || issue.issueType === 'ManualArraySearch' 
                              ? 'CRITICAL' 
                              : 'WARNING'}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              Line {issue.lineNumber}: {issue.pattern}
                            </p>
                            <p className="text-xs text-slate-500">{issue.issueType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${issueTypeColor}`}>
                            {issue.issueType}
                          </span>
                          <span className="text-xs text-slate-600 font-semibold">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Quick Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                        <div className={`${recommendationColor} border rounded p-2 text-center`}>
                          <p className="text-xs font-semibold">Recommended</p>
                          <p className="text-sm font-bold truncate">{issue.recommendedDataStructure}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-300 rounded p-2 text-center">
                          <p className="text-xs font-semibold text-gray-700">Impact</p>
                          <p className="text-sm font-bold text-gray-800">High</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-300 rounded p-2 text-center">
                          <p className="text-xs font-semibold text-amber-700">Energy Savings</p>
                          <p className="text-sm font-bold text-amber-800">Significant</p>
                        </div>
                      </div>
                    </button>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-slate-200 p-5 bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Issue Details */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Issue Details
                            </h4>
                            <div className="space-y-4">
                              <div className="bg-white border border-slate-300 rounded-lg p-4">
                                <p className="font-semibold text-slate-700 mb-2">Problem Description</p>
                                <p className="text-sm text-slate-600">{issue.why}</p>
                              </div>
                              
                              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                                <p className="font-semibold text-yellow-700 mb-2">Energy Impact</p>
                                <p className="text-sm text-yellow-800">{issue.energyImpact}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Cpu className="w-4 h-4 text-yellow-600" />
                                  <span className="text-xs text-yellow-700">Reduces CPU usage and improves efficiency</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Recommendations */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Optimization Recommendations
                            </h4>
                            <div className="space-y-4">
                              <div className={`${recommendationColor} border rounded-lg p-4`}>
                                <p className="font-semibold mb-2">Recommended Data Structure</p>
                                <p className="text-sm mb-3">{issue.recommendedDataStructure}</p>
                                <div className="flex items-center gap-2">
                                  <Database className="w-4 h-4" />
                                  <span className="text-xs">Provides O(1) or O(log n) operations</span>
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                                <p className="font-semibold text-blue-700 mb-2">Expected Improvements</p>
                                <ul className="space-y-2 text-sm text-blue-800">
                                  <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Reduced time complexity from O(n²) to O(n)</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Lower memory overhead with proper data structures</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Improved code readability and maintainability</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>Better cache locality and performance</span>
                                  </li>
                                </ul>
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
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border-2 border-slate-200 mb-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Issues Found!</h3>
            <p className="text-slate-600">Great job! No data structure issues detected in this file.</p>
          </div>
        )}

        {/* Recommendations Summary */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Key Recommendations Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Replace Arrays with Maps</h4>
              <p className="text-sm text-blue-100">Use HashMap for key-value lookups instead of manual searching</p>
            </div>
            <div className="bg-blue-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Use Sets for Membership</h4>
              <p className="text-sm text-blue-100">HashSet provides O(1) contains() vs O(n) array scanning</p>
            </div>
            <div className="bg-blue-400/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Optimize Nested Loops</h4>
              <p className="text-sm text-blue-100">Convert O(n²) nested loops to O(n) using proper data structures</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Potential Energy Savings</p>
                <p className="text-lg font-bold">Up to 95% CPU reduction</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Files Affected</p>
                <p className="text-lg font-bold">{files.length} of {files.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}