import { MetricResult } from "./metricsHelper";

// Compute score for one method
export function computeMethodScore(metrics: MetricResult[]): { score: number; level: string } {
  const totalPenalty = metrics.reduce((sum, m) => sum + (m.penalty || 0), 0);
  const score = Math.max(0, 100 - totalPenalty * 100); // 0–100 scale

  let level = "High";
  if (score < 60) level = "Low";
  else if (score < 85) level = "Medium";

  return { score: parseFloat(score.toFixed(1)), level };
}

// Compute average score for a file (all methods)
export function computeAverageScore(methodReports: any[]): { avgScore: number; level: string } {
  if (methodReports.length === 0) return { avgScore: 100, level: "High" };

  const avgScore =
    methodReports.reduce((sum, m) => sum + (m.methodScore || 0), 0) / methodReports.length;

  let level = "High";
  if (avgScore < 60) level = "Low";
  else if (avgScore < 85) level = "Medium";

  return { avgScore: parseFloat(avgScore.toFixed(1)), level };
}
