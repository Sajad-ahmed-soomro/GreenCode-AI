import java.util.*;

public class User {

    public void test() {
        List<String> names = Arrays.asList("a","b","c");
        List<String> lookup = Arrays.asList("a","x","y");

        for (String n : names) {

            // Deep block to hide nested loop
            {
                for (String x : lookup) {
                    if (names.contains(x)) {     // ONLY issue 1
                        System.out.println(x);
                    }
                }
            }
        }
    }
}
