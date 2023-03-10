import { basename, dirname, join, resolve, sep } from 'path';
import pc from 'picocolors';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { converter } from './converter.js';
import { inMemoryLineTracker } from './core/in-memory-line-tracker.js';
import { EmptyDirectoryException } from './core/EmptyDirectoryException.js';
import { Logger } from './core/logger.js';

type File = {
  path: string;
  code: string;
  newCode: string | null;
};

export function execute(directory: string, logger: Logger) {
  validateDirectory(directory);
  const outputDir = resolve(directory, '..', 'playwright');
  mkdir(outputDir);

  const result = getFiles(directory).map(readCyCode).map(migrateCodeToPlaywright);
  result.forEach(writeMigratedCodeFrom(directory, outputDir));

  const migrated = result.filter((p) => p.newCode);
  const notMigrated = result.filter((p) => !p.newCode).map((p) => p.path);
  logger.log(getSummary(migrated.length, notMigrated));

  logger.log(getNextStep(outputDir));
}

function validateDirectory(directory: string) {
  if (!directory) {
    throw new EmptyDirectoryException();
  }
}

function mkdir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getFiles(directory: string) {
  return globSync(`${directory}/**/*.js`, { ignore: `**/node_modules/**` }).filter(
    (file: string) => !file.endsWith('cypress.config.js')
  );
}

function writeMigratedCodeFrom(readDirectory: string, outputDir: string) {
  return (file: File) => {
    if (file.newCode === null) return;

    const writeInFile = join(outputDir, fixFilePath(readDirectory, file.path));
    writeContentInFile(writeInFile, file.newCode);
  };
}

function readCyCode(path: string): File {
  return {
    path: path,
    code: readFileSync(resolve(path), 'utf-8'),
    newCode: null,
  };
}

function migrateCodeToPlaywright(file: File) {
  try {
    const newCode = converter(file.code, inMemoryLineTracker);
    return {
      ...file,
      newCode,
    };
  } catch (e) {
    return {
      ...file,
      newCode: null,
    };
  }
}

function getSummary(migrated: number, notMigrated: string[]) {
  const strings = notMigrated
    .map((file) => {
      return `\n\t${pc.gray('- ' + file)}`;
    })
    .join('');
  return `
  ${pc.green('- Migrated:')} ${pc.green(migrated)}
  ${pc.red('- Error:')} ${pc.red(notMigrated.length)}${strings}\n`;
}

function getNextStep(outputDir: string) {
  return pc.yellow(`Next Step:
      1. Run 'npm init playwright@latest'.
      2. Change 'testDir' option inside the playwright configuration file to '/${basename(outputDir)}'.
      3. Analyze/Remove unnecessary files (like cy commands, cy plugins, clean package.json etc...)
    `);
}

function fixFilePath(fromDir: string, file: string) {
  return file
    .replace(fromDir, '')
    .split(sep)
    .filter((p) => !['cypress', 'e2e'].includes(p))
    .join(sep);
}

function writeContentInFile(writeInFile: string, result: string) {
  mkdir(dirname(writeInFile));
  writeFileSync(writeInFile, result, {
    flag: 'w',
  });
}
