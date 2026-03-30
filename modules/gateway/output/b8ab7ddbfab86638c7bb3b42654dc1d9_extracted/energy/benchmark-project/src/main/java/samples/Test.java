public class ChessGameEngine {

    private int boardSize;

    public ChessGameEngine() {
        this.boardSize = 8;
    }

    public ChessGameEngine(int size) {
        this.boardSize = size;
    }

    // Example method with simple logic
    public boolean validateQueenMove(int startX, int startY, int endX, int endY) {
        // Diagonal or straight move
        if (startX == endX || startY == endY) {
            return true;
        } else if (Math.abs(startX - endX) == Math.abs(startY - endY)) {
            return true;
        }
        return false;
    }

    // Example method with a loop
    public boolean validateRookMove(int startX, int startY, int endX, int endY) {
        if (startX != endX && startY != endY) return false;

        int steps = Math.max(Math.abs(startX - endX), Math.abs(startY - endY));
        for (int i = 1; i < steps; i++) {
            // Simulate checking intermediate positions
            int tempX = startX < endX ? startX + i : startX - i;
            int tempY = startY < endY ? startY + i : startY - i;
        }
        return true;
    }

    // Example method with conditionals and loop
    public boolean validatePawnMove(int startX, int startY, int endX, int endY, boolean firstMove) {
        int direction = 1; // Assuming white pawns move up
        if (endX == startX && endY - startY == direction) {
            return true;
        }
        if (firstMove && endX == startX && endY - startY == 2 * direction) {
            return true;
        }
        return false;
    }

    // Example method creating objects
    public void createPieces() {
        Piece queen = new Piece("Queen");
        Piece rook = new Piece("Rook");
        Piece pawn = new Piece("Pawn");
    }

    // Nested class for piece creation
    class Piece {
        String type;

        Piece(String type) {
            this.type = type;
        }

        void printType() {
            System.out.println("Piece: " + type);
        }
    }
}
