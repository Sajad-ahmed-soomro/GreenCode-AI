import fs from 'fs';
import path from 'path';

/**
 * Recursively read all energy report JSON files from `output/<random-folder>/energy/`
 * @param {string} baseDir - Base directory (default: ./output)
 * @returns {string[]} - Array of absolute file paths
 */
export const getAllEnergyReportFiles = (baseDir = path.join(process.cwd(), 'output')) => {
  const result = [];

  if (!fs.existsSync(baseDir)) return result;

  const folders = fs.readdirSync(baseDir);
  folders.forEach(folder => {
    const folderPath = path.join(baseDir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      const energyPath = path.join(folderPath, 'energy');
      if (fs.existsSync(energyPath) && fs.statSync(energyPath).isDirectory()) {
        const files = fs.readdirSync(energyPath)
          .filter(f => f.endsWith('-energy-report.json'))
          .map(f => path.join(energyPath, f));
        result.push(...files);
      }
    }
  });

  return result;
};
