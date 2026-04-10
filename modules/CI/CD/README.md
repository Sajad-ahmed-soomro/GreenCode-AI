# 🍃 GreenCode AI - Multi-Agent Code Optimization Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()
[![FYP Project](https://img.shields.io/badge/🎓-Final_Year_Project-orange)]()

## 📖 Abstract
**GreenCode AI** is an intelligent, multi-agent system that integrates directly into software development workflows to optimize code for energy efficiency, performance, and maintainability. By combining static analysis (AST/CFG), runtime benchmarking, and AI-powered recommendations, it detects inefficiencies like nested loops, redundant queries, and memory leaks, providing actionable refactoring suggestions. The system operates as both a VS Code extension and CI/CD plugin, offering real-time feedback while reducing technical debt and carbon footprint.

## 🎯 Key Features
- **🤖 Multi-Agent Architecture** - Specialized agents for energy, performance, and maintainability
- **🔍 Hybrid Analysis** - AST/CFG parsing + runtime benchmarking
- **⚡ Real-time Feedback** - VS Code extension with inline suggestions
- **🔄 Auto-refactoring** - Generate patches and unit tests
- **📊 Energy Estimation** - CPU cycles, memory, I/O analysis
- **🔗 CI/CD Integration** - GitHub Actions for pull request reviews
- **📈 Analytics Dashboard** - Track improvements and trends

## Module 6 (IDE + CI/CD) Coverage
This integration module now supports the required workflow integrations:

1. **VS Code Extension Feedback**  
   Outputs normalized issues + inline suggestion payload from analysis data.
2. **GitHub Action Automation**  
   Includes PR workflow at `.github/workflows/greencode-integration-review.yml`.
3. **Inline Suggestions**  
   Generates `inlineSuggestions` with `filePath`, `line`, `severity`, and suggested replacement.
4. **Report Export**  
   Exports team-readable outputs in JSON, Markdown, and SARIF formats.

### Integration Module Commands
Run inside `modules/Integration 2 By Saif`:

```bash
npm install
npm run build

# Full integration report exports
npm run report:json
npm run report:md
npm run report:sarif

# CI mode: exits non-zero on configured threshold
npm run ci:review
```

## 🏗️ System Architecture

<img width="852" height="870" alt="Highlevel" src="https://github.com/user-attachments/assets/48bc5af8-5699-40ec-ad07-e426a9b423d8" />

📁 Project Structure
## 📁 Project Structure (`modules/`)

```text
modules/
├── energy-analyzer/
│   ├── src/
│   │   ├── cli/
│   │   ├── analyzer/
│   │   └── utils/
│   ├── dist/
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── frontend/
│
├── gateway/
│   └── output/
│       └── <hash>_extracted/
│           └── energy/
│               ├── Calculator-energy-report.json
│               ├── ChessGameEngine-energy-report.json
│               ├── Main-energy-report.json
│               ├── PieceValidation-energy-report.json
│               ├── ReportGenerator-energy-report.json
│               ├── SpecialMoves-energy-report.json
│               └── summary-energy-report.json
│
├── Multi_Agent/
│   ├── compliance/
│   ├── data_structure/
│   ├── maintainability_agent/
│   ├── optimization/
│   ├── test_compliance.js
│   ├── test_compliance.ts
│   └── tsconfig.json
│
├── static-analyzer/
│
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

🚀 Quick Start
Prerequisites
Node.js 18+

Java 11+ (for Java analysis)

VS Code (for extension)

Docker (optional)

Installation & Setup
1. Clone Repository
   
```
https://github.com/Sajad-ahmed-soomro/GreenCode-AI.git
cd greencode-ai
cd modules
```

3. Install Dependencies And Build Project

Install backend  gateway dependencies
```
cd gateway
npm install

ن
```
Install static snalyzer dependencies
```
cd static-analyzer
npm install
npx tsc
```
 Install energy analyzer dependencies
```
cd energy-analyzer
npm install
npx tsc
```
Install multi agents  dependencies
```
cd Multi_Agent
```
Install compliance agent dependencies
```

cd compliance
npm install
npx tsc
```
Install data structre agent dependencies
```
cd data_structure
npm install
npx tsc 
```
Install mainainability agent dependencies
```
cd maintainability
npm install
npx tsc
```
Install optimization agent dependencies
```
cd optimization
npm install
npx tsc
```

Install frontend dependencies
```
cd frontend
npm install
npm start
```

 Install VS Code extension dependencies
```
cd ../../integrations/vscode-extension
npm install
```

4. Start Services

Start analysis server
cd gateway
```
npm start
```
 Server runs on http://localhost:5400

Start dashboard
```
cd frontend
npm start
```
 Dashboard at http://localhost:3000

5. Install VS Code Extension

 Package the extension

```
cd src/integrations/vscode-extension
npm run package
```

 Install in VS Code
```
code --install-extension greencode-ai-1.0.0.vsix
```

🧪 Using GreenCode AI
As a VS Code Extension
Open any Java VS Code

Install GreenCode AI extension

Open command palette (Ctrl+Shift+P)

Run GreenCode: Analyze Current File

View inline suggestions and warnings

As a CLI Tool
```
# Analyze a Java project
greencode analyze --language java --project ./my-project

# Analyze with specific agents
greencode analyze --agents energy,performance --output ./report.json

# Generate refactoring patches
greencode refactor --file Main.java --suggestions all
```
As a GitHub Action
Create .github/workflows/greencode.yml:
```
name: GreenCode Analysis
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run GreenCode AI
        uses: greencode-ai/action@v1
        with:
          language: 'java'
          fail-threshold: 0.5
          generate-report: true
```

📊 Analysis Results Example
Sample Output
```
{
  "file": "UserService.java",
  "analysis": {
    "energyScore": 0.72,
    "performanceScore": 0.65,
    "maintainabilityScore": 0.88,
    "issues": [
      {
        "type": "NESTED_LOOP",
        "location": "line 45-52",
        "severity": "HIGH",
        "description": "Three-level nested loop detected",
        "suggestion": "Consider using caching or algorithm optimization",
        "energyImpact": "High CPU consumption",
        "patch": "diff --git a/UserService.java b/UserService.java"
      }
    ]
  },
  "recommendations": [
    "Replace ArrayList with HashMap for O(1) lookups",
    "Use StringBuilder for string concatenation in loops",
    "Cache database query results"
  ]
}
```

Dashboard Metrics

https://docs/dashboard-preview.png

📈 Performance Metrics

| Metric              | Before Optimization | After Optimization | Improvement      |
|---------------------|---------------------|--------------------|------------------|
| CPU Usage           | 85%                 | 62%                | 27% reduction    |
| Memory Usage        | 512 MB              | 384 MB             | 25% reduction    |
| Energy Consumption  | 120 W               | 85 W               | 29% reduction    |
| Response Time       | 450 ms              | 320 ms             | 29% faster       |


📄 Documentation
Technical Documentation
Architecture Overview

API Reference

Deployment Guide

Development Guide

User Guides
VS Code Extension Guide

CI/CD Integration

Dashboard Usage

## 👥 Team

**Sajad Ahmed**  
**Saif-Ur-Rehman**  
**Zahra Irfan**  

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

📞 Contact & Support
Project Lead: Sajad Ahmed - sajadahmedsoomro321@gmail.com

GitHub Issues: Report Issues

Documentation: Read Docs

📚 References
Pereira, R., et al. (2017). Energy Efficiency across Programming Languages

Hindle, A. (2015). Green Mining: A Methodology of Mining Software Repositories

Fast Nuces Islamabad FYP Guidelines, 2025

Related tools: SonarQube, DeepCode, CodeClimate

<div align="center"> <p>Made with 💚 for sustainable software development</p> <p>Final Year Project • Software Engineering • Fast Nuces Islamabad • 2025</p> </div>


## 🎥 Demo

### GreenCode AI in Action
![GreenCode AI Demo](docs/media/demo.gif)

*Real-time code analysis and energy optimization suggestions*

