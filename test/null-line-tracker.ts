import { LineTracker, Line } from '../src/core/line-tracker.js';

export const nullLineTracker: LineTracker = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  add(): void {},
  lines(): Line[] {
    return [];
  },
};
