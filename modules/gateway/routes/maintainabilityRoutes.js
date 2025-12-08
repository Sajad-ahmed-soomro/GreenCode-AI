import express from 'express';
import {
  getMaintainabilityAnalysisData,
  getSingleFileMaintainabilityAnalysis,
  getAvailableMaintainabilityDataFiles,
  getMaintainabilityAnalysisSummary,
  searchMaintainabilityAnalysis,
  getRawMaintainabilityFileContent,
  getMaintainabilityMetricsInfo
} from '../controllers/maintainabilityController.js';

const router = express.Router();

// Get maintainability analysis for multiple files (used by frontend)
router.get('/', getMaintainabilityAnalysisData);

// Get list of available maintainability files
router.get('/files', getAvailableMaintainabilityDataFiles);

// Get analysis for a single file
router.get('/file/:fileId', getSingleFileMaintainabilityAnalysis);

// Get maintainability analysis summary
router.get('/summary', getMaintainabilityAnalysisSummary);

// Search for maintainability files/content
router.get('/search', searchMaintainabilityAnalysis);

// Get raw maintainability file content
router.get('/raw/:fileId', getRawMaintainabilityFileContent);

// Get maintainability metrics explanation
router.get('/metrics-info', getMaintainabilityMetricsInfo);

export default router;