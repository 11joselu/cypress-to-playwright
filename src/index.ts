import ts from 'typescript';
import { transform } from './core/transform.js';

export function index(code: string) {
  if (code.trim() === '') return code;

  const sourceFile = ts.createSourceFile('migration.ts', code, ts.ScriptTarget.Latest, true);

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });
  const transformationResult = ts.transform(sourceFile, [transform(sourceFile)]);
  const transformedSourceFile = transformationResult.transformed[0];

  return printer.printNode(ts.EmitHint.Unspecified, transformedSourceFile, sourceFile);
}
