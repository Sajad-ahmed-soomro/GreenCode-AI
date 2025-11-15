
import energyService from '../services/energyReportService.js'
const energyReportController = (req, res) => {
  try {
    const reports = energyService.getAllReports();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getClassReportController = (req, res) => {
  try {
    const { className } = req.params;
    const report = energyService.getClassReport(className);
    res.status(200).json(report);
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

const getSummaryController = (req, res) => {
  try {
    const summary = energyService.getSummaryReport();
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getMethodController = (req, res) => {
  try {
    const { className, methodName } = req.params;
    const method = energyService.getMethodReport(className, methodName);
    res.status(200).json(method);
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

const getStatisticsController = (req, res) => {
  try {
    const stats = energyService.getEnergyStatistics();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getTopConsumersController = (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topConsumers = energyService.getTopEnergyConsumers(limit);
    res.status(200).json(topConsumers);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const searchMethodsController = (req, res) => {
  try {
    const criteria = {
      minEnergy: parseFloat(req.query.minEnergy),
      maxEnergy: parseFloat(req.query.maxEnergy),
      hasLoops: req.query.hasLoops === 'true',
      hasRecursion: req.query.hasRecursion === 'true',
      className: req.query.className,
      methodName: req.query.methodName,
      minLoops: parseInt(req.query.minLoops),
      minNesting: parseInt(req.query.minNesting)
    };

    // Remove undefined values
    Object.keys(criteria).forEach(key => 
      criteria[key] === undefined && delete criteria[key]
    );

    const results = energyService.searchMethods(criteria);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const compareClassesController = (req, res) => {
  try {
    const { class1, class2 } = req.query;
    
    if (!class1 || !class2) {
      return res.status(400).json({
        success: false,
        error: 'Both class1 and class2 query parameters are required'
      });
    }

    const comparison = energyService.getEnergyComparison(class1, class2);
    res.status(200).json(comparison);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export{
  energyReportController,
  getClassReportController,
  getSummaryController,
  getMethodController,
  getStatisticsController,
  getTopConsumersController,
  searchMethodsController,
  compareClassesController
};


