import ts from 'typescript';
import { Creator } from './node-creator.js';
import { isHook } from './is-hook.js';
import { HOOKS } from './playwright.js';

export const handle = (expressionName: string, node: ts.ExpressionStatement, creator: Creator) => {
  const call = node.expression as ts.CallExpression;
  if (isHook.it(expressionName)) {
    return createHookWithTitle(expressionName, call, node, creator, HOOKS.TEST);
  }

  if (isHook.describe(expressionName)) {
    return createHookWithTitle(expressionName, call, node, creator, HOOKS.DESCRIBE);
  }

  if (isHook.beforeEach(expressionName)) {
    return createHookWithoutTitle(creator, call, HOOKS.BEFORE_EACH);
  }

  if (isHook.afterEach(expressionName)) {
    return createHookWithoutTitle(creator, call, HOOKS.AFTER_EACH);
  }

  return node;
};

function createHookWithTitle(
  expressionName: string,
  call: ts.CallExpression,
  node: ts.ExpressionStatement,
  creator: Creator,
  hook: HOOKS
) {
  if (isHook.it(expressionName)) {
    let expression: ts.Expression;
    if (isHook.isItSkipOrOnly(expressionName)) {
      if (!ts.isPropertyAccessExpression(call.expression)) return node;
      expression = creator.propertyAccessExpression(hook, call.expression.name);
    } else {
      expression = creator.identifier(hook);
    }

    const [title] = call.arguments;
    return creator.callExpressionStatement(
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

  let expression = creator.propertyAccessExpression(HOOKS.TEST, HOOKS.DESCRIBE);

  if (isHook.isDescribeSkipOrOnly(expressionName)) {
    if (!ts.isPropertyAccessExpression(call.expression)) return node;
    expression = creator.propertyAccessExpression(
      creator.propertyAccessExpression(HOOKS.TEST, HOOKS.DESCRIBE),
      call.expression.name
    );
  }

  const [title] = call.arguments;

  return creator.callExpressionStatement(
    expression,
    creator.callExpression(call.expression, call.typeArguments, [
      title,
      creator.arrowFunction(getBodyOfCall(call, creator), [], []),
    ])
  );
}

function getBodyOfCall(callExpression: ts.CallExpression, creator: Creator): ts.Block {
  const callbackArgument = callExpression.arguments.find((arg) => ts.isFunctionLike(arg));
  const foundCallback = callbackArgument ? (callbackArgument as ts.FunctionExpression) : undefined;

  if (foundCallback?.body) {
    return foundCallback.body;
  }

  return creator.emptyBlock();
}

function createHookWithoutTitle(creator: Creator, call: ts.CallExpression, hook: HOOKS = HOOKS.BEFORE_EACH) {
  const testCallExpression = creator.propertyAccessExpression(HOOKS.TEST, hook);
  return creator.callExpression(testCallExpression, call.typeArguments, [
    creator.arrowFunction(
      getBodyOfCall(call, creator),
      [creator.destructuringParameter('page')],
      [creator.asyncToken()]
    ),
  ]);
}
