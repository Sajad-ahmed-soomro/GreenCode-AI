# GreenCode AI – Deployment

## Quick start (local)

1. **Gateway** (runs pipeline: static analyzer → orchestrator → energy → context memory → refactoring):
   ```bash
   cd modules/gateway && npm install && npm start
   ```
   Listens on `http://localhost:5400`, WebSocket on `ws://localhost:5400/ws`.

2. **Static analyzer** (built when pipeline runs; or build manually):
   ```bash
   cd modules/static-analyzer && npm install && npm run build
   ```

3. **Test with Calculator.java** (from repo root):
   ```bash
   chmod +x scripts/test-with-calculator.sh && ./scripts/test-with-calculator.sh
   ```

4. **VS Code extension** (optional):
   - Open `vscode-extension/` in VS Code, F5 to launch Extension Development Host.
   - Or: `cd vscode-extension && npm install && npm run compile` then package/install the VSIX.
   - Set `greencode.gatewayUrl` to `http://localhost:5400` if different.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/scan` | Upload zip/file; full pipeline; response includes `unifiedIssues`, `patches` |
| POST | `/api/analyze` | Same as scan, or JSON body `{ "code": "...", "fileName": "X.java" }` |
| GET | `/api/report` | Unified report (aggregated from output folder) |
| GET | `/scan/:scanId/energy` | Energy reports for a scan |
| WebSocket | `/ws` | Optional real-time progress |

## Environment

- `PORT`: Gateway port (default 5400).
- Gateway expects to run from `modules/gateway` (paths to `../static-analyzer`, `../Multi_Agent`, etc.). From repo root, run gateway with `node modules/gateway/server.js` and set `process.cwd()` or run from `modules/gateway`.

## Docker (optional)

To containerize the gateway and dependencies, add a `Dockerfile` in `modules/gateway` that:

1. Copies repo (or relevant modules).
2. Installs Node, runs `npm install` in gateway, static-analyzer, Multi_Agent (if needed), and builds static-analyzer.
3. Exposes port 5400 and runs `node server.js` with working directory so that relative paths to `../static-analyzer`, `../../orchestrator`, etc. resolve.

Example (run from repo root):

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY modules/gateway ./gateway
COPY modules/static-analyzer ./static-analyzer
COPY modules/Multi_Agent ./Multi_Agent
COPY modules/energy-analyzer ./energy-analyzer
COPY orchestrator ./orchestrator
COPY integrations ./integrations
COPY shared ./shared
WORKDIR /app/gateway
RUN npm install
WORKDIR /app/static-analyzer
RUN npm install && npm run build
WORKDIR /app/gateway
EXPOSE 5400
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -f deployment/Dockerfile.gateway -t greencode-gateway .
docker run -p 5400:5400 greencode-gateway
```

(You can add `Dockerfile.gateway` with the above content if you want.)
