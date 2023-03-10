#!/usr/bin/env node
import * as command from '../command.js';
import pc from 'picocolors';
import { EmptyDirectoryException } from '../core/EmptyDirectoryException.js';
import { Logger } from '../core/logger.js';

const consoleLogger: Logger = {
  log: console.log,
};

const args = process.argv.slice(2);
const [readFromDirectory] = args;

try {
  command.execute(readFromDirectory, consoleLogger);
} catch (e) {
  if (e instanceof EmptyDirectoryException) {
    console.error(pc.red('Cypress directory is required'));
    process.exit(1);
  }

  throw e;
}
