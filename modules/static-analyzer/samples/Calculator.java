public class Calculator {
    private int result;

    public Calculator() {
        this.result = 0;
    }

    public Calculator(int initial) {
        this.result = initial;
    }

    public int add(int a, int b) {
        return a + b;
    }

    public int sumArray(int... values) {
        int sum = 0;
        for (int v : values) {
            sum += v;
        }
        return sum;
    }

    public void checkValue(int x) {
        switch (x) {
            case 0:
                System.out.println("Zero");
                break;
            case 1:
                System.out.println("One");
                break;
            default:
                System.out.println("Other");
        }
    }
}
