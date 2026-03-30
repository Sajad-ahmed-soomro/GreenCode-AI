public class OrderService {

    public void placeOrder() {
        validate();
        saveOrder();
    }

    private void validate() {
        checkStock();
    }

    private void saveOrder() {
        Database.save();
    }

    private void checkStock() {
        Inventory.check();
    }
}
