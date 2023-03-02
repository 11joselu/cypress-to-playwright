import ts from 'typescript';

function isACypressCommand(expressionName: string) {
  return expressionName.startsWith('cy');
}

export const transformerFactory: ts.TransformerFactory<ts.Node> = (
  context: ts.TransformationContext
) => {
  return (rootNode) => {
    const factory = context.factory;

    function visit(node: ts.Node): ts.Node {
      node = ts.visitEachChild(node, visit, context);

      if (
        ts.isExpressionStatement(node) &&
        ts.isCallExpression(node.expression)
      ) {
        const callExpression = node.expression;

        if (isItBlock(callExpression)) {
          const newExpression = factory.createIdentifier('test');
          return createExpressionStatement(
            context,
            newExpression,
            callExpression
          );
        }

        if (!ts.isPropertyAccessExpression(callExpression.expression)) {
          return node;
        }

        if (isItBlock(callExpression) || isItBlock(callExpression.expression)) {
          const newExpression = factory.createPropertyAccessExpression(
            factory.createIdentifier('test'),
            callExpression.expression.name
          );
          return createExpressionStatement(
            context,
            newExpression,
            callExpression
          );
        }

        const expressionName = formatExpression(
          getExpressionName(callExpression)
        );

        if (!isACypressCommand(expressionName)) return node;

        if (isVisitCallExpressions(expressionName)) {
          return factory.createAwaitExpression(
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier('page'),
                factory.createIdentifier('goto')
              ),
              callExpression.typeArguments,
              callExpression.arguments
            )
          );
        }

        if (isClickCallExpression(expressionName)) {
          const getCallExpression = callExpression.expression.expression;
          return factory.createAwaitExpression(
            factory.createCallExpression(
              factory.createPropertyAccessExpression(
                factory.createIdentifier('page'),
                factory.createIdentifier('click')
              ),
              ts.isCallExpression(getCallExpression)
                ? getCallExpression.typeArguments
                : undefined,
              ts.isCallExpression(getCallExpression)
                ? getCallExpression.arguments
                : []
            )
          );
        }
      }

      return node;
    }

    return ts.visitNode(rootNode, visit);
  };
};

function isItBlock(
  callExpression: ts.CallExpression | ts.PropertyAccessExpression
) {
  return (
    ts.isIdentifier(callExpression.expression) &&
    callExpression.expression.escapedText === 'it'
  );
}

function createExpressionStatement(
  context: ts.TransformationContext,
  newExpression: ts.Expression,
  callExpression: ts.CallExpression
) {
  return context.factory.createExpressionStatement(
    context.factory.createCallExpression(
      newExpression,
      callExpression.typeArguments,
      callExpression.arguments
    )
  );
}

function isVisitCallExpressions(expressionName: string) {
  return expressionName === 'cy.visit';
}

function isClickCallExpression(expressionName: string) {
  return expressionName === 'cy.get.click';
}

function getExpressionName(
  expression: ts.PropertyAccessExpression | ts.LeftHandSideExpression
) {
  const result: string[] = [];
  if ('name' in expression) {
    result.push(expression.name.escapedText.toString());
  }

  if ('escapedText' in expression) {
    result.push(expression.escapedText as string);
  }

  if ('expression' in expression) {
    result.push(...getExpressionName(expression.expression));
  }

  return result;
}

function formatExpression(expressions: string[]) {
  return expressions.reverse().join('.');
}
