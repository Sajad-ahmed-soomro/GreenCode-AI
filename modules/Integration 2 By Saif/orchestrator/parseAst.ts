import * as fs from 'fs';
import * as path from 'path';

export function readAstJson(jobPath: string): any {
    const astFolder = path.join(jobPath, 'ast');

    if (!fs.existsSync(astFolder)) {
        throw new Error('AST folder not found');
    }

    const files = fs.readdirSync(astFolder).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        throw new Error('No AST JSON file found');
    }

    const astFilePath = path.join(astFolder, files[0]);
    const raw = fs.readFileSync(astFilePath, 'utf-8');

    return JSON.parse(raw);
}