// controllers/data-aggregator.js - SKIP METRICS FOLDER
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DataAggregator {
  constructor(outputPath) {
    this.outputPath = outputPath;
    console.log(`📁 Reading from: ${this.outputPath}`);
  }

  async loadAllData() {
    try {
      console.log('📊 Reading data...');
      
      // Get all session folders
      const items = await fs.readdir(this.outputPath);
      const sessionFolders = [];
      
      for (const item of items) {
        const itemPath = path.join(this.outputPath, item);
        try {
          const stats = await fs.stat(itemPath);
          if (stats.isDirectory()) {
            sessionFolders.push({ name: item, path: itemPath });
            console.log(`📂 Found session: ${item}`);
          }
        } catch (error) {
          // Skip unreadable items
        }
      }
      
      console.log(`📂 Total session folders: ${sessionFolders.length}`);
      
      // Process each session folder
      const allAnalysisData = [];
      for (const session of sessionFolders) {
        console.log(`\n🔍 Processing session: ${session.name}`);
        const sessionData = await this.readAnalysisSession(session.path, session.name);
        allAnalysisData.push(...sessionData);
      }
      
      console.log(`✅ Total analysis data points found: ${allAnalysisData.length}`);
      
      // Organize data by file
      const filesData = this.mergeDataByFile(allAnalysisData);
      
      // Collect issues
      const issues = this.collectAllIssues(allAnalysisData);
      
      return {
        summary: {
          totalFiles: Object.keys(filesData).length,
          totalIssues: issues.length,
          byAnalyzer: this.countByAnalyzer(allAnalysisData)
        },
        files: filesData,
        issues: issues,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      return {
        summary: { 
          totalFiles: 0,
          totalIssues: 0, 
          byAnalyzer: {}
        },
        files: {},
        issues: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  async readAnalysisSession(sessionPath, sessionId) {
    const allSessionData = [];
    
    try {
      const analysisFolders = await fs.readdir(sessionPath);
      console.log(`   📂 Analyzers found: ${analysisFolders.join(', ')}`);
      
      // Process each analyzer's folder, but skip 'metrics'
      for (const folder of analysisFolders) {
        // SKIP METRICS FOLDER
        if (folder === 'metrics') {
          console.log(`   ⏭️  Skipping metrics folder`);
          continue;
        }
        
        const folderPath = path.join(sessionPath, folder);
        
        try {
          const stats = await fs.stat(folderPath);
          
          if (stats.isDirectory()) {
            const analyzerData = await this.readAnalyzerFolder(folderPath, folder, sessionId);
            allSessionData.push(...analyzerData);
          }
        } catch (error) {
          console.log(`   ⚠️  Could not read ${folder}:`, error.message);
        }
      }
      
      console.log(`   ✅ Session processed: ${allSessionData.length} data points`);
    } catch (error) {
      console.error(`Error reading session ${sessionId}:`, error);
    }
    
    return allSessionData;
  }

  async readAnalyzerFolder(folderPath, analyzerType, sessionId) {
    const analyzerData = [];
    
    try {
      const items = await fs.readdir(folderPath);
      
      for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          // Read subdirectory
          const subDirData = await this.readJsonFilesFromFolder(itemPath, analyzerType, sessionId, item);
          analyzerData.push(...subDirData);
        } else if (item.endsWith('.json')) {
          // Single JSON file
          const fileData = await this.readJsonFile(itemPath, analyzerType, sessionId);
          if (fileData) analyzerData.push(fileData);
        }
      }
      
      if (analyzerData.length > 0) {
        console.log(`     📊 ${analyzerType}: ${analyzerData.length} files`);
      }
    } catch (error) {
      console.error(`Error reading ${analyzerType} folder:`, error);
    }
    
    return analyzerData;
  }

  async readJsonFilesFromFolder(folderPath, analyzerType, sessionId, subFolder) {
    const data = [];
    try {
      const files = await fs.readdir(folderPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(folderPath, file);
          const fileData = await this.readJsonFile(filePath, analyzerType, sessionId);
          if (fileData) {
            fileData.context = subFolder;
            data.push(fileData);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading files from ${folderPath}:`, error);
    }
    return data;
  }

  async readJsonFile(filePath, analyzerType, sessionId) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      return {
        data,
        analyzerType,
        sessionId,
        path: filePath,
        fileName: path.basename(filePath)
      };
    } catch (error) {
      console.log(`⚠️  Skipped ${path.basename(filePath)}: ${error.message}`);
      return null;
    }
  }

  determineFileName(item) {
    const { data, analyzerType, fileName: sourceFile } = item;
    
    switch (analyzerType) {
      case 'data-structure-results':
        if (data.fileName) {
          return data.fileName;
        }
        break;
        
      case 'energy':
        if (data.reports && Array.isArray(data.reports) && data.reports.length > 0) {
          const report = data.reports[0];
          if (report.className) {
            return `${report.className}.java`;
          }
        }
        break;
        
      case 'ast':
      case 'cfg':
      case 'compliance':
      case 'maintainability':
      case 'optimization-report':
      case 'report':
        if (data.fileName) {
          return data.fileName;
        } else if (data.className) {
          return `${data.className}.java`;
        }
        break;
    }
    
    // Try to extract from source filename
    if (sourceFile) {
      // Patterns like: Calculator.report.json
      const match = sourceFile.match(/^([A-Z][A-Za-z]+)\./);
      if (match && match[1]) {
        return `${match[1]}.java`;
      }
    }
    
    return 'Unknown';
  }

  mergeDataByFile(allAnalysisData) {
    const files = {};
    
    for (const item of allAnalysisData) {
      if (!item || !item.data) continue;
      
      const fileName = this.determineFileName(item);
      
      // Skip if we can't determine the file
      if (!fileName || fileName === 'Unknown') continue;
      
      // Initialize file entry if not exists
      if (!files[fileName]) {
        files[fileName] = {
          fileName: fileName,
          analyzers: {}
        };
      }
      
      // Initialize analyzer array if not exists
      if (!files[fileName].analyzers[item.analyzerType]) {
        files[fileName].analyzers[item.analyzerType] = [];
      }
      
      // Add the raw data from this analyzer
      files[fileName].analyzers[item.analyzerType].push({
        rawData: item.data,
        sessionId: item.sessionId,
        sourceFile: item.fileName,
        context: item.context
      });
    }
    
    return files;
  }

  collectAllIssues(allAnalysisData) {
    const issues = [];
    
    for (const item of allAnalysisData) {
      if (!item || !item.data) continue;
      
      issues.push({
        id: `${item.sessionId}_${item.analyzerType}_${Date.now()}_${issues.length}`,
        analyzerType: item.analyzerType,
        sessionId: item.sessionId,
        fileName: this.determineFileName(item),
        rawData: item.data,
        timestamp: new Date().toISOString()
      });
    }
    
    return issues;
  }

  countByAnalyzer(allAnalysisData) {
    const counts = {};
    
    for (const item of allAnalysisData) {
      if (item && item.analyzerType) {
        counts[item.analyzerType] = (counts[item.analyzerType] || 0) + 1;
      }
    }
    
    return counts;
  }
}