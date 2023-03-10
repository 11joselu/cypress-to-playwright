import * as assert from 'assert';
import * as command from '../src/command.js';
import { EmptyDirectoryException } from '../src/core/EmptyDirectoryException.js';
import { resolve } from 'path';
import * as fs from 'fs';

describe('Command', () => {
  const ROOT_DIR = resolve('.', 'test', 'command', 'tmp');

  beforeEach(() => {
    fs.mkdirSync(ROOT_DIR, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(resolve(ROOT_DIR, '..'), { recursive: true, force: true });
  });

  it('Throws error when directory is empty', () => {
    assert.throws(() => {
      command.execute('');
    }, EmptyDirectoryException);
  });

  it('Creates a playwright directory into parent given directory', () => {
    command.execute(ROOT_DIR);

    assert.ok(fs.existsSync(resolve(ROOT_DIR, '..', 'playwright')));
  });
});
