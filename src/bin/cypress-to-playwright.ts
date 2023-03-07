#!/usr/bin/env node
import { globSync } from 'glob';
import { basename, dirname, join, resolve, sep } from 'path';
import pc from 'picocolors';
import ora, { Ora } from 'ora';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { index as converter } from '../index.js';

const args = process.argv.slice(2);
const [directory] = args;

execute(directory);

function execute(directory: string) {
  const spinner = createSpinner();
  validateDirectory(directory, spinner);
  const outputDir = resolve(directory, '..', 'playwright');
  mkdir(outputDir);

  spinner.info(`Reading files from: ${directory}`);
  const files = getFiles(directory);
  spinner.start(pc.blue('Migration start'));
  const { migrated, notMigrated } = migrateFiles(files, spinner, directory, outputDir);

  printSummary(migrated, notMigrated);
  spinner.stop();
  showNextStep(outputDir, spinner);
}

function createSpinner() {
  return ora({
    discardStdin: false,
    text: '',
    spinner: 'squareCorners',
  });
}

function validateDirectory(directory: string, spinner: Ora) {
  if (!directory) {
    spinner.fail(pc.red('Cypress directory is required'));
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

function migrateFiles(files: string[], spinner: Ora, fromDirectory: string, outputDir: string) {
  let migrated = 0;
  const notMigrated: string[] = [];
  files.forEach((file) => {
    const content = readFileSync(resolve(file), 'utf-8');
    try {
      const result = converter(content);
      migrated += 1;
      spinner.succeed(`File ${basename(file)} migrated`);
      const writeInFile = join(outputDir, getFileWithPath(fromDirectory, file));
      writeContentInFile(writeInFile, result);
    } catch (e) {
      spinner.fail(pc.red(`There was an error migrating ${basename(file)}:\n\tError: ${(e as Error).message}`));
      notMigrated.push(file);
    }
  });

  return {
    migrated,
    notMigrated,
  };
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

function showNextStep(outputDir: string, spinner: Ora) {
  spinner.warn(
    pc.yellow(`Next Step:
      1. Run 'npm init playwright@latest'.
      2. Change 'testDir' option inside the playwright configuration file to '/${basename(outputDir)}'.
      3. Analyze/Remove unnecessary files (like cy commands, cy plugins etc...)
    `)
  );
}

function getFileWithPath(fromDir: string, file: string) {
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
