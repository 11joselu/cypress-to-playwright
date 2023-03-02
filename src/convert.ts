import ts from 'typescript';
import { transformerFactory } from './transformFactory';

export function convert(code: string) {
  if (code.trim() === '') return code;

  const sourceFile = ts.createSourceFile(
    'migration.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const printer = ts.createPrinter();
  const transformationResult = ts.transform(sourceFile, [transformerFactory]);
  const transformedSourceFile = transformationResult.transformed[0];

  return printer.printNode(
    ts.EmitHint.Unspecified,
    transformedSourceFile,
    sourceFile
  );
}
