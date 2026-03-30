import express from 'express';
import {
  getDataStructureAnalysis,
  getSingleFileAnalysis,
  getAvailableDataFiles,
  getAnalysisSummary,
  searchAnalysis,
  getRawFileContent
} from '../controllers/dataStructuresController.js';

const router = express.Router();

// Get analysis for multiple files (used by frontend)
router.get('/', getDataStructureAnalysis);

// Get list of available data files
router.get('/files', getAvailableDataFiles);

// Get analysis for a single file
router.get('/file/:fileId', getSingleFileAnalysis);

// Get analysis summary
router.get('/summary', getAnalysisSummary);

// Search for files/content
router.get('/search', searchAnalysis);

// Get raw file content
router.get('/raw/:fileId', getRawFileContent);

export default router;