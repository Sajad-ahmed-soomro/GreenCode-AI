import {
  getAllOptimizationFilesResponse,
  getOptimizationAnalysis,
  getSingleFileOptimizationAnalysis,
  getOptimizationSummary
} from '../services/optimizationService.js';

// Get optimization analysis for multiple files - FRONTEND EXPECTS: /api/optimization?files=id1,id2
export const getOptimizationAnalysisData = async (req, res) => {
  try {
    const { files } = req.query;
    const fileArray = files ? files.split(',') : [];
    
    const analyses = getOptimizationAnalysis(fileArray);
    const aggregated = calculateAggregatedMetrics(analyses);
    
    // Transform to match frontend expectations
    const response = {
      success: true,
      files: analyses.map(analysis => ({
        id: analysis.id,
        name: analysis.name,
        path: analysis.path,
        folder: analysis.folder,
        analysis: analysis.analysis
      })),
      aggregated: aggregated,
      count: analyses.length,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in getOptimizationAnalysisData:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Calculate aggregated metrics for frontend
const calculateAggregatedMetrics = (analyses) => {
  const totalIssues = analyses.reduce((sum, file) => {
    return sum + (file.analysis.summary?.totalIssues || 0);
  }, 0);
  
  const totalCriticalIssues = analyses.reduce((sum, file) => {
    return sum + (file.analysis.summary?.criticalIssues || 0);
  }, 0);
  
  const severityBreakdown = analyses.reduce((acc, file) => {
    const breakdown = file.analysis.summary?.severityBreakdown || {};
    Object.entries(breakdown).forEach(([severity, count]) => {
      acc[severity] = (acc[severity] || 0) + count;
    });
    return acc;
  }, { high: 0, medium: 0, low: 0 });
  
  const issueTypes = {};
  analyses.forEach(file => {
    file.analysis.results?.forEach(result => {
      const type = result.issueType || 'GeneralOptimization';
      issueTypes[type] = (issueTypes[type] || 0) + 1;
    });
  });
  
  const mostCommonIssue = Object.entries(issueTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  
  const performanceScore = calculatePerformanceScore(totalIssues, totalCriticalIssues, analyses.length);
  const estimatedSavings = Math.min(95, (totalCriticalIssues * 70) + ((totalIssues - totalCriticalIssues) * 40));
  
  return {
    totalFiles: analyses.length,
    totalIssues,
    totalCriticalIssues,
    avgIssuesPerFile: analyses.length > 0 ? (totalIssues / analyses.length).toFixed(2) : 0,
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

// Get list of available optimization files - FRONTEND EXPECTS: /api/optimization/files
export const getAvailableOptimizationDataFiles = async (req, res) => {
  try {
    const result = getAllOptimizationFilesResponse();
    res.json(result);
  } catch (error) {
    console.error('Error in getAvailableOptimizationDataFiles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get analysis for a single file - FRONTEND EXPECTS: /api/optimization/file/:fileId
export const getSingleFileOptimizationAnalysisController = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const result = getSingleFileOptimizationAnalysis(fileId);
    
    if (result) {
      res.json({
        success: true,
        file: {
          id: result.id,
          name: result.name,
          path: result.path,
          folder: result.folder,
          analysis: result.analysis
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Optimization analysis not found',
        fileId
      });
    }
  } catch (error) {
    console.error('Error in getSingleFileOptimizationAnalysis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get optimization summary - FRONTEND EXPECTS: /api/optimization/summary
export const getOptimizationAnalysisSummary = async (req, res) => {
  try {
    const result = getOptimizationSummary();
    res.json(result);
  } catch (error) {
    console.error('Error in getOptimizationAnalysisSummary:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Search optimization files - FRONTEND EXPECTS: /api/optimization/search
export const searchOptimizationAnalysis = async (req, res) => {
  try {
    const { query, severity, issueType } = req.query;
    
    const allFiles = getAllOptimizationFilesResponse();
    
    let filteredFiles = allFiles.files || [];
    
    if (query) {
      filteredFiles = filteredFiles.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase()) ||
        file.fileName.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      files: filteredFiles,
      count: filteredFiles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in searchOptimizationAnalysis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};