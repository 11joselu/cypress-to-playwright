import ts from 'typescript';
import { Factory } from './node-factory.js';
import { isHook } from '../is/is-hook.js';
import { HOOKS } from '../playwright.js';

export const handle = (expressionName: string, node: ts.ExpressionStatement, factory: Factory) => {
  const call = node.expression as ts.CallExpression;
  if (isHook.it(expressionName)) {
    return createHookWithTitle(expressionName, call, node, factory, HOOKS.TEST);
  }

  if (isHook.describe(expressionName)) {
    return createHookWithTitle(expressionName, call, node, factory, HOOKS.DESCRIBE);
  }

  if (isHook.beforeEach(expressionName)) {
    return createHookWithoutTitle(factory, call, HOOKS.BEFORE_EACH);
  }

  if (isHook.afterEach(expressionName)) {
    return createHookWithoutTitle(factory, call, HOOKS.AFTER_EACH);
  }

  return node;
};

function createHookWithTitle(
  expressionName: string,
  call: ts.CallExpression,
  node: ts.ExpressionStatement,
  factory: Factory,
  hook: HOOKS
) {
  if (isHook.it(expressionName)) {
    let expression: ts.Expression;
    if (isHook.isItSkipOrOnly(expressionName)) {
      if (!ts.isPropertyAccessExpression(call.expression)) return node;
      expression = factory.propertyAccessExpression(hook, call.expression.name);
    } else {
      expression = factory.identifier(hook);
    }

    const [title] = call.arguments;
    return factory.callExpressionStatement(
      expression,
      factory.callExpression(call.expression, call.typeArguments, [
        title,
        factory.arrowFunction(
          getBodyOfCall(call, factory),
          [factory.destructuringParameter('page')],
          [factory.asyncToken()]
        ),
      ])
    );
  }

  let expression = factory.propertyAccessExpression(HOOKS.TEST, HOOKS.DESCRIBE);

  if (isHook.isDescribeSkipOrOnly(expressionName)) {
    if (!ts.isPropertyAccessExpression(call.expression)) return node;
    expression = factory.propertyAccessExpression(
      factory.propertyAccessExpression(HOOKS.TEST, HOOKS.DESCRIBE),
      call.expression.name
    );
  }

  const [title] = call.arguments;

  return factory.callExpressionStatement(
    expression,
    factory.callExpression(call.expression, call.typeArguments, [
      title,
      factory.arrowFunction(getBodyOfCall(call, factory), [], []),
    ])
  );
}

function getBodyOfCall(callExpression: ts.CallExpression, factory: Factory): ts.Block {
  const callbackArgument = callExpression.arguments.find((arg) => ts.isFunctionLike(arg));
  const foundCallback = callbackArgument ? (callbackArgument as ts.FunctionExpression) : undefined;

  if (foundCallback?.body) {
    return foundCallback.body;
  }

  return factory.emptyBlock();
}

function createHookWithoutTitle(factory: Factory, call: ts.CallExpression, hook: HOOKS = HOOKS.BEFORE_EACH) {
  const testCallExpression = factory.propertyAccessExpression(HOOKS.TEST, hook);
  return factory.callExpression(testCallExpression, call.typeArguments, [
    factory.arrowFunction(
      getBodyOfCall(call, factory),
      [factory.destructuringParameter('page')],
      [factory.asyncToken()]
    ),
  ]);
}
