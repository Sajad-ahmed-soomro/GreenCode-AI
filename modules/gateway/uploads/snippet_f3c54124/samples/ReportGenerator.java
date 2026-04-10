// package sample.report;

// import java.util.*;

public class ReportGenerator {
    private List<String> items = new ArrayList<>();
    private Map<String, Integer> counts = new HashMap<>();

    public void addItem(String item) {
        items.add(item);
        if (counts.containsKey(item)) {
            counts.put(item, counts.get(item) + 1);
        } else {
            counts.put(item, 1);
        }
    }

    public void generateReport() {
        System.out.println("Generating report...");
        for (String key : counts.keySet()) {
            for (int i = 0; i < counts.get(key); i++) {
                System.out.println("Item: " + key + " (#" + i + ")");
            }
        }
        System.out.println("Total unique: " + counts.size());
        sortItems();
        printLongestItem();
        printSummary();
    }

    private void sortItems() {
        Collections.sort(items);
        for (String i : items) {
            if (i.length() > 10) {
                if (i.contains("error")) {
                    System.out.println("⚠️ Suspicious: " + i);
                }
            }
        }
    }

    private void printLongestItem() {
        String longest = "";
        for (String i : items) {
            if (i.length() > longest.length()) {
                longest = i;
            }
        }
        System.out.println("Longest item: " + longest);
    }

    private void printSummary() {
        int total = 0;
        for (String key : counts.keySet()) {
            total += counts.get(key);
        }
        System.out.println("Total count: " + total);
    }
}
