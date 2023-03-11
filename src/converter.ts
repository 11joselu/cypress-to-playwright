import ts from 'typescript';
import { transform } from './core/converters/transform.js';
import { CustomCommandTracker } from './core/custom-command-tracker.js';

export function converter(code: string, customCommandsTracker: CustomCommandTracker) {
  if (code.trim() === '') return code;

  const sourceFile = ts.createSourceFile('migration.ts', code, ts.ScriptTarget.Latest, true);

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });
  const transformationResult = ts.transform(sourceFile, [transform(sourceFile, customCommandsTracker)]);
  const transformedSourceFile = transformationResult.transformed[0];

  return printer.printNode(ts.EmitHint.Unspecified, transformedSourceFile, sourceFile);
}
