export class ReportGenerator {
    static generate(violations) {
        if (!Array.isArray(violations)) {
            console.error(" ReportGenerator.generate() received invalid data:", violations);
            violations = [];
        }
        const grouped = violations.reduce((acc, v) => {
            if (!acc[v.severity])
                acc[v.severity] = [];
            acc[v.severity].push(v);
            return acc;
        }, {});
        const report = {
            summary: {
                total: violations.length,
                critical: grouped["critical"]?.length || 0,
                high: grouped["high"]?.length || 0,
                medium: grouped["medium"]?.length || 0,
                low: grouped["low"]?.length || 0,
            },
            details: violations,
        };
        console.log("✅ Generated report summary:", report.summary);
        return report;
    }
}
