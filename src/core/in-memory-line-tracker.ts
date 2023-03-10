import { Line, LineTracker } from './lineTracker.js';

const lines: Line[] = [];
export const inMemoryLineTracker: LineTracker = {
  add(line: string, position: number): void {
    lines.push({ line, position });
  },
  lines(): Line[] {
    return lines;
  },
};
