#!/usr/bin/env node
import { globSync } from 'glob';
import { basename, dirname, join, resolve, sep } from 'path';
import pc from 'picocolors';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { index as converter } from '../index.js';

type File = {
  path: string;
  code: string;
  newCode: string | null;
};

const args = process.argv.slice(2);
const [readFromDirectory] = args;

execute(readFromDirectory);

function execute(directory: string) {
  validateDirectory(directory);
  const outputDir = resolve(directory, '..', 'playwright');
  mkdir(outputDir);

  const result = getFiles(directory).map(readCyCode).map(migrateCodeToPlaywright);
  result.forEach(writeMigratedCodeFrom(directory, outputDir));

  const migrated = result.filter((p) => p.newCode);
  const notMigrated = result.filter((p) => !p.newCode).map((p) => p.path);
  printSummary(migrated.length, notMigrated);

  showNextStep(outputDir);
}

function validateDirectory(directory: string) {
  if (!directory) {
    console.error(pc.red('Cypress readFromDirectory is required'));
    process.exit(1);
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
    const newCode = converter(file.code);
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

function printSummary(migrated: number, notMigrated: string[]) {
  const strings = notMigrated
    .map((file) => {
      return `\n\t${pc.gray('- ' + file)}`;
    })
    .join('');
  console.log(`
  ${pc.green('- Migrated:')} ${pc.green(migrated)}
  ${pc.red('- Error:')} ${pc.red(notMigrated.length)}${strings}\n`);
}

function showNextStep(outputDir: string) {
  console.warn(
    pc.yellow(`Next Step:
      1. Run 'npm init playwright@latest'.
      2. Change 'testDir' option inside the playwright configuration file to '/${basename(outputDir)}'.
      3. Analyze/Remove unnecessary files (like cy commands, cy plugins, clean package.json etc...)
    `)
  );
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
