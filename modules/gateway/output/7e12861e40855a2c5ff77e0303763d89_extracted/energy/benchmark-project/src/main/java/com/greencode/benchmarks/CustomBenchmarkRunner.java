package com.greencode.benchmarks;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Custom Benchmark Runner - Outputs JSON for Energy Analysis
 * Generated at: 2026-02-05T07:25:47.432Z
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
    private Main mainInstance = new Main();
    private ChessGameEngine chessgameengineInstance = new ChessGameEngine();
    private ReportGenerator reportgeneratorInstance = new ReportGenerator();
    private Calculator calculatorInstance = new Calculator();
    private PieceValidation piecevalidationInstance = new PieceValidation();
    private Test testInstance = new Test();
    private UserServices userservicesInstance = new UserServices();

    public List<BenchmarkResult> runAllBenchmarks() {
        List<BenchmarkResult> results = new ArrayList<>();

        // Benchmark: SpecialMoves.isCheckmate
        results.add(benchmark_SpecialMoves_isCheckmate());

        // Benchmark: Main.main
        results.add(benchmark_Main_main());

        // Benchmark: ChessGameEngine.findKing
        results.add(benchmark_ChessGameEngine_findKing());

        // Benchmark: ChessGameEngine.isInCheck
        results.add(benchmark_ChessGameEngine_isInCheck());

        // Benchmark: ReportGenerator.generateReport
        results.add(benchmark_ReportGenerator_generateReport());

        // Benchmark: SpecialMoves.findKing
        results.add(benchmark_SpecialMoves_findKing());

        // Benchmark: SpecialMoves.isInCheck
        results.add(benchmark_SpecialMoves_isInCheck());

        // Benchmark: Calculator.sumArray
        results.add(benchmark_Calculator_sumArray());

        // Benchmark: ChessGameEngine.initializeBoard
        results.add(benchmark_ChessGameEngine_initializeBoard());

        // Benchmark: ChessGameEngine.validateRookMove
        results.add(benchmark_ChessGameEngine_validateRookMove());

        // Benchmark: PieceValidation.isPathClear
        results.add(benchmark_PieceValidation_isPathClear());

        // Benchmark: ReportGenerator.printLongestItem
        results.add(benchmark_ReportGenerator_printLongestItem());

        // Benchmark: ReportGenerator.printSummary
        results.add(benchmark_ReportGenerator_printSummary());

        // Benchmark: ReportGenerator.sortItems
        results.add(benchmark_ReportGenerator_sortItems());

        // Benchmark: Calculator.Calculator
        results.add(benchmark_Calculator_Calculator());

        // Benchmark: Calculator.add
        results.add(benchmark_Calculator_add());

        // Benchmark: Calculator.checkValue
        results.add(benchmark_Calculator_checkValue());

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

        // Benchmark: PieceValidation.validateBishopMove
        results.add(benchmark_PieceValidation_validateBishopMove());

        // Benchmark: PieceValidation.validateKingMove
        results.add(benchmark_PieceValidation_validateKingMove());

        // Benchmark: PieceValidation.validateKnightMove
        results.add(benchmark_PieceValidation_validateKnightMove());

        // Benchmark: PieceValidation.validatePawnMove
        results.add(benchmark_PieceValidation_validatePawnMove());

        // Benchmark: PieceValidation.validateQueenMove
        results.add(benchmark_PieceValidation_validateQueenMove());

        // Benchmark: PieceValidation.validateRookMove
        results.add(benchmark_PieceValidation_validateRookMove());

        // Benchmark: ReportGenerator.addItem
        results.add(benchmark_ReportGenerator_addItem());

        // Benchmark: SpecialMoves.handleCastling
        results.add(benchmark_SpecialMoves_handleCastling());

        // Benchmark: SpecialMoves.handleEnPassant
        results.add(benchmark_SpecialMoves_handleEnPassant());

        // Benchmark: SpecialMoves.handlePromotion
        results.add(benchmark_SpecialMoves_handlePromotion());

        // Benchmark: SpecialMoves.isValidMove
        results.add(benchmark_SpecialMoves_isValidMove());

        // Benchmark: Test.ChessGameEngine
        results.add(benchmark_Test_ChessGameEngine());

        // Benchmark: Test.createPieces
        results.add(benchmark_Test_createPieces());

        // Benchmark: Test.printType
        results.add(benchmark_Test_printType());

        // Benchmark: Test.validatePawnMove
        results.add(benchmark_Test_validatePawnMove());

        // Benchmark: Test.validateQueenMove
        results.add(benchmark_Test_validateQueenMove());

        // Benchmark: Test.validateRookMove
        results.add(benchmark_Test_validateRookMove());

        // Benchmark: Test.Piece
        results.add(benchmark_Test_Piece());

        // Benchmark: UserServices.addUsrTwice
        results.add(benchmark_UserServices_addUsrTwice());

        // Benchmark: UserServices.addUsr
        results.add(benchmark_UserServices_addUsr());

        // Benchmark: UserServices.chkUsr
        results.add(benchmark_UserServices_chkUsr());

        // Benchmark: UserServices.printUsers
        results.add(benchmark_UserServices_printUsers());

        // Benchmark: UserServices.resetAll
        results.add(benchmark_UserServices_resetAll());

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

    private BenchmarkResult benchmark_Main_main() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            mainInstance.main();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            mainInstance.main();
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
        result.className = "Main";
        result.methodName = "main";
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

    private BenchmarkResult benchmark_Calculator_sumArray() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            calculatorInstance.sumArray();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            calculatorInstance.sumArray();
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
        result.className = "Calculator";
        result.methodName = "sumArray";
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

    private BenchmarkResult benchmark_PieceValidation_isPathClear() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            piecevalidationInstance.isPathClear();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            piecevalidationInstance.isPathClear();
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
        result.className = "PieceValidation";
        result.methodName = "isPathClear";
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

    private BenchmarkResult benchmark_Calculator_Calculator() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            calculatorInstance.Calculator();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            calculatorInstance.Calculator();
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
        result.className = "Calculator";
        result.methodName = "Calculator";
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

    private BenchmarkResult benchmark_Calculator_add() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            calculatorInstance.add();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            calculatorInstance.add();
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
        result.className = "Calculator";
        result.methodName = "add";
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

    private BenchmarkResult benchmark_Calculator_checkValue() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            calculatorInstance.checkValue();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            calculatorInstance.checkValue();
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
        result.className = "Calculator";
        result.methodName = "checkValue";
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

    private BenchmarkResult benchmark_PieceValidation_validateBishopMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            piecevalidationInstance.validateBishopMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            piecevalidationInstance.validateBishopMove();
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
        result.className = "PieceValidation";
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

    private BenchmarkResult benchmark_PieceValidation_validateKingMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            piecevalidationInstance.validateKingMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            piecevalidationInstance.validateKingMove();
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
        result.className = "PieceValidation";
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

    private BenchmarkResult benchmark_PieceValidation_validateKnightMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            piecevalidationInstance.validateKnightMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            piecevalidationInstance.validateKnightMove();
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
        result.className = "PieceValidation";
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

    private BenchmarkResult benchmark_PieceValidation_validatePawnMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            piecevalidationInstance.validatePawnMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            piecevalidationInstance.validatePawnMove();
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
        result.className = "PieceValidation";
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

    private BenchmarkResult benchmark_PieceValidation_validateQueenMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            piecevalidationInstance.validateQueenMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            piecevalidationInstance.validateQueenMove();
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
        result.className = "PieceValidation";
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

    private BenchmarkResult benchmark_PieceValidation_validateRookMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            piecevalidationInstance.validateRookMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            piecevalidationInstance.validateRookMove();
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
        result.className = "PieceValidation";
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

    private BenchmarkResult benchmark_Test_ChessGameEngine() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            testInstance.ChessGameEngine();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            testInstance.ChessGameEngine();
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
        result.className = "Test";
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

    private BenchmarkResult benchmark_Test_createPieces() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            testInstance.createPieces();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            testInstance.createPieces();
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
        result.className = "Test";
        result.methodName = "createPieces";
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

    private BenchmarkResult benchmark_Test_printType() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            testInstance.printType();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            testInstance.printType();
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
        result.className = "Test";
        result.methodName = "printType";
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

    private BenchmarkResult benchmark_Test_validatePawnMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            testInstance.validatePawnMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            testInstance.validatePawnMove();
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
        result.className = "Test";
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

    private BenchmarkResult benchmark_Test_validateQueenMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            testInstance.validateQueenMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            testInstance.validateQueenMove();
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
        result.className = "Test";
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

    private BenchmarkResult benchmark_Test_validateRookMove() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            testInstance.validateRookMove();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            testInstance.validateRookMove();
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
        result.className = "Test";
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

    private BenchmarkResult benchmark_Test_Piece() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            testInstance.Piece();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            testInstance.Piece();
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
        result.className = "Test";
        result.methodName = "Piece";
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

    private BenchmarkResult benchmark_UserServices_addUsrTwice() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            userservicesInstance.addUsrTwice();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            userservicesInstance.addUsrTwice();
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
        result.className = "UserServices";
        result.methodName = "addUsrTwice";
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

    private BenchmarkResult benchmark_UserServices_addUsr() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            userservicesInstance.addUsr();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            userservicesInstance.addUsr();
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
        result.className = "UserServices";
        result.methodName = "addUsr";
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

    private BenchmarkResult benchmark_UserServices_chkUsr() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            userservicesInstance.chkUsr();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            userservicesInstance.chkUsr();
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
        result.className = "UserServices";
        result.methodName = "chkUsr";
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

    private BenchmarkResult benchmark_UserServices_printUsers() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            userservicesInstance.printUsers();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            userservicesInstance.printUsers();
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
        result.className = "UserServices";
        result.methodName = "printUsers";
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

    private BenchmarkResult benchmark_UserServices_resetAll() {
        List<Long> times = new ArrayList<>();
        
        // Warmup
        for (int i = 0; i < WARMUP_ITERATIONS; i++) {
            userservicesInstance.resetAll();
        }
        
        // Measurement
        for (int i = 0; i < MEASUREMENT_ITERATIONS; i++) {
            long start = System.nanoTime();
            userservicesInstance.resetAll();
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
        result.className = "UserServices";
        result.methodName = "resetAll";
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
