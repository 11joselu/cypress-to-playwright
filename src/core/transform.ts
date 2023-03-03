import ts from 'typescript';
import { nodeCreator } from './node-creator';
import { Playwright, PLAYWRIGHT_TEST_CASE_NAME } from './playwright';

export const transform: ts.TransformerFactory<ts.Node> = (
  context: ts.TransformationContext
) => {
  const factory = nodeCreator(context.factory);
  return (rootNode) => {
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

            return factory.expressionStatement(
              factory.propertyAccessExpression(
                PLAYWRIGHT_TEST_CASE_NAME,
                callExpression.expression.name
              ),
              callExpression
            );
          }

          return factory.expressionStatement(
            factory.identifier(PLAYWRIGHT_TEST_CASE_NAME),
            callExpression
          );
        }

        if (!isCypressCommand(expressionName)) return node;

        if (!ts.isPropertyAccessExpression(callExpression.expression)) {
          return node;
        }

        if (isVisitCallExpressions(expressionName)) {
          return factory.awaitPlaywrightCommand(
            callExpression,
            Playwright.GOTO
          );
        }

        if (isClickCallExpression(expressionName)) {
          return factory.awaitPlaywrightCommand(
            callExpression.expression.expression,
            Playwright.CLICK
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

function isCypressCommand(expressionName: string) {
  return expressionName.startsWith('cy');
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
