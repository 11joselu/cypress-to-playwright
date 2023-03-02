import ts from 'typescript';

export const transformerFactory: ts.TransformerFactory<ts.Node> = (
  context: ts.TransformationContext
) => {
  return (rootNode) => {
    function visit(node: ts.Node): ts.Node {
      node = ts.visitEachChild(node, visit, context);

      if (
        ts.isExpressionStatement(node) &&
        ts.isCallExpression(node.expression)
      ) {
        if (isItBlock(node.expression)) {
          return createTestBlock(context, node.expression);
        }
      }

      return node;
    }

    return ts.visitNode(rootNode, visit);
  };
};

function isItBlock(callExpression: ts.CallExpression) {
  return (
    ts.isIdentifier(callExpression.expression) &&
    callExpression.expression.escapedText === 'it'
  );
}

function createTestBlock(
  context: ts.TransformationContext,
  callExpression: ts.CallExpression
) {
  return context.factory.createExpressionStatement(
    context.factory.createCallExpression(
      context.factory.createIdentifier('test'),
      callExpression.typeArguments,
      callExpression.arguments
    )
  );
}
