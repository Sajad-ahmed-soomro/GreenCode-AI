# GreenCode AI – System Architecture

## High-level flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  VS Code        │     │  Gateway         │     │  Static Analyzer    │
│  Extension      │────▶│  POST /api/analyze│────▶│  (AST + CFG)        │
│  or Frontend    │     │  POST /scan       │     │                     │
└─────────────────┘     └────────┬─────────┘     └──────────┬──────────┘
                                  │                          │
                                  │              ┌───────────▼───────────┐
                                  │              │  Agent Orchestrator   │
                                  │              │  (parallel)            │
                                  │              │  • Data Structures    │
                                  │              │  • Compliance          │
                                  │              │  • Maintainability    │
                                  │              │  • Optimization       │
                                  │              └───────────┬───────────┘
                                  │                          │
                                  │              ┌───────────▼───────────┐
                                  │              │  Energy Analyzer      │
                                  │              └───────────┬───────────┘
                                  │                          │
                                  │              ┌───────────▼───────────┐
                                  │              │  Context Memory       │
                                  │              │  (store analysis)     │
                                  │              └───────────┬───────────┘
                                  │                          │
                                  │              ┌───────────▼───────────┐
                                  │              │  Refactoring Adapter  │
                                  │              │  (prioritized fixes)  │
                                  │              └───────────┬───────────┘
                                  │                          │
                                  ◀──────────────────────────┘
                                  │  unifiedIssues + patches
                                  ▼
                         ┌─────────────────┐
                         │  Response       │
                         │  (issues,       │
                         │   patches,       │
                         │   energy, etc.) │
                         └─────────────────┘
```

## Communication

- **HTTP**: Frontend / VS Code → Gateway (`POST /api/analyze`, `POST /scan`).
- **WebSocket**: `ws://localhost:5400/ws` for optional real-time progress (gateway can broadcast status).
- **In-process**: Gateway runs Static Analyzer (spawn), then Orchestrator (parallel agents), then Energy Analyzer (spawn), then Context Memory + Refactoring Adapter in Node.

## Data format (unified)

All agent outputs are normalized to **UnifiedIssue**:

- `id`, `filePath`, `line`, `agent`, `category`, `severity`, `confidence`
- `description`, `explanation`, `recommendation`
- `fix`: `{ type, diff?, code?, autoApply }`
- Optional `context`: `{ projectId, frequency, previouslyFixed }`

Patches from the Refactoring Adapter add `issueId`, `recommendation`, `diff`, `autoApply`, `confidence`.

## Components

| Component            | Location                    | Role                                      |
|----------------------|-----------------------------|-------------------------------------------|
| Gateway              | `modules/gateway/`          | Routes, upload, pipeline, WebSocket       |
| Orchestrator         | `orchestrator/`             | Run 4 agents in parallel, normalize      |
| Context Memory       | `integrations/context-memory/` | Store/retrieve analysis per project   |
| Refactoring Adapter  | `integrations/refactoring-adapter/` | Prioritize issues, produce patches |
| Static Analyzer      | `modules/static-analyzer/`  | AST/CFG generation                        |
| Multi-Agent          | `modules/Multi_Agent/`      | Data structures, compliance, maintainability, optimization |
| Energy Analyzer      | `modules/energy-analyzer/`  | Energy analysis                           |
| VS Code Extension    | `vscode-extension/`         | Run analysis, diagnostics, quick fixes    |

## File layout

```
GreenCode-AI/
├── orchestrator/           # Agent orchestration + normalizers
├── integrations/
│   ├── context-memory/     # Context Memory integration
│   └── refactoring-adapter/# Refactoring Engine adapter
├── shared/
│   └── types.js           # UnifiedIssue types
├── modules/
│   ├── gateway/            # API + pipeline
│   ├── static-analyzer/
│   ├── Multi_Agent/
│   ├── energy-analyzer/
│   ├── refactoring-engine/
│   └── Context_Memory/
├── vscode-extension/
└── docs/
```
