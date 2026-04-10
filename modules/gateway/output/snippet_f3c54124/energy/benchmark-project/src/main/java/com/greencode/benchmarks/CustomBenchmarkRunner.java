package com.greencode.benchmarks;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Custom Benchmark Runner - Outputs JSON for Energy Analysis
 * Generated at: 2026-04-10T11:35:53.867Z
 */
public class CustomBenchmarkRunner {

    public static class BenchmarkResult {
        public String className;
        public String methodName;
        public double medianMs;
        public double meanMs;
        public double p95Ms;
        public double minMs;
        public double maxMs;
        public double stdDev;
        public int runs;
        public String benchmarkTool = "CustomRunner";
    }

    private static final int WARMUP_ITERATIONS = 10;
    private static final int MEASUREMENT_ITERATIONS = 100;

    private ReportGenerator reportgeneratorInstance = new ReportGenerator();

    public List<BenchmarkResult> runAllBenchmarks() {
        List<BenchmarkResult> results = new ArrayList<>();

        // Benchmark: ReportGenerator.generateReport
        results.add(benchmark_ReportGenerator_generateReport());

        // Benchmark: ReportGenerator.printLongestItem
        results.add(benchmark_ReportGenerator_printLongestItem());

        // Benchmark: ReportGenerator.printSummary
        results.add(benchmark_ReportGenerator_printSummary());

        // Benchmark: ReportGenerator.sortItems
        results.add(benchmark_ReportGenerator_sortItems());

        // Benchmark: ReportGenerator.addItem
        results.add(benchmark_ReportGenerator_addItem());

        return results;
    }

