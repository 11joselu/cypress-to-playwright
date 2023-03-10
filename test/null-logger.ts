import { Logger } from '../src/core/logger.js';

export const nullLogger: Logger = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
  log(_message: string): void {},
};
