import express from 'express';
import {
  energyReportController,
  getClassReportController,
  getSummaryController,
  getStatisticsController,
  getTopConsumersController,
  searchMethodsController,
  compareClassesController,
  getMethodController
} from '../controllers/energyController.js';

const router = express.Router();

router.get('/reports', energyReportController);
router.get('/summary', getSummaryController);
router.get('/statistics', getStatisticsController);
router.get('/top-consumers', getTopConsumersController);
router.get('/search', searchMethodsController);
router.get('/compare', compareClassesController);

// Class-specific routes
router.get('/class/:className', getClassReportController);
router.get('/class/:className/method/:methodName', getMethodController);

export default router;
