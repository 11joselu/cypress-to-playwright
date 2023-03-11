import { CustomCommandTracker } from '../src/core/custom-command-tracker.js';

export const nulCustomCommandTracker: CustomCommandTracker = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  track(): void {},
  exists(): boolean {
    return false;
  },
};
