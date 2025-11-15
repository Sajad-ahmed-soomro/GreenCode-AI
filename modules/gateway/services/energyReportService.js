// =====================================================
// 1. SERVICES - Business Logic Layer (Functional)
// =====================================================

import fs from 'fs';
import path from 'path';
import { getAllEnergyReportFiles } from '../utils/fileReader.js';

const EnergyModulePath = process.env.EnergyModulePath || './output';

// ============ FILE OPERATIONS ============

const readReportFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
};

// ============ METRIC CALCULATIONS ============

const calculateMethodMetrics = (method) => {
  const complexityScore =
    method.nestingDepth * 0.3 + method.loopCount * 0.4 + method.conditionalsCount * 0.3;
  const efficiencyScore = 1 - method.energyScore;
  const riskLevel =
    method.energyScore > 0.7
      ? 'critical'
      : method.energyScore > 0.5
      ? 'high'
      : method.energyScore > 0.3
      ? 'medium'
      : 'low';

  return {
    complexityScore: parseFloat(complexityScore.toFixed(3)),
    efficiencyScore: parseFloat(efficiencyScore.toFixed(3)),
    riskLevel,
    optimizationPotential:
      method.energyScore > 0.5 ? 'high' : method.energyScore > 0.3 ? 'medium' : 'low',
    hasPerformanceIssues: method.loopCount > 3 || method.nestingDepth > 3 || method.recursion,
  };
};

const calculatePercentiles = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;
  return {
    p25: sorted[Math.floor(len * 0.25)],
    p50: sorted[Math.floor(len * 0.5)],
    p75: sorted[Math.floor(len * 0.75)],
    p90: sorted[Math.floor(len * 0.9)],
    p95: sorted[Math.floor(len * 0.95)],
    p99: sorted[Math.floor(len * 0.99)],
  };
};

const enhanceReportData = (data) => {
  const energyScores = data.reports.map((r) => r.energyScore);
  const percentiles = calculatePercentiles(energyScores);

  const enhancedReports = data.reports.map((method) => ({
    ...method,
    metrics: calculateMethodMetrics(method),
  }));

  return {
    ...data,
    percentiles,
    reports: enhancedReports,
    summary: {
      totalEnergy: data.statistics?.totalEnergy || 0,
      avgEnergy: data.statistics?.avgEnergy || 0,
      energyRange: {
        min: Math.min(...energyScores),
        max: Math.max(...energyScores),
      },
    },
  };
};

const calculateInsights = (summaryData) => {
  const { statistics, reports } = summaryData;

  const insights = {
    energyEfficiency:
      statistics.energy?.average < 0.3
        ? 'excellent'
        : statistics.energy?.average < 0.5
        ? 'good'
        : statistics.energy?.average < 0.7
        ? 'moderate'
        : 'poor',
    criticalIssues: statistics.distribution?.highEnergy || 0,
    optimizationOpportunities:
      reports?.filter((r) => r.energyScore > 0.5 || r.loopCount > 3 || r.nestingDepth > 3)
        .length || 0,
    codeQuality: {
      avgComplexity: statistics.complexity?.avgNestingDepth || 0,
      recursiveRatio: statistics.complexity?.methodsWithRecursion / summaryData.totalMethods,
      loopDensity: statistics.complexity?.methodsWithLoops / summaryData.totalMethods,
    },
  };

  return insights;
};

// ============ SERVICE FUNCTIONS ============

// Get all energy reports (recursive scan)
const getAllReports = () => {
  try {
    const reportFiles = getAllEnergyReportFiles(EnergyModulePath);

    const reports = reportFiles.map((filePath) => {
      const data = readReportFile(filePath);
      return {
        fileName: path.basename(filePath),
        className: data.className,
        totalMethods: data.totalMethods,
        generatedAt: data.generatedAt,
        hasBenchmarks: data.hasBenchmarks || false,
        statistics: data.statistics || {},
      };
    });

    return { success: true, count: reports.length, reports };
  } catch (error) {
    throw new Error(`Failed to get all reports: ${error.message}`);
  }
};

// Get report for a specific class
const getClassReport = (className) => {
  try {
    console.log(`🔍 Looking for class report: "${className}"`);
    
    if (!className || className === 'undefined') {
      throw new Error(`Invalid class name: ${className}`);
    }

    const reportFiles = getAllEnergyReportFiles(EnergyModulePath);
    console.log(`📁 Available report files:`, reportFiles.map(f => path.basename(f)));
    
    const filePath = reportFiles.find((f) => f.endsWith(`${className}-energy-report.json`));
    
    if (!filePath) {
      console.log(`❌ No report file found for class: ${className}`);
      throw new Error(`Report not found for class: ${className}`);
    }

    console.log(`✅ Found report file: ${filePath}`);
    const data = readReportFile(filePath);
    return { success: true, data: enhanceReportData(data) };
  } catch (error) {
    console.error(`💥 Error in getClassReport for "${className}":`, error.message);
    throw new Error(`Failed to get class report: ${error.message}`);
  }
};
// Get report for a specific method
const getMethodReport = (className, methodName) => {
  try {
    const classReport = getClassReport(className);
    const method = classReport.data.reports.find((r) => r.methodName === methodName);
    if (!method) throw new Error(`Method not found: ${className}.${methodName}`);
    return { success: true, data: method };
  } catch (error) {
    throw new Error(`Failed to get method report: ${error.message}`);
  }
};

