public class MathService {

    public int sum(int a, int b) {
        log();
        return add(a, b);
    }

    public int multiply(int a, int b) {
        log();
        log();
        return a * b;
    }

    private int add(int x, int y) {
        return x + y;
    }

    private void log() {
        System.out.println("Log");
    }
}
