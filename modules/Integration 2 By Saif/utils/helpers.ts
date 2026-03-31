import * as fs from 'fs';
import * as path from 'path';

// Check if a path exists
export function exists(p: string): boolean {
    try {
        return fs.existsSync(p);
    } catch {
        return false;
    }
}

// Safely read JSON file
export function readJsonFile(filePath: string): any | null {
    try {
        if (!exists(filePath)) return null;

        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    } catch (error) {
        console.error(`Error reading JSON file: ${filePath}`, error);
        return null;
    }
}

// Get first JSON file from a folder
export function getFirstJsonFile(folderPath: string): string | null {
    try {
        if (!exists(folderPath)) return null;

        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
        if (files.length === 0) return null;

        return path.join(folderPath, files[0]);
    } catch {
        return null;
    }
}

// Get all subfolders inside a directory
export function getDirectories(source: string): string[] {
    try {
        return fs.readdirSync(source)
            .map(name => path.join(source, name))
            .filter(p => fs.statSync(p).isDirectory());
    } catch {
        return [];
    }
}

// Get latest modified directory
export function getLatestDirectory(source: string): string | null {
    try {
        const dirs = getDirectories(source);

        if (dirs.length === 0) return null;

        const sorted = dirs.sort((a, b) => {
            return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
        });

        return sorted[0];
    } catch {
        return null;
    }
}

// Safe JSON stringify (prevents crash)
export function safeStringify(data: any): string {
    try {
        return JSON.stringify(data);
    } catch {
        return JSON.stringify({ error: 'Failed to stringify data' });
    }
}