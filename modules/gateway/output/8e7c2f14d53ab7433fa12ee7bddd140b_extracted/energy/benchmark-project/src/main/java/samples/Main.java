// package sample;

// import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter numbers separated by comma:");
        String input = sc.nextLine();
        String[] parts = input.split(",");
        List<Integer> nums = new ArrayList<>();
        for (String s : parts) {
            try {
                nums.add(Integer.parseInt(s.trim()));
            } catch (Exception e) {
                System.out.println("Invalid number: " + s);
            }
        }

        if (nums.size() > 0) {
            int max = nums.get(0);
            for (int i = 0; i < nums.size(); i++) {
                for (int j = 0; j < nums.size(); j++) {
                    if (nums.get(i) > nums.get(j)) {
                        max = nums.get(i);
                    }
                }
            }
            if (max > 50) {
                if (max < 100) {
                    System.out.println("Medium large number: " + max);
                } else {
                    if (max < 200) {
                        System.out.println("Large number: " + max);
                    } else {
                        System.out.println("Huge number: " + max);
                    }
                }
            } else {
                System.out.println("Small number: " + max);
            }
        }
    }
}
