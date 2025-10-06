/*
import java.io.IOException;
import java.util.*;

class Base {
    protected int base;
}

interface Worker {
    void work();
}

enum Status {
    NEW, RUNNING, DONE
}

public class Main extends Base implements Runnable, Worker {

    // -------- fields (with modifiers) --------
    public static final String APP_NAME = "TestSuite";
    private int counter;
    List<String> names = new ArrayList<>();

    // -------- constructors --------
    public Main() {
        this.counter = 0;
    }

    public Main(int initial) throws IOException {
        this.counter = initial;
        if (initial < 0) throw new IOException("negative");
    }

    // -------- synchronized (method) --------
    @Deprecated
    public synchronized void syncMethod() {
        System.out.println("sync method");
    }

    // -------- synchronized (block) --------
    public void syncBlock() {
        synchronized (this) {
            counter++;
        }
    }

    // -------- parameters, return, modifiers --------
    public int add(int a, int b) {
        return a + b;
    }

    // arrays + varargs (+ flow: break/continue)
    public void arraysAndVarargs(String[] messages, int... codes) {
        for (String m : messages) {
            System.out.println(m);
        }
        for (int c : codes) {
            if (c == 0) continue;
            if (c < 0) break;
            System.out.println("code=" + c);
        }
    }

    // if / else-if / else
    public void ifElse(int x) {
        if (x < 0) {
            System.out.println("neg");
        } else if (x == 0) {
            System.out.println("zero");
        } else {
            System.out.println("pos");
        }
    }

    // switch / case / default + break
    public void switches(int value) {
        switch (value) {
            case 1:
                System.out.println("one");
                break;
            case 2:
                System.out.println("two");
                break;
            default:
                System.out.println("other");
        }
    }

    // try/catch/finally + throw + enhanced-for
    public void risky(List<String> items) throws IOException {
        try {
            if (items == null) {
                throw new IOException("items is null");
            }
            for (String s : items) {
                System.out.println(s);
            }
        } catch (IOException e) {
            System.out.println("caught: " + e.getMessage());
        } finally {
            System.out.println("finally");
        }
    }

    // while + do-while + for + return
    public int loopMix(int limit) {
        int i = 0;
        while (i < limit) {
            i++;
        }
        do {
            i--;
        } while (i > 0);
        for (int j = 0; j < 3; j++) {
            i += j;
        }
        return i;
    }

    // generics in return + param
    public Map<String, Integer> mapify(List<Integer> nums) {
        Map<String, Integer> m = new HashMap<>();
        for (int n : nums) {
            m.put(String.valueOf(n), n);
        }
        return m;
    }

    // interface impls
    @Override
    public void run() {
        System.out.println("run");
    }

    @Override
    public void work() {
        System.out.println("work");
    }

    // inner class
    class Inner {
        int innerField;
        void innerMethod() { System.out.println("inner"); }
    }

    // static nested class
    static class Nested {
        static void ping() { System.out.println("ping"); }
    }
}

// extra top-level class (non-public) in same file
class Helper {
    private String name;
    Helper(String name) { this.name = name; }
    String greet(String who) { return "Hi " + who; }
}
-------------------------------------------
// Base class with a generic type
import java.util.*;

// Base class with a generic type
class Base<T> {
    protected T value;

    public Base(T value) {
        this.value = value;
    }
}

// Generic class with multiple type parameters
class Main<K, V> extends Base<String> {
    public static final String APP_NAME = "TestSuite";
    private int counter;
    Map<String, Integer> cache = new HashMap<>();

    // Default constructor → chaining
    public Main() {
        this(100); // constructor chaining using this
    }

    // Constructor with int → chaining to super
    public Main(int c) {
        super("base-value"); // constructor chaining using super
        this.counter = c;
    }

    // Generic constructor
    public <E> Main(E element) {
        super("base"); // still must call super
        System.out.println("Generic constructor: " + element);
    }

    // Generic method with type parameter
    public <T> T identity(T input) {
        return input;
    }

    // Generic method with bounded type
    public <N extends Number> N doubleValue(N number) {
        Double doubled = number.doubleValue() * 2;
        return (N) doubled; // typecast for demonstration
    }

    // Using generics with foreach
    public void printList(List<String> items) {
        for (String item : items) {   // foreach loop
            System.out.println(item);
        }
    }

    // Main runner
    public static void main(String[] args) {
        Main<String, Integer> obj = new Main<>();
        obj.printList(Arrays.asList("Hello", "World"));
        System.out.println(obj.identity(42));
        System.out.println(obj.doubleValue(5));
    }
}
-------------------------------------
public class Main {

    public void simpleIf(int x) {
        if (x > 0) {
            System.out.println("positive");
        }
    }

    public void ifElse(int x) {
        if (x > 0) {
            System.out.println("positive");
        } else {
            System.out.println("non-positive");
        }
    }

    public void ifElseIfElse(int x) {
        if (x > 10) {
            System.out.println("big");
        } else if (x > 0) {
            System.out.println("positive small");
        } else {
            System.out.println("non-positive");
        }
    }

    public void nestedIf(int x) {
        if (x > 10) {
            if (x > 20) {
                System.out.println("very big");
            } else {
                System.out.println("medium");
            }
        } else {
            if (x < -5) {
                System.out.println("negative and small");
            } else {
                System.out.println("not greater than 10");
            }
        }
    }
}
--------------------------------------
public class Main {

    // 1. Simple if
    public void simpleIf(int x) {
        if (x > 0) {
            System.out.println("positive");
        }
    }

    // 2. If else
    public void ifElse(int x) {
        if (x > 0) {
            System.out.println("positive");
        } else {
            System.out.println("non-positive");
        }
    }

    // 3. If-else if-else chain
    public void ifElseIfElse(int x) {
        if (x > 10) {
            System.out.println("big");
        } else if (x > 0) {
            System.out.println("positive small");
        } else {
            System.out.println("non-positive");
        }
    }

    // 4. Nested if/else inside then + else blocks
    public void nestedIf(int x) {
        if (x > 10) {
            if (x > 20) {
                System.out.println("very big");
            } else {
                System.out.println("medium");
            }
        } else {
            if (x < -5) {
                System.out.println("negative and small");
            } else {
                System.out.println("not greater than 10");
            }
        }
    }

    // 5. Loops mixed with if
    public void loopMix(int n) {
        for (int i = 0; i < n; i++) {
            if (i % 2 == 0) {
                System.out.println("even");
            } else {
                System.out.println("odd");
            }
        }

        while (n > 0) {
            n--;
            if (n == 0) {
                System.out.println("done");
            }
        }
    }

    // 6. Try-catch-finally with conditionals
    public void tryCatchExample(String input) {
        try {
            if (input == null) {
                throw new IllegalArgumentException("null input");
            }
            System.out.println("Input: " + input);
        } catch (IllegalArgumentException e) {
            System.out.println("caught exception");
        } finally {
            System.out.println("always runs");
        }
    }
}
*/
import java.io.IOException;
import java.sql.SQLException;
import java.util.*;

