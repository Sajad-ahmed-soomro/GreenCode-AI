import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_BASE_PATH = path.join(__dirname,'..', '..','..', 'gateway', 'output');

export function getLatestJobFolder(): string {
    const folders = fs.readdirSync(OUTPUT_BASE_PATH)
        .map(name => ({
            name,
            time: fs.statSync(path.join(OUTPUT_BASE_PATH, name)).mtime.getTime()
        }))
        .filter(f => fs.statSync(path.join(OUTPUT_BASE_PATH, f.name)).isDirectory())
        .sort((a, b) => b.time - a.time);

    if (folders.length === 0) {
        throw new Error('No job folders found in gateway/output');
    }

    return path.join(OUTPUT_BASE_PATH, folders[0].name);
}