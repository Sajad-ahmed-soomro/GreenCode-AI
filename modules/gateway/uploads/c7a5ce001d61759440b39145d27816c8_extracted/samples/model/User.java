public class User {

    private int[] numbers = new int[1000];
    private String[] names = new String[1000];

    public void run() {
        // Deeply nested loops + repeated work
        for (int i = 0; i < numbers.length; i++) {
            for (int j = 0; j < numbers.length; j++) {
                for (int k = 0; k < numbers.length; k++) {
                    // Repeated expensive call pattern
                    String value = String.valueOf(numbers[k]);
                    System.out.println(value);

                    // Manual linear search in (pretend) sorted array
                    for (int x = 0; x < names.length; x++) {
                        if (names[x] != null && names[x].equals("target")) {
                            System.out.println("found");
                        }
                    }
                }
            }
        }

        // Manual deduplication style pattern
        String[] unique = new String[names.length];
        int uniqueCount = 0;
        for (int i = 0; i < names.length; i++) {
            boolean exists = false;
            for (int j = 0; j < uniqueCount; j++) {
                if (names[i] != null && names[i].equals(unique[j])) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                unique[uniqueCount++] = names[i];
            }
        }
    }
}
