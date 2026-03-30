// routes/unifiedRoutes.js - UPDATED
import express from 'express';
import unifiedController from '../controllers/unifiedController.js';

const router = express.Router();

// Unified report
router.get('/report', unifiedController.getUnifiedReport);

// File endpoints
router.get('/files', unifiedController.getFiles);
router.get('/files/:fileName', unifiedController.getFile);

// Analyzer info
router.get('/analyzers', unifiedController.getAnalyzers);

export default router;