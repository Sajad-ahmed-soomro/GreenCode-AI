public class MainApp {

    public static void main(String[] args) {
        OrderService service = new OrderService();
        service.placeOrder();
        service.placeOrder();
    }
}
