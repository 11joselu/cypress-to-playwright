import ts from 'typescript';
import { nodeCreator } from './node-creator';
import { Playwright, PLAYWRIGHT_TEST_CASE_NAME } from './playwright';

export const transform: ts.TransformerFactory<ts.Node> = (
  context: ts.TransformationContext
) => {
  const creator = nodeCreator(context.factory);
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

            return creator.expressionStatement(
              creator.propertyAccessExpression(
                PLAYWRIGHT_TEST_CASE_NAME,
                callExpression.expression.name
              ),
              callExpression
            );
          }

          const newArgument = creator.arrowFunction(
            getBodyOfCall(context.factory, callExpression),
            [creator.destructuringParameter('page')]
          );

          return creator.expressionStatement(
            creator.identifier(PLAYWRIGHT_TEST_CASE_NAME),
            creator.callExpression(
              callExpression.expression,
              callExpression.typeArguments,
              [callExpression.arguments[0], newArgument]
            )
          );
        }

        if (!isCypressCommand(expressionName)) return node;

        if (!ts.isPropertyAccessExpression(callExpression.expression)) {
          return node;
        }

        if (isVisitCallExpressions(expressionName)) {
          return creator.awaitPlaywrightCommand(
            callExpression,
            Playwright.GOTO
          );
        }

        if (isClickCallExpression(expressionName)) {
          return creator.awaitPlaywrightCommand(
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

function getBodyOfCall(
  factory: ts.NodeFactory,
  callExpression: ts.CallExpression
): ts.Block {
  const callbackArgument = callExpression.arguments.find((arg) =>
    ts.isArrowFunction(arg)
  ) as ts.ArrowFunction;

  if (callbackArgument?.body) return callbackArgument.body as ts.Block;
  return factory.createBlock([], false);
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
