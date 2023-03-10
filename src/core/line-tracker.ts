export type Line = {
  line: string;
  position: number;
};

export type LineTracker = {
  add(line: string, position: number): void;

  lines(): Line[];
};
