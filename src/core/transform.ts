import ts from 'typescript';
import { nodeCreator } from './node-creator';
import { Playwright, PLAYWRIGHT_TEST_CASE_NAME } from './playwright';

export const transform: ts.TransformerFactory<ts.Node> = (context: ts.TransformationContext) => {
  const creator = nodeCreator(context.factory);
  return (rootNode) => {
    function visit(node: ts.Node): ts.Node {
      node = ts.visitEachChild(node, visit, context);

      if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
        const call = node.expression;
        const expressionName = getFormattedExpressionName(call);

        if (isItBlock(expressionName)) {
          let expression: ts.Expression;
          if (isItSkipOrOnly(expressionName)) {
            if (!ts.isPropertyAccessExpression(call.expression)) {
              return node;
            }

            expression = creator.propertyAccessExpression(PLAYWRIGHT_TEST_CASE_NAME, call.expression.name);
          } else {
            expression = creator.identifier(PLAYWRIGHT_TEST_CASE_NAME);
          }

          return creator.expressionStatement(
            expression,
            creator.callExpression(call.expression, call.typeArguments, [
              call.arguments[0],
              creator.arrowFunction(getBodyOfCall(context.factory, call), [creator.destructuringParameter('page')]),
            ])
          );
        }

        if (!isCypressCommand(expressionName)) return node;

        if (!ts.isPropertyAccessExpression(call.expression)) return node;

        if (isVisitCallExpressions(expressionName)) {
          return creator.awaitExpression(
            creator.playwrightCommand(call, Playwright.GOTO),
            call.typeArguments,
            call.arguments
          );
        }

        if (isClickCallExpression(expressionName)) {
          const { typeArguments, argumentsArr } = getArgumentsOfPropertyAccessExpression(call.expression);
          return creator.awaitExpression(
            creator.playwrightCommand(call.expression.expression, Playwright.CLICK),
            typeArguments,
            argumentsArr
          );
        }
      }

      return node;
    }

    return ts.visitNode(rootNode, visit);
  };
};

function getFormattedExpressionName(expressions: ts.PropertyAccessExpression | ts.LeftHandSideExpression) {
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

function getBodyOfCall(factory: ts.NodeFactory, callExpression: ts.CallExpression): ts.Block {
  const callbackArgument = callExpression.arguments.find((arg) => ts.isFunctionLike(arg));
  const foundCallback = callbackArgument ? (callbackArgument as ts.FunctionExpression) : undefined;

  if (foundCallback?.body) {
    return foundCallback.body as ts.Block;
  }

  return factory.createBlock([], false);
}

function getArgumentsOfPropertyAccessExpression(expression1: ts.PropertyAccessExpression) {
  const callExpression = expression1.expression;
  const typeArguments = ts.isCallExpression(callExpression) ? callExpression.typeArguments : undefined;
  const argumentsArr = ts.isCallExpression(callExpression)
    ? callExpression.arguments
    : ([] as unknown as ts.NodeArray<ts.Expression>);
  return { typeArguments, argumentsArr };
}

function getExpressionName(expression: ts.PropertyAccessExpression | ts.LeftHandSideExpression) {
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
