#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const args = process.argv.slice(2);
const [directory] = args;
const { readFileSync, writeFileSync } = require('fs');
const { globSync } = require('glob');
const { resolve } = require('path');
const pc = require('picocolors');
const { converter } = require('../converter');
const notMigrated: string[] = [];
let migrated = 0;

const log = {
  error(message: string) {
    console.log(pc.bgRed(pc.bold(pc.white('ERROR:'))) + ' ' + pc.red(message));
  },
  info(message: string) {
    console.log(pc.blue('INFO:') + ' ' + message);
  },
  success(message: string) {
    console.log(pc.bgGreen(pc.bold(pc.white('SUCCESS:'))) + ' ' + message);
  },
};

validateDirectory(directory);
migrateFiles(getFiles(directory));
printSummary();

function validateDirectory(directory: string) {
  if (!directory) {
    log.error('Cypress directory is required');
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
    log.info(`Migrating ${file}...`);
    const content = readFileSync(resolve(file), 'utf-8');
    try {
      const result = converter(content);
      migrated += 1;
      writeFileSync(file.replace('.js', '.migrated.js'), result, 'utf-8');
    } catch (e) {
      notMigrated.push(file);
    }
  });
}

function printSummary() {
  log.success(`
        - Migrated: ${migrated}
        - Error: ${notMigrated.length}
            ${notMigrated.map((file) => {
              return `- ${file}\n`;
            })}
  `);
}