    private BenchmarkResult benchmark_ReportGenerator_generateReport() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            reportgeneratorInstance.generateReport();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            reportgeneratorInstance.generateReport();
            long end = System.nanoTime();
            times.add(end - start);
        }
        
        // Calculate statistics
        times.sort(Long::compareTo);
        double mean = times.stream().mapToLong(Long::longValue).average().orElse(0.0) / 1_000_000.0;
        double median = times.get(times.size() / 2) / 1_000_000.0;
        double min = times.get(0) / 1_000_000.0;
        double max = times.get(times.size() - 1) / 1_000_000.0;
        double p95 = times.get((int)(times.size() * 0.95)) / 1_000_000.0;
        
        // Standard deviation
        double variance = times.stream()
            .mapToDouble(t -> Math.pow((t / 1_000_000.0) - mean, 2))
            .average().orElse(0.0);
        double stdDev = Math.sqrt(variance);
        
        BenchmarkResult result = new BenchmarkResult();
        result.className = "ReportGenerator";
        result.methodName = "generateReport";
        result.medianMs = median;
        result.meanMs = mean;
        result.p95Ms = p95;
        result.minMs = min;
        result.maxMs = max;
        result.stdDev = stdDev;
        result.runs = MEASUREMENT_ITERATIONS;
        
        System.out.printf("✓ %s.%s: %.3f ms (median)%n", 
            result.className, result.methodName, result.medianMs);
        
        return result;
    }

    private BenchmarkResult benchmark_ReportGenerator_printLongestItem() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            reportgeneratorInstance.printLongestItem();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            reportgeneratorInstance.printLongestItem();
            long end = System.nanoTime();
            times.add(end - start);
        }
        
        // Calculate statistics
        times.sort(Long::compareTo);
        double mean = times.stream().mapToLong(Long::longValue).average().orElse(0.0) / 1_000_000.0;
        double median = times.get(times.size() / 2) / 1_000_000.0;
        double min = times.get(0) / 1_000_000.0;
        double max = times.get(times.size() - 1) / 1_000_000.0;
        double p95 = times.get((int)(times.size() * 0.95)) / 1_000_000.0;
        
        // Standard deviation
        double variance = times.stream()
            .mapToDouble(t -> Math.pow((t / 1_000_000.0) - mean, 2))
            .average().orElse(0.0);
        double stdDev = Math.sqrt(variance);
        
        BenchmarkResult result = new BenchmarkResult();
        result.className = "ReportGenerator";
        result.methodName = "printLongestItem";
        result.medianMs = median;
        result.meanMs = mean;
        result.p95Ms = p95;
        result.minMs = min;
        result.maxMs = max;
        result.stdDev = stdDev;
        result.runs = MEASUREMENT_ITERATIONS;
        
        System.out.printf("✓ %s.%s: %.3f ms (median)%n", 
            result.className, result.methodName, result.medianMs);
        
        return result;
    }

    private BenchmarkResult benchmark_ReportGenerator_printSummary() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            reportgeneratorInstance.printSummary();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            reportgeneratorInstance.printSummary();
            long end = System.nanoTime();
            times.add(end - start);
        }
        
        // Calculate statistics
        times.sort(Long::compareTo);
        double mean = times.stream().mapToLong(Long::longValue).average().orElse(0.0) / 1_000_000.0;
        double median = times.get(times.size() / 2) / 1_000_000.0;
        double min = times.get(0) / 1_000_000.0;
        double max = times.get(times.size() - 1) / 1_000_000.0;
        double p95 = times.get((int)(times.size() * 0.95)) / 1_000_000.0;
        
        // Standard deviation
        double variance = times.stream()
            .mapToDouble(t -> Math.pow((t / 1_000_000.0) - mean, 2))
            .average().orElse(0.0);
        double stdDev = Math.sqrt(variance);
        
        BenchmarkResult result = new BenchmarkResult();
        result.className = "ReportGenerator";
        result.methodName = "printSummary";
        result.medianMs = median;
        result.meanMs = mean;
        result.p95Ms = p95;
        result.minMs = min;
        result.maxMs = max;
        result.stdDev = stdDev;
        result.runs = MEASUREMENT_ITERATIONS;
        
        System.out.printf("✓ %s.%s: %.3f ms (median)%n", 
            result.className, result.methodName, result.medianMs);
        
        return result;
    }

    private BenchmarkResult benchmark_ReportGenerator_sortItems() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            reportgeneratorInstance.sortItems();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            reportgeneratorInstance.sortItems();
            long end = System.nanoTime();
            times.add(end - start);
        }
        
        // Calculate statistics
        times.sort(Long::compareTo);
        double mean = times.stream().mapToLong(Long::longValue).average().orElse(0.0) / 1_000_000.0;
        double median = times.get(times.size() / 2) / 1_000_000.0;
        double min = times.get(0) / 1_000_000.0;
        double max = times.get(times.size() - 1) / 1_000_000.0;
        double p95 = times.get((int)(times.size() * 0.95)) / 1_000_000.0;
        
        // Standard deviation
        double variance = times.stream()
            .mapToDouble(t -> Math.pow((t / 1_000_000.0) - mean, 2))
            .average().orElse(0.0);
        double stdDev = Math.sqrt(variance);
        
        BenchmarkResult result = new BenchmarkResult();
        result.className = "ReportGenerator";
        result.methodName = "sortItems";
        result.medianMs = median;
        result.meanMs = mean;
        result.p95Ms = p95;
        result.minMs = min;
        result.maxMs = max;
        result.stdDev = stdDev;
        result.runs = MEASUREMENT_ITERATIONS;
        
        System.out.printf("✓ %s.%s: %.3f ms (median)%n", 
            result.className, result.methodName, result.medianMs);
        
        return result;
    }

    private BenchmarkResult benchmark_ReportGenerator_addItem() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            reportgeneratorInstance.addItem();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            reportgeneratorInstance.addItem();
            long end = System.nanoTime();
            times.add(end - start);
        }
        
        // Calculate statistics
        times.sort(Long::compareTo);
        double mean = times.stream().mapToLong(Long::longValue).average().orElse(0.0) / 1_000_000.0;
        double median = times.get(times.size() / 2) / 1_000_000.0;
        double min = times.get(0) / 1_000_000.0;
        double max = times.get(times.size() - 1) / 1_000_000.0;
        double p95 = times.get((int)(times.size() * 0.95)) / 1_000_000.0;
        
        // Standard deviation
        double variance = times.stream()
            .mapToDouble(t -> Math.pow((t / 1_000_000.0) - mean, 2))
            .average().orElse(0.0);
        double stdDev = Math.sqrt(variance);
        
        BenchmarkResult result = new BenchmarkResult();
        result.className = "ReportGenerator";
        result.methodName = "addItem";
        result.medianMs = median;
        result.meanMs = mean;
        result.p95Ms = p95;
        result.minMs = min;
        result.maxMs = max;
        result.stdDev = stdDev;
        result.runs = MEASUREMENT_ITERATIONS;
        
        System.out.printf("✓ %s.%s: %.3f ms (median)%n", 
            result.className, result.methodName, result.medianMs);
        
        return result;
    }

    public static void main(String[] args) {
        System.out.println("🚀 Starting Custom Benchmark Runner...");
        System.out.println("Warmup iterations: " + WARMUP_ITERATIONS);
        System.out.println("Measurement iterations: " + MEASUREMENT_ITERATIONS);
        System.out.println();
        
        CustomBenchmarkRunner runner = new CustomBenchmarkRunner();
        List<BenchmarkResult> results = runner.runAllBenchmarks();
        
        // Save to JSON
        String outputFile = "benchmark-results.json";
        try {
            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            FileWriter writer = new FileWriter(outputFile);
            gson.toJson(results, writer);
            writer.close();
            System.out.println();
            System.out.println("✅ Benchmark results saved to: " + outputFile);
            System.out.println("📊 Total methods benchmarked: " + results.size());
        } catch (IOException e) {
            System.err.println("❌ Failed to save results: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
