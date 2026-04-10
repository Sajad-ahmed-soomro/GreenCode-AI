package com.greencode.benchmarks;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Custom Benchmark Runner - Outputs JSON for Energy Analysis
 * Generated at: 2026-04-10T12:01:18.319Z
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

    private SpecialMoves specialmovesInstance = new SpecialMoves();

    public List<BenchmarkResult> runAllBenchmarks() {
        List<BenchmarkResult> results = new ArrayList<>();

        // Benchmark: SpecialMoves.isCheckmate
        results.add(benchmark_SpecialMoves_isCheckmate());

        // Benchmark: SpecialMoves.findKing
        results.add(benchmark_SpecialMoves_findKing());

        // Benchmark: SpecialMoves.isInCheck
        results.add(benchmark_SpecialMoves_isInCheck());

        // Benchmark: SpecialMoves.handleCastling
        results.add(benchmark_SpecialMoves_handleCastling());

        // Benchmark: SpecialMoves.handleEnPassant
        results.add(benchmark_SpecialMoves_handleEnPassant());

        // Benchmark: SpecialMoves.handlePromotion
        results.add(benchmark_SpecialMoves_handlePromotion());

        // Benchmark: SpecialMoves.isValidMove
        results.add(benchmark_SpecialMoves_isValidMove());

        return results;
    }

    private BenchmarkResult benchmark_SpecialMoves_isCheckmate() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            specialmovesInstance.isCheckmate();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            specialmovesInstance.isCheckmate();
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
        result.className = "SpecialMoves";
        result.methodName = "isCheckmate";
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

    private BenchmarkResult benchmark_SpecialMoves_findKing() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            specialmovesInstance.findKing();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            specialmovesInstance.findKing();
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
        result.className = "SpecialMoves";
        result.methodName = "findKing";
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

    private BenchmarkResult benchmark_SpecialMoves_isInCheck() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            specialmovesInstance.isInCheck();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            specialmovesInstance.isInCheck();
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
        result.className = "SpecialMoves";
        result.methodName = "isInCheck";
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

    private BenchmarkResult benchmark_SpecialMoves_handleCastling() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            specialmovesInstance.handleCastling();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            specialmovesInstance.handleCastling();
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
        result.className = "SpecialMoves";
        result.methodName = "handleCastling";
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

    private BenchmarkResult benchmark_SpecialMoves_handleEnPassant() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            specialmovesInstance.handleEnPassant();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            specialmovesInstance.handleEnPassant();
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
        result.className = "SpecialMoves";
        result.methodName = "handleEnPassant";
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

    private BenchmarkResult benchmark_SpecialMoves_handlePromotion() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            specialmovesInstance.handlePromotion();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            specialmovesInstance.handlePromotion();
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
        result.className = "SpecialMoves";
        result.methodName = "handlePromotion";
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

    private BenchmarkResult benchmark_SpecialMoves_isValidMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            specialmovesInstance.isValidMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            specialmovesInstance.isValidMove();
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
        result.className = "SpecialMoves";
        result.methodName = "isValidMove";
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
