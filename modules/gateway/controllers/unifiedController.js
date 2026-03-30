// controllers/unifiedController.js - SIMPLIFIED
import path from 'path';
import { fileURLToPath } from 'url';
import { DataAggregator } from './dataAggregator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '../output');
console.log(`📁 Output path: ${outputPath}`);
const aggregator = new DataAggregator(outputPath);

export const getUnifiedReport = async (req, res) => {
  try {
    console.log('📊 Generating unified report...');
    const data = await aggregator.loadAllData();
    
    res.json({
      success: true,
      data: {
        summary: data.summary,
        files: data.files,  // Raw merged data by file
        issues: data.issues,
        timestamp: data.timestamp
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const data = await aggregator.loadAllData();
    res.json({ 
      success: true, 
      files: data.files,
      count: Object.keys(data.files).length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    const data = await aggregator.loadAllData();
    
    // Try to find the file with or without .java extension
    let fileData = data.files[fileName];
    if (!fileData && !fileName.endsWith('.java')) {
      fileData = data.files[`${fileName}.java`];
    }
    
    if (!fileData) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }
    
    res.json({
      success: true,
      file: fileData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAnalyzers = async (req, res) => {
  try {
    const data = await aggregator.loadAllData();
    res.json({ 
      success: true, 
      analyzers: data.summary.byAnalyzer 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  getUnifiedReport,
  getFiles,
  getFile,
  getAnalyzers
};