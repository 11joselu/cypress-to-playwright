import { CustomCommandTracker } from '../custom-command-tracker.js';

export function createInMemoryCustomCommandTracker(): CustomCommandTracker {
  const commands: string[] = [];
  return {
    track(name: string): void {
      commands.push(`cy.${name}`);
    },
    exists(name: string): boolean {
      return commands.includes(name);
    },
  };
}
