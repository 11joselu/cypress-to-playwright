import ts from 'typescript';
import { Creator, nodeCreator } from './node-creator';
import { COMMANDS, HOOKS } from './playwright';
import { isCy } from './is-cy';
import { isHook } from './is-hook';

export const transform: ts.TransformerFactory<ts.Node> = (context: ts.TransformationContext) => {
  const creator = nodeCreator(context.factory);
  return (rootNode) => {
    function visit(node: ts.Node): ts.Node {
      node = ts.visitEachChild(node, visit, context);

      if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
        const call = node.expression;
        const expressionName = getFormattedExpressionName(call);

        if (isHook.beforeEach(expressionName) || isHook.it(expressionName)) {
          return parseTestHook(expressionName, node, creator);
        }

        if (!isCy.startWithCy(expressionName) || !ts.isPropertyAccessExpression(call.expression)) return node;

        if (isCy.visit(expressionName)) {
          return createGoTo(creator, call);
        }

        if (isCy.click(expressionName)) {
          return createClickCommand(call.expression, creator);
        }

        if (isCy.should(expressionName)) {
          return createExpectValidation(call.expression, call, creator);
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

function parseTestHook(expressionName: string, node: ts.ExpressionStatement, creator: Creator) {
  const call = node.expression as ts.CallExpression;
  if (isHook.it(expressionName)) {
    let expression: ts.Expression;
    if (isHook.isItSkipOrOnly(expressionName)) {
      if (!ts.isPropertyAccessExpression(call.expression)) return node;
      expression = creator.propertyAccessExpression(HOOKS.TEST, call.expression.name);
    } else {
      expression = creator.identifier(HOOKS.TEST);
    }

    const [title] = call.arguments;
    return creator.expressionStatement(
      expression,
      creator.callExpression(call.expression, call.typeArguments, [
        title,
        creator.arrowFunction(
          getBodyOfCall(call, creator),
          [creator.destructuringParameter('page')],
          [creator.asyncToken()]
        ),
      ])
    );
  }

  if (isHook.beforeEach(expressionName)) {
    const expression = creator.identifier(HOOKS.BEFORE_EACH);
    return creator.callExpression(expression, call.typeArguments, [
      creator.arrowFunction(
        getBodyOfCall(call, creator),
        [creator.destructuringParameter('page')],
        [creator.asyncToken()]
      ),
    ]);
  }

  return node;
}

function createGoTo(creator: Creator, call: ts.CallExpression) {
  return creator.awaitExpression(creator.playwrightCommand(call, COMMANDS.GOTO), call.typeArguments, call.arguments);
}

function createClickCommand(propertyExpression: ts.PropertyAccessExpression, creator: Creator) {
  const { typeArguments, argumentsArr } = getArgumentsOfPropertyAccessExpression(propertyExpression);
  return creator.awaitExpression(
    creator.playwrightCommand(propertyExpression.expression, COMMANDS.CLICK),
    typeArguments,
    argumentsArr
  );
}

function createExpectValidation(
  propertyExpression: ts.PropertyAccessExpression,
  call: ts.CallExpression,
  creator: Creator
) {
  const { typeArguments, argumentsArr } = getArgumentsOfPropertyAccessExpression(propertyExpression);
  const cyCommandName = getFormattedExpressionName(propertyExpression.expression);
  let expression = propertyExpression.expression;
  if (isCy.get(cyCommandName)) {
    expression = creator.callExpression(
      creator.playwrightCommand(propertyExpression.expression, COMMANDS.LOCATOR),
      typeArguments,
      argumentsArr
    );
  }

  return creator.expect(expression);
}

function getBodyOfCall(callExpression: ts.CallExpression, creator: Creator): ts.Block {
  const callbackArgument = callExpression.arguments.find((arg) => ts.isFunctionLike(arg));
  const foundCallback = callbackArgument ? (callbackArgument as ts.FunctionExpression) : undefined;

  if (foundCallback?.body) {
    return foundCallback.body as ts.Block;
  }

  return creator.emptyBlock();
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
