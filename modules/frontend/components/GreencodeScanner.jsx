"use client";
import React, { useState, useEffect } from "react";
import { Leaf, FileCode, Shield, Wrench, Zap, TrendingDown, CheckCircle, AlertCircle, AlertTriangle, Activity } from "lucide-react";
import zipAndUpload from "../lib/zipAndUpload";

export default function GreencodeScannerUI() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState({
    reportFolder: "",
    reports: [],
    cfgs: []
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [apiBase, setApiBase] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setApiBase(process.env.NEXT_PUBLIC_ANALYZER_URL || "http://localhost:5400");
  }, []);

  async function handleScan() {
    if (!files.length) return setError("Please select a project folder first.");
    setError(null);
    setStatus("uploading");
    try {
      const backendResults = await zipAndUpload(files, apiBase ? `${apiBase}/scan` : undefined);
      const normalized = {
        reportFolder: backendResults.reportFolder || "",
        reports: backendResults.reports || [],
        cfgs: backendResults.cfgs || [],
      };
      setResults(normalized);
      setStatus("done");
      setActiveTab("overview");
    } catch (err) {
      console.error("Scan error:", err);
      setError(err.message || "Upload error");
      setStatus("idle");
    }
  }

  function handleChooseFolder(e) {
    const chosen = Array.from(e.target.files || []);
    setFiles(chosen);
  }

  function calculateGreenImpact(reports) {
    const totalIssues = reports.reduce((sum, r) => {
      const summary = r.summary || {};
      return sum + (summary.total || 0);
    }, 0);
    const criticalIssues = reports.reduce((sum, r) => {
      const summary = r.summary || {};
      return sum + (summary.critical || 0);
    }, 0);
    const energySavings = totalIssues * 0.05;
    const carbonReduction = totalIssues * 0.02;
    return { energySavings: energySavings.toFixed(2), carbonReduction: carbonReduction.toFixed(2), totalIssues, criticalIssues };
  }

  const greenImpact = status === "done" ? calculateGreenImpact(results.reports) : null;

  function getSeverityColor(severity) {
    const colors = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[severity] || "bg-gray-100 text-gray-800 border-gray-200";
  }

  function getSeverityIcon(severity) {
    if (severity === "critical" || severity === "high") return <AlertCircle className="w-4 h-4" />;
    if (severity === "medium") return <AlertTriangle className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  }

  function renderReportCard(report, index) {
    const summary = report.summary || {};
    const details = report.details || [];
    
    return (
      <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Report {index + 1}</h3>
            <div className="flex gap-2">
              {summary.critical > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                  {summary.critical} Critical
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total || 0}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm text-red-600 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-700">{summary.critical || 0}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-sm text-orange-600 mb-1">High</p>
              <p className="text-2xl font-bold text-orange-700">{summary.high || 0}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-sm text-yellow-600 mb-1">Medium</p>
              <p className="text-2xl font-bold text-yellow-700">{summary.medium || 0}</p>
            </div>
          </div>

          {/* Issues List */}
          {details.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-emerald-600" />
                Issues Detected
              </h4>
              {details.map((issue, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(issue.severity)}`}>
                        {getSeverityIcon(issue.severity)}
                        <span className="ml-1 capitalize">{issue.severity}</span>
                      </span>
                      <span className="text-xs font-mono text-gray-500">{issue.ruleId}</span>
                    </div>
                  </div>
                  <p className="text-gray-800 mb-2">{issue.description}</p>
                  {issue.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                      <FileCode className="w-4 h-4" />
                      <span className="font-mono">{issue.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {details.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
              <p>No issues detected in this report</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Greencode Scanner
                </h1>
                <p className="text-sm text-gray-600">Sustainable Code Analysis Platform</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-600" />
                Project Selection
              </h2>
              
              <label>
                <input
                  type="file"
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleChooseFolder}
                  className="hidden"
                />
                <div
                  className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  onClick={() => document.querySelector('input[type="file"]').click()}
                >
                  <FileCode className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-700 font-medium">
                    {files.length ? `${files.length} files selected` : "Click to choose folder"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Select your project directory</p>
                </div>
              </label>

              <button
                onClick={handleScan}
                disabled={status === "uploading" || !files.length}
                className={`w-full mt-6 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all ${
                  status === "uploading" || !files.length
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                }`}
              >
                {status === "uploading" ? "Scanning..." : "Start Scan"}
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 text-sm">Files Selected:</span>
                  <span className="font-semibold text-gray-800">{files.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-sm">Status:</span>
                  <span className={`font-semibold capitalize ${
                    status === "done" ? "text-emerald-600" : 
                    status === "uploading" ? "text-amber-600" : "text-gray-800"
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>

            {/* Green Benefits Card */}
            {greenImpact && (
              <div className="mt-6 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 shadow-lg text-white">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Environmental Impact
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Energy Savings</span>
                    </div>
                    <p className="text-2xl font-bold">{greenImpact.energySavings} kWh</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-medium">Carbon Reduction</span>
                    </div>
                    <p className="text-2xl font-bold">{greenImpact.carbonReduction} kg CO₂</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              {status === "done" && (
                <div className="border-b border-gray-200 bg-gray-50">
                  <nav className="flex">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                        activeTab === "overview"
                          ? "text-emerald-600 bg-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Activity className="w-4 h-4 inline mr-2" />
                      Overview
                      {activeTab === "overview" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("reports")}
                      className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                        activeTab === "reports"
                          ? "text-emerald-600 bg-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Shield className="w-4 h-4 inline mr-2" />
                      Detailed Reports
                      {activeTab === "reports" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("impact")}
                      className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                        activeTab === "impact"
                          ? "text-emerald-600 bg-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Leaf className="w-4 h-4 inline mr-2" />
                      Green Impact
                      {activeTab === "impact" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
                      )}
                    </button>
                  </nav>
                </div>
              )}

              <div className="p-6">
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {status === "uploading" && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mb-4"></div>
                    <p className="text-gray-600">Analyzing your code...</p>
                  </div>
                )}

                {status === "idle" && !error && (
                  <div className="text-center py-12">
                    <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Select a project folder and click "Start Scan" to begin</p>
                  </div>
                )}

                {status === "done" && results && (
                  <div>
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center gap-2 text-blue-700 mb-2">
                              <FileCode className="w-4 h-4" />
                              <span className="text-sm font-medium">Reports</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">{results.reports.length}</p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-center gap-2 text-purple-700 mb-2">
                              <Wrench className="w-4 h-4" />
                              <span className="text-sm font-medium">Total Issues</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-900">{greenImpact?.totalIssues || 0}</p>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                            <div className="flex items-center gap-2 text-red-700 mb-2">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Critical</span>
                            </div>
                            <p className="text-2xl font-bold text-red-900">{greenImpact?.criticalIssues || 0}</p>
                          </div>
                        </div>

                        {/* Quick Summary */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Summary</h3>
                          <div className="space-y-3">
                            {results.reports.map((report, i) => {
                              const summary = report.summary || {};
                              return (
                                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                  <span className="font-medium text-gray-700">Report {i + 1}</span>
                                  <div className="flex gap-3 text-sm">
                                    <span className="text-gray-600">Total: <strong>{summary.total || 0}</strong></span>
                                    {summary.critical > 0 && (
                                      <span className="text-red-600">Critical: <strong>{summary.critical}</strong></span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === "reports" && (
                      <div className="space-y-6">
                        {results.reports.length > 0 ? (
                          results.reports.map((report, i) => renderReportCard(report, i))
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>No reports available</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Impact Tab */}
                    {activeTab === "impact" && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-emerald-600" />
                            How This Contributes to Green Coding
                          </h3>
                          <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-white rounded-lg border border-emerald-100">
                              <Zap className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-semibold text-gray-800 mb-1">Reduced Energy Consumption</p>
                                <p className="text-sm text-gray-600">Optimized code runs more efficiently, consuming less CPU cycles and reducing server energy usage. Each fixed issue can save approximately 0.05 kWh of energy.</p>
                              </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-white rounded-lg border border-emerald-100">
                              <TrendingDown className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-semibold text-gray-800 mb-1">Lower Carbon Footprint</p>
                                <p className="text-sm text-gray-600">Efficient code requires fewer computing resources, directly reducing CO₂ emissions from data centers. Your improvements can reduce carbon emissions by {greenImpact?.carbonReduction} kg CO₂.</p>
                              </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-white rounded-lg border border-emerald-100">
                              <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-semibold text-gray-800 mb-1">Sustainable Development</p>
                                <p className="text-sm text-gray-600">Maintainable code extends software lifespan, reducing the need for rewrites and associated resource consumption. Better code quality means longer-lasting applications.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {results.reportFolder && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-2">Report Location</h4>
                            <p className="text-sm text-gray-600 font-mono break-all">{results.reportFolder}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}