// Get summary report
const getSummaryReport = () => {
  try {
    const summaryPath = path.join(EnergyModulePath, 'summary-energy-report.json');
    if (!fs.existsSync(summaryPath)) throw new Error('Summary report not found');
    const data = readReportFile(summaryPath);
    return { success: true, data: { ...data, insights: calculateInsights(data) } };
  } catch (error) {
    throw new Error(`Failed to get summary report: ${error.message}`);
  }
};

// Energy statistics
const getEnergyStatistics = () => {
  try {
    const allReports = getAllReports();
    const stats = allReports.reports.reduce(
      (acc, report) => ({
        totalClasses: acc.totalClasses + 1,
        totalMethods: acc.totalMethods + (report.totalMethods || 0),
        totalEnergy: acc.totalEnergy + (report.statistics?.totalEnergy || 0),
        totalLoops: acc.totalLoops + (report.statistics?.methodsWithLoops || 0),
        recursiveMethods: acc.recursiveMethods + (report.statistics?.methodsWithRecursion || 0),
        highEnergyMethods: acc.highEnergyMethods + (report.statistics?.highEnergyMethods || 0),
      }),
      {
        totalClasses: 0,
        totalMethods: 0,
        totalEnergy: 0,
        totalLoops: 0,
        recursiveMethods: 0,
        highEnergyMethods: 0,
      }
    );

    stats.avgEnergyPerClass = stats.totalEnergy / stats.totalClasses;
    stats.avgLoopsPerClass = stats.totalLoops / stats.totalClasses;
    stats.recursiveRatio = stats.recursiveMethods / stats.totalMethods;

    return { success: true, statistics: stats };
  } catch (error) {
    throw new Error(`Failed to calculate statistics: ${error.message}`);
  }
};

// Top energy-consuming methods
const getTopEnergyConsumers = (limit = 10) => {
  try {
    const allReports = getAllReports();

    const allMethods = allReports.reports.flatMap((report) => {
      try {
        const classReport = getClassReport(report.className);
        return classReport.data.reports.map((method) => ({
          ...method,
          className: report.className,
        }));
      } catch (err) {
        console.warn(`Skipping ${report.className}: ${err.message}`);
        return [];
      }
    });

    const topMethods = allMethods
      .sort((a, b) => b.energyScore - a.energyScore)
      .slice(0, limit)
      .map((method) => ({ ...method, metrics: calculateMethodMetrics(method) }));

    return { success: true, count: topMethods.length, methods: topMethods };
  } catch (error) {
    throw new Error(`Failed to get top consumers: ${error.message}`);
  }
};

// Search methods by criteria
const searchMethods = (criteria) => {
  try {
    const allReports = getAllReports();
    const allMethods = allReports.reports.flatMap((report) => {
      try {
        const classReport = getClassReport(report.className);
        return classReport.data.reports.map((method) => ({
          ...method,
          className: report.className,
        }));
      } catch {
        return [];
      }
    });

    const filtered = allMethods.filter((m) => {
      if (criteria.minEnergy !== undefined && m.energyScore < criteria.minEnergy) return false;
      if (criteria.maxEnergy !== undefined && m.energyScore > criteria.maxEnergy) return false;
      if (criteria.hasLoops !== undefined && (criteria.hasLoops ? m.loopCount === 0 : m.loopCount > 0))
        return false;
      if (criteria.hasRecursion !== undefined && m.recursion !== criteria.hasRecursion) return false;
      if (criteria.className && !m.className.toLowerCase().includes(criteria.className.toLowerCase()))
        return false;
      if (criteria.methodName && !m.methodName.toLowerCase().includes(criteria.methodName.toLowerCase()))
        return false;
      if (criteria.minLoops !== undefined && m.loopCount < criteria.minLoops) return false;
      if (criteria.minNesting !== undefined && m.nestingDepth < criteria.minNesting) return false;
      return true;
    });

    return {
      success: true,
      count: filtered.length,
      totalScanned: allMethods.length,
      methods: filtered.map((m) => ({ ...m, metrics: calculateMethodMetrics(m) })),
    };
  } catch (error) {
    throw new Error(`Failed to search methods: ${error.message}`);
  }
};

// Compare two classes
const getEnergyComparison = (className1, className2) => {
  try {
    const report1 = getClassReport(className1);
    const report2 = getClassReport(className2);

    const comparison = {
      class1: {
        name: className1,
        totalMethods: report1.data.totalMethods,
        avgEnergy: report1.data.statistics?.avgEnergy || 0,
        totalEnergy: report1.data.statistics?.totalEnergy || 0,
      },
      class2: {
        name: className2,
        totalMethods: report2.data.totalMethods,
        avgEnergy: report2.data.statistics?.avgEnergy || 0,
        totalEnergy: report2.data.statistics?.totalEnergy || 0,
      },
      difference: {
        avgEnergy: Math.abs(
          (report1.data.statistics?.avgEnergy || 0) - (report2.data.statistics?.avgEnergy || 0)
        ),
        totalEnergy: Math.abs(
          (report1.data.statistics?.totalEnergy || 0) - (report2.data.statistics?.totalEnergy || 0)
        ),
        methodCount: Math.abs(report1.data.totalMethods - report2.data.totalMethods),
      },
    };

    return { success: true, comparison };
  } catch (error) {
    throw new Error(`Failed to compare classes: ${error.message}`);
  }
};

// ============ EXPORTS ============
export default {
  getAllReports,
  getClassReport,
  getSummaryReport,
  getMethodReport,
  getEnergyStatistics,
  getTopEnergyConsumers,
  searchMethods,
  getEnergyComparison,
};
