import {
  getAnalysis,
  getFileAnalysis,
  calculateAggregatedMetrics,
  getAvailableFiles,
  searchFiles,
  getAllDataStructuresFiles
} from '../services/dataStructureServices.js';

// Get data structure analysis for multiple files
export const getDataStructureAnalysis = async (req, res) => {
  try {
    const { files, folder } = req.query;
    const fileIds = files ? files.split(',') : [];
    
    // Get analysis data
    let analyses = getAnalysis(fileIds);
    
    // Filter by folder if specified
    if (folder) {
      analyses = analyses.filter(file => file.folder === folder);
    }
    
    if (analyses.length === 0) {
      // Try to get available files first
      const availableFiles = getAvailableFiles();
      const availableFileIds = availableFiles.map(f => f.id);
      
      return res.status(404).json({
        success: false,
        message: 'No analysis data found',
        availableFiles: availableFileIds,
        suggestion: `Available files: ${availableFileIds.join(', ')}`
      });
    }
    
    // Calculate aggregated metrics
    const aggregatedMetrics = calculateAggregatedMetrics(analyses);
    
    // Respond with data
    res.json({
      success: true,
      files: analyses,
      aggregated: aggregatedMetrics,
      totalFiles: analyses.length,
      timestamp: new Date().toISOString(),
      message: `Successfully analyzed ${analyses.length} file(s)`,
      availableFolders: [...new Set(analyses.map(f => f.folder))]
    });
    
  } catch (error) {
    console.error('Error in getDataStructureAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load data structure analysis',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get analysis for a single file
export const getSingleFileAnalysis = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }
    
    const fileAnalysis = getFileAnalysis(fileId);
    
    if (!fileAnalysis) {
      // Provide available files for reference
      const availableFiles = getAvailableFiles();
      const availableFileIds = availableFiles.map(f => f.id);
      
      return res.status(404).json({
        success: false,
        message: `File analysis not found for: ${fileId}`,
        availableFiles: availableFileIds,
        suggestion: `Try one of: ${availableFileIds.join(', ')}`
      });
    }
    
    res.json({
      success: true,
      file: fileAnalysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getSingleFileAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file analysis',
      error: error.message
    });
  }
};

// Get list of all available files
export const getAvailableDataFiles = async (req, res) => {
  try {
    const files = getAvailableFiles();
    
    res.json({
      success: true,
      files: files,
      count: files.length,
      timestamp: new Date().toISOString(),
      folders: [...new Set(files.map(f => f.folder))]
    });
    
  } catch (error) {
    console.error('Error in getAvailableDataFiles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available files',
      error: error.message
    });
  }
};

// Get summary/statistics
export const getAnalysisSummary = async (req, res) => {
  try {
    const analyses = getAnalysis();
    const aggregatedMetrics = calculateAggregatedMetrics(analyses);
    
    res.json({
      success: true,
      summary: aggregatedMetrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getAnalysisSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analysis summary',
      error: error.message
    });
  }
};

// Search for files
export const searchAnalysis = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    const results = searchFiles(q.trim());
    
    res.json({
      success: true,
      query: q,
      results: results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in searchAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search analysis',
      error: error.message
    });
  }
};

// Get raw file content
export const getRawFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }
    
    const availableFiles = getAvailableFiles();
    const fileInfo = availableFiles.find(f => f.id === fileId);
    
    if (!fileInfo || !fs.existsSync(fileInfo.path)) {
      return res.status(404).json({
        success: false,
        message: `File not found: ${fileId}`
      });
    }
    
    const fileContent = fs.readFileSync(fileInfo.path, 'utf8');
    
    res.json({
      success: true,
      file: {
        id: fileId,
        name: fileInfo.name,
        content: JSON.parse(fileContent),
        raw: fileContent
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getRawFileContent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file content',
      error: error.message
    });
  }
};

