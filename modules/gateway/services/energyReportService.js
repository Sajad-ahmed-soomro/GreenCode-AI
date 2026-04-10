// =====================================================
// 1. SERVICES - Business Logic Layer (Functional)
// =====================================================

import fs from 'fs';
import path from 'path';
import { getAllEnergyReportFiles } from '../utils/fileReader.js';

const EnergyModulePath = process.env.EnergyModulePath || './output';

// ============ ENHANCED ENERGY CALCULATIONS ============

const calculateEnergyScore = (method) => {
  // Extract method data
  const cpuScore = method.cpuScore || method.staticCpuScore || 0;
  const memScore = method.memScore || method.staticMemScore || 0;
  const ioScore = method.ioScore || method.staticIoScore || 0;
  
  // Base static energy (CPU + Memory + I/O)
  const baseStaticEnergy = (cpuScore + memScore + ioScore) / 3;
  
  // Complexity multipliers - CRITICAL FIX
  let complexityMultiplier = 1;
  
  // 1. Loop impact - major energy consumer
  const loopCount = method.loopCount || 0;
  if (loopCount > 0) {
    // Each loop adds significant overhead
    complexityMultiplier += loopCount * 0.25;
    
    // Nested loops are exponentially worse
    const nestingDepth = method.nestingDepth || 1;
    if (nestingDepth > 1) {
      complexityMultiplier += Math.pow(nestingDepth, 1.5) * 0.15;
    }
  }
  
  // 2. Conditionals impact
  const conditionalsCount = method.conditionalsCount || 0;
  if (conditionalsCount > 0) {
    complexityMultiplier += conditionalsCount * 0.08;
  }
  
  // 3. Method calls overhead
  const methodCalls = method.methodCalls || 0;
  if (methodCalls > 0) {
    complexityMultiplier += methodCalls * 0.05;
  }
  
  // 4. Recursion penalty
  if (method.recursion) {
    complexityMultiplier += 0.5; // Significant penalty for recursion
  }
  
  // 5. I/O operations
  const ioCalls = method.ioCalls || 0;
  if (ioCalls > 0) {
    complexityMultiplier += ioCalls * 0.1;
  }
  
  // 6. Database calls (very expensive)
  const dbCalls = method.dbCalls || 0;
  if (dbCalls > 0) {
    complexityMultiplier += dbCalls * 0.3;
  }
  
  // Apply runtime/benchmark data if available
  let runtimeMultiplier = 1;
  if (method.medianMs) {
    // Convert execution time to energy impact
    // 10ms = baseline (1x), 100ms = ~2x, 1000ms = ~3x
    const timeFactor = Math.log10(method.medianMs / 10 + 1);
    runtimeMultiplier += timeFactor * 0.5;
  }
  
  // Calculate final energy score
  let finalEnergy = baseStaticEnergy * complexityMultiplier * runtimeMultiplier;
  
  // Apply specific corrections for known patterns
  if (method.loopCount >= 2 && method.nestingDepth >= 2) {
    // Double-nested loops get extra penalty
    finalEnergy *= 1.2;
  }
  
  // Normalize to 0.1-0.95 range
  finalEnergy = Math.max(0.1, Math.min(0.95, finalEnergy));
  
  return {
    staticEnergyScore: baseStaticEnergy.toFixed(3),
    complexityMultiplier: complexityMultiplier.toFixed(3),
    runtimeMultiplier: runtimeMultiplier.toFixed(3),
    combinedEnergyScore: finalEnergy.toFixed(3),
    energyScore: finalEnergy
  };
};