// ---------- Base class with a generic type ----------
class Base<T> {
    protected T value;

    public Base(T value) {
        this.value = value;
    }
}

// ---------- TestEverything with Generics, Inheritance & Interfaces ----------
@Deprecated
public class Main<K, V> extends Base<String> implements Runnable {

    // ---------- Fields ----------
    private int counter = 0;
    protected String name = "default";
    public static final double PI = 3.14159;
    List<String> items;
    Map<String, Integer> cache = new HashMap<>();

    // ---------- Constructors ----------
    // Default constructor (chaining with this)
    public Main() {
        this(100);
    }

    // Constructor with int (chaining to super)
    public Main(int c) {
        super("base-value");
        this.counter = c;
        if (c < 0) {
            throw new IllegalArgumentException("counter cannot be negative");
        }
    }

    // Generic constructor
    public <E> Main(E element) {
        super("generic-base");
        System.out.println("Generic constructor: " + element);
    }

    // ---------- Methods ----------

    @Override
    public void run() {
        System.out.println("Runnable executed");
    }

    @Deprecated
    public synchronized String processItems(List<String> list, String... extras)
            throws IOException, SQLException {
        // for-each + if/else
        for (String item : list) {
            if (item == null) {
                continue;
            } else if (item.isEmpty()) {
                break;
            } else {
                System.out.println("Item: " + item);
            }
        }

        // while
        int i = 0;
        while (i < extras.length) {
            if (i == 2) {
                throw new IOException("Bad index");
            }
            i++;
        }

        // do-while
        int j = 0;
        do {
            j++;
        } while (j < 2);

        // switch
        switch (extras.length) {
            case 0: return "empty";
            case 1: return "single";
            default: return "many";
        }
    }

    // Generic method with type param
    public <T> T identity(T input) {
        return input;
    }

    // Generic method with bounded param
    public <N extends Number> N doubleValue(N number) {
        Double doubled = number.doubleValue() * 2;
        return (N) doubled; // cast for demo
    }

    // Try/catch/finally + return
    public int calculate(int a, int b) {
        try {
            if (b == 0) {
                throw new ArithmeticException("divide by zero");
            }
            return a / b;
        } catch (ArithmeticException e) {
            return -1;
        } finally {
            System.out.println("done");
        }
    }

    // Synchronized block
    public void syncTest() {
        synchronized(this) {
            System.out.println("Inside synchronized block");
        }
    }

    // Break + Continue in for loop
    public void breakContinueTest(int n) {
        for (int i = 0; i < n; i++) {
            if (i == 5) {
                break;
            } else if (i % 2 == 0) {
                continue;
            }
            System.out.println("Loop i = " + i);
        }
    }

    // Nested if test
    public void nestedIf(int x) {
        if (x > 10) {
            if (x > 20) {
                System.out.println("very big");
            } else {
                System.out.println("medium");
            }
        } else {
            if (x < -5) {
                System.out.println("negative small");
            } else {
                System.out.println("not greater than 10");
            }
        }
    }

    // ---------- Main Runner ----------
    public static void main(String[] args) {
        Main<String, Integer> obj = new Main<>();

        obj.run(); // Runnable
        obj.items = Arrays.asList("A", "B", "C");
        try {
            System.out.println(obj.processItems(obj.items, "x", "y"));
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println(obj.identity(123));
        System.out.println(obj.doubleValue(5));
        System.out.println(obj.calculate(10, 2));
        obj.syncTest();
        obj.breakContinueTest(7);
        obj.nestedIf(15);
 
    }
}
