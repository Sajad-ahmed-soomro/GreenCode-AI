class IndependentService {

    public void startProcess(int value) {
        validate(value);
        calculate(value);
        saveResult(value);
        logAction();
    }

    public void stopProcess(int value) {
        validate(value);
        cleanup(value);
        logAction();
    }

    private void validate(int value) {
        if (value > 0) {
            checkRange(value);
        }
    }

    private void checkRange(int value) {
        // range check
    }

    private void calculate(int value) {
        applyFormula(value);
        applyFormula(value);   // called twice intentionally
    }

    private void applyFormula(int value) {
        // formula logic
    }

    private void saveResult(int value) {
        writeToStore(value);
    }

    private void writeToStore(int value) {
        // write result
    }

    private void cleanup(int value) {
        clearTemp(value);
    }

    private void clearTemp(int value) {
        // cleanup
    }

    private void logAction() {
        printLog();
    }

    private void printLog() {
        // logging
    }
}
