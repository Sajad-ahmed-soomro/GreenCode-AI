# GreenCode AI – VS Code Extension

## How to run the extension

### 1. Install dependencies and compile

```bash
cd vscode-extension
npm install
npm run compile
```

### 2. Start the gateway (required for analysis)

In another terminal, from the repo root:

```bash
cd modules/gateway && npm start
```

Leave it running on `http://localhost:5400`.

### 3. Launch the extension in VS Code

**Option A – F5 (recommended)**  
- Open the **GreenCode-AI** repo folder in VS Code (the root that contains `vscode-extension`).  
- Open the **Run and Debug** view (Ctrl+Shift+D / Cmd+Shift+D).  
- Choose **Run GreenCode Extension**.  
- Press **F5** (or click the green play button).  

A new **Extension Development Host** window opens with the GreenCode AI extension loaded.

**Option B – From terminal**  
- From repo root: `code --extensionDevelopmentPath=$(pwd)/vscode-extension .`  
  (Opens the repo in VS Code with the extension in dev mode.)

### 4. Use the extension

In the Extension Development Host window:

1. Open or create a **Java** file.
2. **Run analysis:** Command Palette (Ctrl+Shift+P / Cmd+Shift+P) → **GreenCode: Run Code Analysis**.  
   Or save the file if **Analyze on save** is enabled (Settings → GreenCode AI).
3. Check the **Problems** panel and the status bar for issues.
4. Use the **lightbulb** (Quick Fix) on a line or **GreenCode: Apply Suggested Fix** to apply a fix.

### Settings

- **GreenCode: Gateway Url** – default `http://localhost:5400`. Change if the gateway runs elsewhere.
- **GreenCode: Analyze On Save** – run analysis when saving a Java file.
- **GreenCode: Severity Threshold** – minimum severity to show (low / medium / high).
