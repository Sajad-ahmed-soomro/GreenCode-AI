import * as fs from 'fs';
import * as path from 'path';

// Read first JSON file inside a folder
export function readJsonFromFolder(folderPath: string): any | null {
    if (!fs.existsSync(folderPath)) return null;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));

    if (files.length === 0) return null;

    const filePath = path.join(folderPath, files[0]);
    const raw = fs.readFileSync(filePath, 'utf-8');

    return JSON.parse(raw);
}

// Generic reader for any module folder
export function readModuleOutput(jobPath: string, moduleName: string): any | null {
    const modulePath = path.join(jobPath, moduleName);
    return readJsonFromFolder(modulePath);
}