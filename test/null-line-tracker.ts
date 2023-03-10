import { LineTracker, Line } from '../src/core/lineTracker';

export const nullLineTracker: LineTracker = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  add(): void {},
  lines(): Line[] {
    return [];
  },
};
