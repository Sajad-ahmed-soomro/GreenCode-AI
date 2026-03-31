"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exists;
exports.readJsonFile = readJsonFile;
exports.getFirstJsonFile = getFirstJsonFile;
exports.getDirectories = getDirectories;
exports.getLatestDirectory = getLatestDirectory;
exports.safeStringify = safeStringify;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Check if a path exists
function exists(p) {
    try {
        return fs.existsSync(p);
    }
    catch {
        return false;
    }
}
// Safely read JSON file
function readJsonFile(filePath) {
    try {
        if (!exists(filePath))
            return null;
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    }
    catch (error) {
        console.error(`Error reading JSON file: ${filePath}`, error);
        return null;
    }
}
// Get first JSON file from a folder
function getFirstJsonFile(folderPath) {
    try {
        if (!exists(folderPath))
            return null;
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
        if (files.length === 0)
            return null;
        return path.join(folderPath, files[0]);
    }
    catch {
        return null;
    }
}
// Get all subfolders inside a directory
function getDirectories(source) {
    try {
        return fs.readdirSync(source)
            .map(name => path.join(source, name))
            .filter(p => fs.statSync(p).isDirectory());
    }
    catch {
        return [];
    }
}
// Get latest modified directory
function getLatestDirectory(source) {
    try {
        const dirs = getDirectories(source);
        if (dirs.length === 0)
            return null;
        const sorted = dirs.sort((a, b) => {
            return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
        });
        return sorted[0];
    }
    catch {
        return null;
    }
}
// Safe JSON stringify (prevents crash)
function safeStringify(data) {
    try {
        return JSON.stringify(data);
    }
    catch {
        return JSON.stringify({ error: 'Failed to stringify data' });
    }
}
