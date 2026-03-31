// Complex Java example with multiple patterns

class Database {
    private Connection conn;
    
    public void connect(String url) {
        // Connect logic
        validateUrl(url);
        openConnection();
    }
    
    private void validateUrl(String url) {
        // Validation
    }
    
    private void openConnection() {
        // Open connection
    }
    
    public static Database getInstance() {
        return new Database();
    }
}

class UserService {
    private Database db;
    
    public void saveUser(User user) {
        db.connect("localhost");
        insertUser(user);
        logAction("save");
    }
    
    private void insertUser(User user) {
        // Insert logic
    }
    
    public void deleteUser(int id) {
        db.connect("localhost");
        removeUser(id);
        logAction("delete");
    }
    
    private void removeUser(int id) {
        // Remove logic
    }
    
    private void logAction(String action) {
        Logger.log(action);
    }
}

class Logger {
    public static void log(String message) {
        write(message);
    }
    
    private static void write(String msg) {
        // Write to file
    }
}