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
