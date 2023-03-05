#!/usr/bin/env node
import { globSync } from 'glob';
import { basename, resolve } from 'path';
import pc from 'picocolors';
import ora from 'ora';

import { readFileSync, writeFileSync } from 'fs';
import { index } from '../index.js';
const args = process.argv.slice(2);
const [directory] = args;
const spinner = ora({
  discardStdin: false,
  text: '',
  spinner: 'squareCorners',
});
spinner.start('Starting cypress-to-playwright');

const notMigrated: string[] = [];
let migrated = 0;

validateDirectory(directory);
spinner.info(`Reading files from: ${directory}`);
migrateFiles(getFiles(directory));
spinner.stop();
printSummary();

function validateDirectory(directory: string) {
  if (!directory) {
    spinner.fail(pc.red('Cypress directory is required'));
    process.exit(1);
  }
}

function getFiles(directory: string) {
  return globSync(`${directory}/**/*.js`, { ignore: `**/node_modules/**` }).filter(
    (file: string) => !file.endsWith('cypress.config.js')
  );
}

function migrateFiles(files: string[]) {
  files.forEach((file) => {
    const content = readFileSync(resolve(file), 'utf-8');
    try {
      const result = index(content);
      migrated += 1;
      spinner.succeed(`File ${basename(file)} migrated`);
      writeFileSync(file.replace('.js', '.migrated.js'), result, 'utf-8');
    } catch (e) {
      spinner.fail(pc.red(`There was an error migrating ${basename(file)}:\n\tError: ${(e as Error).message}`));
      notMigrated.push(file);
    }
  });
}

function printSummary() {
  console.log(`
  ${pc.green('- Migrated:')} ${pc.green(migrated)}
  ${pc.red('- Error:')} ${pc.red(notMigrated.length)}
      ${notMigrated.map((file) => {
        return `${pc.gray('- ' + file)}\n`;
      })}
  `);
}