const calculateMethodMetrics = (method) => {
  // First calculate the proper energy score
  const energyCalc = calculateEnergyScore(method);
  const energyScore = energyCalc.energyScore;
  
  // Calculate complexity score based on actual metrics
  const complexityScore = 
    (method.nestingDepth || 0) * 0.3 + 
    (method.loopCount || 0) * 0.4 + 
    (method.conditionalsCount || 0) * 0.3;
  
  const efficiencyScore = 1 - energyScore;
  
  // Risk level based on properly calculated energy
  const riskLevel = energyScore > 0.7 ? 'critical' :
                   energyScore > 0.5 ? 'high' :
                   energyScore > 0.3 ? 'medium' : 'low';
  
  return {
    complexityScore: parseFloat(complexityScore.toFixed(3)),
    efficiencyScore: parseFloat(efficiencyScore.toFixed(3)),
    riskLevel,
    optimizationPotential: energyScore > 0.5 ? 'high' : 
                          energyScore > 0.3 ? 'medium' : 'low',
    hasPerformanceIssues: (method.loopCount || 0) > 3 || 
                         (method.nestingDepth || 0) > 3 || 
                         method.recursion || 
                         energyScore > 0.6,
    energyBreakdown: {
      baseStatic: parseFloat(energyCalc.staticEnergyScore),
      complexityImpact: parseFloat(energyCalc.complexityMultiplier),
      runtimeImpact: parseFloat(energyCalc.runtimeMultiplier),
      total: energyScore
    }
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
  // Recalculate all energy scores with proper algorithm
  const enhancedReports = data.reports.map((method) => {
    const energyCalc = calculateEnergyScore(method);
    const metrics = calculateMethodMetrics(method);
    
    return {
      ...method,
      // Override energy scores with proper calculations
      staticEnergyScore: parseFloat(energyCalc.staticEnergyScore),
      combinedEnergyScore: parseFloat(energyCalc.combinedEnergyScore),
      energyScore: energyCalc.energyScore,
      metrics,
      // Add complexity metrics for debugging
      _complexity: {
        loops: method.loopCount || 0,
        nesting: method.nestingDepth || 0,
        conditionals: method.conditionalsCount || 0,
        methodCalls: method.methodCalls || 0
      }
    };
  });

  // Recalculate statistics based on enhanced reports
  const energyScores = enhancedReports.map(r => r.energyScore);
  const percentiles = calculatePercentiles(energyScores);
  
  const totalEnergy = energyScores.reduce((sum, score) => sum + score, 0);
  const avgEnergy = energyScores.length > 0 ? totalEnergy / energyScores.length : 0;
  const maxEnergy = Math.max(...energyScores);
  const minEnergy = Math.min(...energyScores);
  
  const methodsWithLoops = enhancedReports.filter(r => (r.loopCount || 0) > 0).length;
  const methodsWithRecursion = enhancedReports.filter(r => r.recursion).length;
  const highEnergyMethods = enhancedReports.filter(r => r.energyScore > 0.5).length;

  return {
    ...data,
    reports: enhancedReports,
    percentiles,
    statistics: {
      ...data.statistics,
      totalEnergy: parseFloat(totalEnergy.toFixed(6)),
      avgEnergy: parseFloat(avgEnergy.toFixed(6)),
      maxEnergy: parseFloat(maxEnergy.toFixed(6)),
      minEnergy: parseFloat(minEnergy.toFixed(6)),
      methodsWithLoops,
      methodsWithRecursion,
      highEnergyMethods,
      // Override benchmark statistics if needed
      benchmarkStatistics: {
        ...data.benchmarkStatistics,
        avgCombinedEnergy: parseFloat(avgEnergy.toFixed(6))
      }
    },
    summary: {
      totalEnergy: parseFloat(totalEnergy.toFixed(6)),
      avgEnergy: parseFloat(avgEnergy.toFixed(6)),
      energyRange: {
        min: parseFloat(minEnergy.toFixed(6)),
        max: parseFloat(maxEnergy.toFixed(6)),
      },
      recalibrated: true,
      note: 'Energy scores recalculated with enhanced algorithm'
    },
  };
};

const calculateInsights = (summaryData) => {
  const { statistics, reports } = summaryData;
  const avgEnergy = statistics.avgEnergy || 0;

  const insights = {
    energyEfficiency:
      avgEnergy < 0.3 ? 'excellent' :
      avgEnergy < 0.5 ? 'good' :
      avgEnergy < 0.7 ? 'moderate' : 'poor',
    criticalIssues: statistics.highEnergyMethods || 0,
    optimizationOpportunities: 
      reports?.filter(r => 
        r.energyScore > 0.5 || 
        (r.loopCount || 0) > 3 || 
        (r.nestingDepth || 0) > 3
      ).length || 0,
    codeQuality: {
      avgComplexity: statistics.avgNestingDepth || 
        (reports?.reduce((sum, r) => sum + (r.nestingDepth || 0), 0) / (reports?.length || 1)),
      recursiveRatio: (statistics.methodsWithRecursion || 0) / summaryData.totalMethods,
      loopDensity: (statistics.methodsWithLoops || 0) / summaryData.totalMethods,
    },
    scoringMethod: 'enhanced-v2.0',
    recalibrated: true
  };

  return insights;
};

// ============ COMPARISON UTILITY ============

const logEnergyComparison = (method1, method2) => {
  console.log('\n=== ENERGY SCORE COMPARISON ===');
  console.log(`Method 1: ${method1.className}.${method1.methodName}`);
  console.log(`  Loops: ${method1.loopCount}, Nesting: ${method1.nestingDepth}`);
  console.log(`  Original Score: ${method1.energyScore}`);
  
  const calc1 = calculateEnergyScore(method1);
  console.log(`  Calculated Score: ${calc1.energyScore}`);
  console.log(`  Complexity Multiplier: ${calc1.complexityMultiplier}`);
  
  console.log(`\nMethod 2: ${method2.className}.${method2.methodName}`);
  console.log(`  Loops: ${method2.loopCount}, Nesting: ${method2.nestingDepth}`);
  console.log(`  Original Score: ${method2.energyScore}`);
  
  const calc2 = calculateEnergyScore(method2);
  console.log(`  Calculated Score: ${calc2.energyScore}`);
  console.log(`  Complexity Multiplier: ${calc2.complexityMultiplier}`);
  
  const ratio = calc2.energyScore / calc1.energyScore;
  console.log(`\nScore Ratio (Method2/Method1): ${ratio.toFixed(2)}x`);
  console.log('=================================\n');
};

// ============ FILE OPERATIONS ============

const readReportFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
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
    console.log(`📁 Found ${reportFiles.length} report files`);
    
    const filePath = reportFiles.find((f) => f.endsWith(`${className}-energy-report.json`));
    
    if (!filePath) {
      console.log(`❌ No report file found for class: ${className}`);
      throw new Error(`Report not found for class: ${className}`);
    }

    console.log(`✅ Found report file: ${filePath}`);
    const data = readReportFile(filePath);
    
    // Enhance data with proper energy calculations
    const enhancedData = enhanceReportData(data);
    
    // Log comparison for debugging
    if (className === 'Calculator' || className === 'ChessGameEngine') {
      const methods = enhancedData.reports;
      if (methods.length >= 2) {
        const simpleMethod = methods.find(m => m.methodName.includes('add') || m.methodName.includes('checkValue'));
        const complexMethod = methods.find(m => m.methodName.includes('isInCheck') || m.methodName.includes('sumArray'));
        if (simpleMethod && complexMethod) {
          logEnergyComparison(simpleMethod, complexMethod);
        }
      }
    }
    
    return { success: true, data: enhancedData };
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
    const enhancedData = enhanceReportData(data);
    return { 
      success: true, 
      data: { 
        ...enhancedData, 
        insights: calculateInsights(enhancedData) 
      } 
    };
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

    stats.avgEnergyPerClass = stats.totalClasses > 0 ? stats.totalEnergy / stats.totalClasses : 0;
    stats.avgLoopsPerClass = stats.totalClasses > 0 ? stats.totalLoops / stats.totalClasses : 0;
    stats.recursiveRatio = stats.totalMethods > 0 ? stats.recursiveMethods / stats.totalMethods : 0;
    stats.avgEnergyPerMethod = stats.totalMethods > 0 ? stats.totalEnergy / stats.totalMethods : 0;

    return { 
      success: true, 
      statistics: stats,
      note: 'Statistics based on enhanced energy calculations'
    };
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

    // Sort by properly calculated energy scores
    const topMethods = allMethods
      .sort((a, b) => b.energyScore - a.energyScore)
      .slice(0, limit)
      .map((method) => ({ 
        ...method, 
        metrics: calculateMethodMetrics(method) 
      }));

    return { 
      success: true, 
      count: topMethods.length, 
      methods: topMethods,
      note: 'Sorted by enhanced energy scores'
    };
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
        highEnergyMethods: report1.data.statistics?.highEnergyMethods || 0,
        methodsWithLoops: report1.data.statistics?.methodsWithLoops || 0,
      },
      class2: {
        name: className2,
        totalMethods: report2.data.totalMethods,
        avgEnergy: report2.data.statistics?.avgEnergy || 0,
        totalEnergy: report2.data.statistics?.totalEnergy || 0,
        highEnergyMethods: report2.data.statistics?.highEnergyMethods || 0,
        methodsWithLoops: report2.data.statistics?.methodsWithLoops || 0,
      },
      difference: {
        avgEnergy: Math.abs(
          (report1.data.statistics?.avgEnergy || 0) - (report2.data.statistics?.avgEnergy || 0)
        ),
        totalEnergy: Math.abs(
          (report1.data.statistics?.totalEnergy || 0) - (report2.data.statistics?.totalEnergy || 0)
        ),
        methodCount: Math.abs(report1.data.totalMethods - report2.data.totalMethods),
        efficiencyGap: (report1.data.statistics?.avgEnergy || 0) - (report2.data.statistics?.avgEnergy || 0),
      },
      scoringMethod: 'enhanced-v2.0'
    };

    return { success: true, comparison };
  } catch (error) {
    throw new Error(`Failed to compare classes: ${error.message}`);
  }
};

