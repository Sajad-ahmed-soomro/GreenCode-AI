// File: NestedIfTest.java
public class User {

    public void checkScore(int score) {
        if (score >= 90) {
            System.out.println("Grade: A");
            if (score > 95) {
                System.out.println("Excellent!");
                if (score == 100) {
                    System.out.println("Perfect Score!");
                } else {
                    System.out.println("Almost perfect!");
                }
            } else {
                System.out.println("Very Good!");
            }
        } else if (score >= 75) {
            if (score > 85) {
                System.out.println("Grade: B+");
            } else {
                System.out.println("Grade: B");
            }
        } else {
            if (score > 60) {
                System.out.println("Grade: C");
            } else if (score > 50) {
                System.out.println("Grade: D");
            } else {
                System.out.println("Fail");
            }
        }
    }

    public static void main(String[] args) {
        NestedIfTest test = new NestedIfTest();
        test.checkScore(100);
        test.checkScore(82);
        test.checkScore(40);
    }
}
