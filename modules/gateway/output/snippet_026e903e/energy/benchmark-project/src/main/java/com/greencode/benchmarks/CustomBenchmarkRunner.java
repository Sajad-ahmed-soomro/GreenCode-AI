package com.greencode.benchmarks;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Custom Benchmark Runner - Outputs JSON for Energy Analysis
 * Generated at: 2026-03-21T12:45:11.112Z
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

    private ChessGameEngine chessgameengineInstance = new ChessGameEngine();

    public List<BenchmarkResult> runAllBenchmarks() {
        List<BenchmarkResult> results = new ArrayList<>();

        // Benchmark: ChessGameEngine.findKing
        results.add(benchmark_ChessGameEngine_findKing());

        // Benchmark: ChessGameEngine.isInCheck
        results.add(benchmark_ChessGameEngine_isInCheck());

        // Benchmark: ChessGameEngine.initializeBoard
        results.add(benchmark_ChessGameEngine_initializeBoard());

        // Benchmark: ChessGameEngine.ChessGameEngine
        results.add(benchmark_ChessGameEngine_ChessGameEngine());

        // Benchmark: ChessGameEngine.getBoard
        results.add(benchmark_ChessGameEngine_getBoard());

        // Benchmark: ChessGameEngine.handleCastling
        results.add(benchmark_ChessGameEngine_handleCastling());

        // Benchmark: ChessGameEngine.handleEnPassant
        results.add(benchmark_ChessGameEngine_handleEnPassant());

        // Benchmark: ChessGameEngine.handlePromotion
        results.add(benchmark_ChessGameEngine_handlePromotion());

        // Benchmark: ChessGameEngine.handleSpecialMoves
        results.add(benchmark_ChessGameEngine_handleSpecialMoves());

        // Benchmark: ChessGameEngine.isValidMove
        results.add(benchmark_ChessGameEngine_isValidMove());

        // Benchmark: ChessGameEngine.isValidPosition
        results.add(benchmark_ChessGameEngine_isValidPosition());

        // Benchmark: ChessGameEngine.isWhitePiece
        results.add(benchmark_ChessGameEngine_isWhitePiece());

        // Benchmark: ChessGameEngine.isWhiteTurn
        results.add(benchmark_ChessGameEngine_isWhiteTurn());

        // Benchmark: ChessGameEngine.makeMove
        results.add(benchmark_ChessGameEngine_makeMove());

        // Benchmark: ChessGameEngine.validateBishopMove
        results.add(benchmark_ChessGameEngine_validateBishopMove());

        // Benchmark: ChessGameEngine.validateKingMove
        results.add(benchmark_ChessGameEngine_validateKingMove());

        // Benchmark: ChessGameEngine.validateKnightMove
        results.add(benchmark_ChessGameEngine_validateKnightMove());

        // Benchmark: ChessGameEngine.validatePawnMove
        results.add(benchmark_ChessGameEngine_validatePawnMove());

        // Benchmark: ChessGameEngine.validatePieceMove
        results.add(benchmark_ChessGameEngine_validatePieceMove());

        // Benchmark: ChessGameEngine.validateQueenMove
        results.add(benchmark_ChessGameEngine_validateQueenMove());

        // Benchmark: ChessGameEngine.validateRookMove
        results.add(benchmark_ChessGameEngine_validateRookMove());

        return results;
    }

    private BenchmarkResult benchmark_ChessGameEngine_findKing() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.findKing();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.findKing();
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
        result.className = "ChessGameEngine";
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

    private BenchmarkResult benchmark_ChessGameEngine_isInCheck() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.isInCheck();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.isInCheck();
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
        result.className = "ChessGameEngine";
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

    private BenchmarkResult benchmark_ChessGameEngine_initializeBoard() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.initializeBoard();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.initializeBoard();
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
        result.className = "ChessGameEngine";
        result.methodName = "initializeBoard";
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

    private BenchmarkResult benchmark_ChessGameEngine_ChessGameEngine() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.ChessGameEngine();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.ChessGameEngine();
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
        result.className = "ChessGameEngine";
        result.methodName = "ChessGameEngine";
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

    private BenchmarkResult benchmark_ChessGameEngine_getBoard() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.getBoard();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.getBoard();
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
        result.className = "ChessGameEngine";
        result.methodName = "getBoard";
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

    private BenchmarkResult benchmark_ChessGameEngine_handleCastling() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.handleCastling();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.handleCastling();
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
        result.className = "ChessGameEngine";
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

    private BenchmarkResult benchmark_ChessGameEngine_handleEnPassant() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.handleEnPassant();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.handleEnPassant();
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
        result.className = "ChessGameEngine";
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

    private BenchmarkResult benchmark_ChessGameEngine_handlePromotion() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.handlePromotion();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.handlePromotion();
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
        result.className = "ChessGameEngine";
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

    private BenchmarkResult benchmark_ChessGameEngine_handleSpecialMoves() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.handleSpecialMoves();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.handleSpecialMoves();
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
        result.className = "ChessGameEngine";
        result.methodName = "handleSpecialMoves";
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

    private BenchmarkResult benchmark_ChessGameEngine_isValidMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.isValidMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.isValidMove();
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
        result.className = "ChessGameEngine";
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

    private BenchmarkResult benchmark_ChessGameEngine_isValidPosition() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.isValidPosition();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.isValidPosition();
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
        result.className = "ChessGameEngine";
        result.methodName = "isValidPosition";
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

    private BenchmarkResult benchmark_ChessGameEngine_isWhitePiece() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.isWhitePiece();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.isWhitePiece();
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
        result.className = "ChessGameEngine";
        result.methodName = "isWhitePiece";
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

    private BenchmarkResult benchmark_ChessGameEngine_isWhiteTurn() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.isWhiteTurn();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.isWhiteTurn();
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
        result.className = "ChessGameEngine";
        result.methodName = "isWhiteTurn";
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

    private BenchmarkResult benchmark_ChessGameEngine_makeMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.makeMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.makeMove();
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
        result.className = "ChessGameEngine";
        result.methodName = "makeMove";
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

    private BenchmarkResult benchmark_ChessGameEngine_validateBishopMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.validateBishopMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.validateBishopMove();
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
        result.className = "ChessGameEngine";
        result.methodName = "validateBishopMove";
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

    private BenchmarkResult benchmark_ChessGameEngine_validateKingMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.validateKingMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.validateKingMove();
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
        result.className = "ChessGameEngine";
        result.methodName = "validateKingMove";
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

    private BenchmarkResult benchmark_ChessGameEngine_validateKnightMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.validateKnightMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.validateKnightMove();
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
        result.className = "ChessGameEngine";
        result.methodName = "validateKnightMove";
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

    private BenchmarkResult benchmark_ChessGameEngine_validatePawnMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.validatePawnMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.validatePawnMove();
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
        result.className = "ChessGameEngine";
        result.methodName = "validatePawnMove";
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

    private BenchmarkResult benchmark_ChessGameEngine_validatePieceMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.validatePieceMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.validatePieceMove();
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
        result.className = "ChessGameEngine";
        result.methodName = "validatePieceMove";
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

    private BenchmarkResult benchmark_ChessGameEngine_validateQueenMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.validateQueenMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.validateQueenMove();
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
        result.className = "ChessGameEngine";
        result.methodName = "validateQueenMove";
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

    private BenchmarkResult benchmark_ChessGameEngine_validateRookMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            chessgameengineInstance.validateRookMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            chessgameengineInstance.validateRookMove();
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
        result.className = "ChessGameEngine";
        result.methodName = "validateRookMove";
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
