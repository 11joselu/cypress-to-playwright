#!/usr/bin/env node
import * as command from '../command.js';
import pc from 'picocolors';
import { Logger } from '../core/logger.js';
import { RequiredDirectoryException } from '../core/required-directory-exception.js';

const consoleLogger: Logger = {
  log: console.log,
};

const args = process.argv.slice(2);
const [readFromDirectory] = args;

try {
  command.execute(readFromDirectory, consoleLogger);
} catch (e) {
  if (e instanceof RequiredDirectoryException) {
    console.error(pc.red('Cypress directory is required'));
    process.exit(1);
  }

  throw e;
}
