import { describe, it } from 'node:test';
import * as assert from 'assert';
import ts from 'typescript';

const transformerFactory: ts.TransformerFactory<ts.Node> = (
  context: ts.TransformationContext
) => {
  return (rootNode) => {
    function visit(node: ts.Node): ts.Node {
      node = ts.visitEachChild(node, visit, context);

      if (
        ts.isExpressionStatement(node) &&
        ts.isCallExpression(node.expression)
      ) {
        const callExpression = node.expression;
        if (
          ts.isIdentifier(callExpression.expression) &&
          callExpression.expression.escapedText !== 'it'
        ) {
          return node;
        }

        return context.factory.createExpressionStatement(
          context.factory.createCallExpression(
            context.factory.createIdentifier('test'),
            callExpression.typeArguments,
            callExpression.arguments
          )
        );
      } else {
        return node;
      }
    }

    return ts.visitNode(rootNode, visit);
  };
};

function convert(code: string) {
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

  return printer
    .printNode(ts.EmitHint.Unspecified, transformedSourceFile, sourceFile)
    .trim();
}

describe('Converter', () => {
  it('Returns empty string when there are not code', () => {
    const result = convert('');
    assert.strictEqual(result, '');
  });

  it('Accepts JavaScript code', () => {
    const result = convert(`function hello() {}`);
    assert.strictEqual(result, 'function hello() { }');
  });

  it('Accepts TypeScript code', () => {
    const result = convert(`function hello(): void {}`);
    assert.strictEqual(result, 'function hello(): void { }');
  });

  it('Transform "it" block in a "test" block', () => {
    const result = convert(`it('test_case', () => {});`);
    assert.strictEqual(result, `test('test_case', () => { });`);
  });

  it('Do not transform call expression when is not "it" block in a "test" block', () => {
    const result = convert(`callFunction('test_case', () => {});`);
    assert.strictEqual(result, `callFunction('test_case', () => { });`);
  });
});
