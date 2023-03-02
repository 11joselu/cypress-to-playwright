import ts from 'typescript';

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
        const expressionName = getFormattedExpressionName(callExpression);

        if (isItBlock(expressionName)) {
          if (isItSkipOrOnly(expressionName)) {
            if (!ts.isPropertyAccessExpression(callExpression.expression)) {
              return node;
            }
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

          const newExpression = factory.createIdentifier('test');
          return createExpressionStatement(
            context,
            newExpression,
            callExpression
          );
        }

        if (!isACypressCommand(expressionName)) return node;

        if (!ts.isPropertyAccessExpression(callExpression.expression)) {
          return node;
        }

        if (isVisitCallExpressions(expressionName)) {
          const expression = factory.createPropertyAccessExpression(
            factory.createIdentifier('page'),
            factory.createIdentifier('goto')
          );
          const typeArguments = callExpression.typeArguments;
          const argumentsArr = callExpression.arguments;
          return createAwaitExpression(
            factory,
            expression,
            typeArguments,
            argumentsArr
          );
        }

        if (isClickCallExpression(expressionName)) {
          const getCallExpression = callExpression.expression.expression;
          const expression = factory.createPropertyAccessExpression(
            factory.createIdentifier('page'),
            factory.createIdentifier('click')
          );
          const typeArguments = ts.isCallExpression(getCallExpression)
            ? getCallExpression.typeArguments
            : undefined;
          const argumentsArr = ts.isCallExpression(getCallExpression)
            ? getCallExpression.arguments
            : [];
          return factory.createAwaitExpression(
            factory.createCallExpression(
              expression,
              typeArguments,
              argumentsArr
            )
          );
        }
      }

      return node;
    }

    return ts.visitNode(rootNode, visit);
  };
};

function getFormattedExpressionName(
  expressions: ts.PropertyAccessExpression | ts.LeftHandSideExpression
) {
  return getExpressionName(expressions).reverse().join('.');
}

function isItBlock(expressionName: string) {
  return 'it' === expressionName || isItSkipOrOnly(expressionName);
}

function isItSkipOrOnly(expressionName: string) {
  return ['it.only', 'it.skip'].includes(expressionName);
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

function isACypressCommand(expressionName: string) {
  return expressionName.startsWith('cy');
}

function isVisitCallExpressions(expressionName: string) {
  return expressionName === 'cy.visit';
}

function createAwaitExpression(
  factory: ts.NodeFactory,
  expression: ts.PropertyAccessExpression,
  typeArguments: ts.NodeArray<ts.TypeNode> | undefined,
  argumentsArray: ts.NodeArray<ts.Expression>
) {
  return factory.createAwaitExpression(
    factory.createCallExpression(expression, typeArguments, argumentsArray)
  );
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
