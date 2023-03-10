#!/usr/bin/env node
import * as command from '../command.js';
import pc from 'picocolors';
import { EmptyDirectoryException } from '../core/EmptyDirectoryException.js';

const args = process.argv.slice(2);
const [readFromDirectory] = args;

try {
  command.execute(readFromDirectory);
} catch (e) {
  if (e instanceof EmptyDirectoryException) {
    console.error(pc.red('Cypress readFromDirectory is required'));
    process.exit(1);
  }

  throw e;
}
