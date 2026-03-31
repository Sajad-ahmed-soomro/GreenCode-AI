import fs from "fs";
import path from "path";
import chalk from "chalk";
import { calculateCyclomaticComplexity } from "./CyclomaticComplexity.js";
import { calculateNestingDepth } from "./NestingDepth.js";
import { calculateFunctionSize } from "./FunctionSize.js";
import { buildCFG } from "../cfg/CFGBuilder.js";
const processedMethods = new Set();
export function analyzeAST(astJson, filePath, metricsDir, cfgDir) {
    const classes = [];
    if (!astJson.classes?.length) {
        console.log(chalk.yellow(`⚠️  No classes found in ${filePath}`));
        return { fileName: filePath, classes: [] };
    }
    console.log(chalk.dim(`\n[ANALYSIS] Starting analysis for ${astJson.classes.length} class(es)...`));
    for (const cls of astJson.classes) {
        const className = cls.name || "AnonymousClass";
        const methods = cls.methods || [];
        console.log(chalk.dim(`[ANALYSIS] Class: ${className} → ${methods.length} method(s)`));
        const methodMetrics = [];
        for (const method of methods) {
            const methodName = method.name || "anonymous";
            const uniqueKey = `${filePath}::${className}::${methodName}`;
            if (processedMethods.has(uniqueKey))
                continue;
            processedMethods.add(uniqueKey);
            const cyclomaticComplexity = calculateCyclomaticComplexity(method);
            const nestingDepth = calculateNestingDepth(method);
            const functionSize = calculateFunctionSize(method);
            const metrics = {
                name: methodName,
                cyclomaticComplexity,
                nestingDepth,
                functionSize,
            };
            if (metricsDir) {
                if (!fs.existsSync(metricsDir))
                    fs.mkdirSync(metricsDir, { recursive: true });
                const metricsFileName = `${path.parse(filePath).name}_${className}_${methodName}_metrics.json`;
                const metricsFilePath = path.join(metricsDir, metricsFileName);
                fs.writeFileSync(metricsFilePath, JSON.stringify(metrics, null, 2), "utf-8");
                console.log(chalk.dim(`   💾 Metrics saved → ${metricsFileName}`));
            }
            if (cfgDir) {
                const cfg = buildCFG(method);
                if (!fs.existsSync(cfgDir))
                    fs.mkdirSync(cfgDir, { recursive: true });
                const cfgFileName = `${path.parse(filePath).name}_${className}_${methodName}_cfg.json`;
                const cfgFilePath = path.join(cfgDir, cfgFileName);
                fs.writeFileSync(cfgFilePath, JSON.stringify(cfg, null, 2), "utf-8");
                console.log(chalk.dim(`   💾 CFG saved → ${cfgFileName}`));
            }
            methodMetrics.push(metrics);
        }
        const classSummary = {
            totalCyclomaticComplexity: methodMetrics.reduce((a, m) => a + m.cyclomaticComplexity, 0),
            maxNestingDepth: Math.max(...methodMetrics.map(m => m.nestingDepth), 0),
            totalFunctionSize: methodMetrics.reduce((a, m) => a + m.functionSize, 0),
            totalMethods: methodMetrics.length
        };
        classes.push({
            className,
            methods: methodMetrics,
            summary: classSummary
        });
    }
    return { fileName: filePath, classes };
}
export function resetAnalysisTracking() {
    processedMethods.clear();
}
