import express from 'express';
import {
  getComplianceAnalysisData,
  getSingleFileComplianceAnalysis,
  getAvailableComplianceDataFiles,
  getComplianceAnalysisSummary,
  searchComplianceAnalysis,
  getRawComplianceFileContent,
  getComplianceStandards
} from '../controllers/complianceController.js';

const router = express.Router();

// Get compliance analysis for multiple files (used by frontend)
router.get('/', getComplianceAnalysisData);

// Get list of available compliance files
router.get('/files', getAvailableComplianceDataFiles);

// Get analysis for a single file
router.get('/file/:fileId', getSingleFileComplianceAnalysis);

// Get compliance analysis summary
router.get('/summary', getComplianceAnalysisSummary);

// Search for compliance files/content
router.get('/search', searchComplianceAnalysis);

// Get raw compliance file content
router.get('/raw/:fileId', getRawComplianceFileContent);

// Get compliance standards/rules
router.get('/standards', getComplianceStandards);

export default router;