// Before/after impact comparison for module adoption
const getBeforeAfterImpactComparison = ({
  monthlyExecutions = 100000,
  costPerKwhUsd = 0.12,
  co2KgPerKwh = 0.475,
  baselineOverheadRatio = 0.3
} = {}) => {
  try {
    const statsResponse = getEnergyStatistics();
    const stats = statsResponse.statistics || {};
    const allReports = getAllReports();
    const dedupedByClass = new Map();
    (allReports.reports || []).forEach((report) => {
      const key = report.className || report.fileName || 'Unknown';
      const prev = dedupedByClass.get(key);
      const prevTime = prev?.generatedAt ? new Date(prev.generatedAt).getTime() : 0;
      const nextTime = report?.generatedAt ? new Date(report.generatedAt).getTime() : 0;
      if (!prev || nextTime >= prevTime) dedupedByClass.set(key, report);
    });
    const uniqueReports = Array.from(dedupedByClass.values());

    const totalMethods = Math.max(1, stats.totalMethods || 1);
    const postAvgEnergy = Number(stats.avgEnergyPerMethod || 0);
    // Approximate kWh/run from normalized score (project-level heuristic).
    const postKwhPerRun = Math.max(0.000001, postAvgEnergy * 0.00002);
    const baselineKwhPerRun = postKwhPerRun * (1 + Math.max(0, baselineOverheadRatio));

    const before = {
      kwhPerRun: baselineKwhPerRun,
      monthlyKwh: baselineKwhPerRun * monthlyExecutions,
      monthlyCostUsd: baselineKwhPerRun * monthlyExecutions * costPerKwhUsd,
      monthlyCo2Kg: baselineKwhPerRun * monthlyExecutions * co2KgPerKwh
    };

    const after = {
      kwhPerRun: postKwhPerRun,
      monthlyKwh: postKwhPerRun * monthlyExecutions,
      monthlyCostUsd: postKwhPerRun * monthlyExecutions * costPerKwhUsd,
      monthlyCo2Kg: postKwhPerRun * monthlyExecutions * co2KgPerKwh
    };

    const savings = {
      kwh: before.monthlyKwh - after.monthlyKwh,
      costUsd: before.monthlyCostUsd - after.monthlyCostUsd,
      co2Kg: before.monthlyCo2Kg - after.monthlyCo2Kg,
      efficiencyGainPercent: before.monthlyKwh > 0
        ? ((before.monthlyKwh - after.monthlyKwh) / before.monthlyKwh) * 100
        : 0
    };

    const annualized = {
      kwh: savings.kwh * 12,
      costUsd: savings.costUsd * 12,
      co2Kg: savings.co2Kg * 12
    };

    const fileComparisons = uniqueReports.map((report) => {
      const className = report.className;
      const classMethods = Math.max(1, Number(report.totalMethods || 1));
      const share = classMethods / totalMethods;
      const classExecutions = Math.max(1, monthlyExecutions * share);
      const classAvgEnergy = Number(report.statistics?.avgEnergy || 0);
      const classPostKwhPerRun = Math.max(0.000001, classAvgEnergy * 0.00002);
      const highEnergyDensity = Math.min(1, Number(report.statistics?.highEnergyMethods || 0) / classMethods);
      const loopDensity = Math.min(1, Number(report.statistics?.methodsWithLoops || 0) / classMethods);
      // File-specific baseline gap so efficiency differs by file profile.
      const fileOverheadRatio = Math.max(
        0.08,
        baselineOverheadRatio + (classAvgEnergy * 0.18) + (highEnergyDensity * 0.2) + (loopDensity * 0.12)
      );
      const classBaseKwhPerRun = classPostKwhPerRun * (1 + fileOverheadRatio);

      const classBeforeMonthlyKwh = classBaseKwhPerRun * classExecutions;
      const classAfterMonthlyKwh = classPostKwhPerRun * classExecutions;
      const classBeforeCost = classBeforeMonthlyKwh * costPerKwhUsd;
      const classAfterCost = classAfterMonthlyKwh * costPerKwhUsd;
      const classBeforeCo2 = classBeforeMonthlyKwh * co2KgPerKwh;
      const classAfterCo2 = classAfterMonthlyKwh * co2KgPerKwh;
      const classSavedKwh = classBeforeMonthlyKwh - classAfterMonthlyKwh;
      const classSavedCost = classBeforeCost - classAfterCost;
      const classSavedCo2 = classBeforeCo2 - classAfterCo2;

      return {
        file: `${className}.java`,
        className,
        methods: classMethods,
        monthlyExecutions: classExecutions,
        before: {
          monthlyKwh: classBeforeMonthlyKwh,
          monthlyCostUsd: classBeforeCost,
          monthlyCo2Kg: classBeforeCo2
        },
        after: {
          monthlyKwh: classAfterMonthlyKwh,
          monthlyCostUsd: classAfterCost,
          monthlyCo2Kg: classAfterCo2
        },
        savings: {
          kwh: classSavedKwh,
          costUsd: classSavedCost,
          co2Kg: classSavedCo2,
          efficiencyGainPercent: classBeforeMonthlyKwh > 0
            ? (classSavedKwh / classBeforeMonthlyKwh) * 100
            : 0
        },
        model: {
          classAvgEnergy,
          fileOverheadRatio
        }
      };
    }).sort((a, b) => b.savings.costUsd - a.savings.costUsd);

    return {
      success: true,
      assumptions: {
        monthlyExecutions,
        costPerKwhUsd,
        co2KgPerKwh,
        baselineOverheadRatio
      },
      before,
      after,
      savings,
      annualized,
      fileComparisons,
      advantages: [
        'Lower monthly electricity usage and infrastructure spend.',
        'Reduced carbon emissions with measurable annual impact.',
        'Improved efficiency profile for sustainability reporting.'
      ]
    };
  } catch (error) {
    throw new Error(`Failed to compute before/after impact: ${error.message}`);
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
  getBeforeAfterImpactComparison,
  // Export calculation functions for testing
  calculateEnergyScore,
  calculateMethodMetrics
};