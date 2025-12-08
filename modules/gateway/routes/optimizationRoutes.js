import express from 'express';
import {
  getOptimizationAnalysisData,
  getAvailableOptimizationDataFiles,
  getSingleFileOptimizationAnalysisController,
  getOptimizationAnalysisSummary,
  searchOptimizationAnalysis
} from '../controllers/optimizationController.js';

const router = express.Router();

// Get optimization analysis for multiple files
router.get('/', getOptimizationAnalysisData);

// Get list of available optimization files
router.get('/files', getAvailableOptimizationDataFiles);

// Get analysis for a single file
router.get('/file/:fileId', getSingleFileOptimizationAnalysisController);

// Get optimization analysis summary
router.get('/summary', getOptimizationAnalysisSummary);

// Search for optimization files/content
router.get('/search', searchOptimizationAnalysis);

export default router;