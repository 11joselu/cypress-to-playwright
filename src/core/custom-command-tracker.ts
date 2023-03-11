export type CustomCommandTracker = {
  track(name: string): void;

  exists(name: string): boolean;
};
