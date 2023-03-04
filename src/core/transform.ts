import ts from 'typescript';
import { Creator, nodeCreator } from './node-creator';
import { COMMANDS, HOOKS, LOCATOR_PROPERTIES, VALIDATION } from './playwright';
import { isCy } from './is-cy';
import { isHook } from './is-hook';

export const transform: ts.TransformerFactory<ts.Node> = (context: ts.TransformationContext) => {
  const creator = nodeCreator(context.factory);
  return (rootNode) => {
    function visit(node: ts.Node): ts.Node {
      node = ts.visitEachChild(node, visit, context);

      if (!(ts.isExpressionStatement(node) && ts.isCallExpression(node.expression))) {
        return node;
      }

      const call = node.expression;
      const expressionName = getExpressionName(call);

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
        return createExpectValidation(call, creator);
      }

      return node;
    }

    return ts.visitNode(rootNode, visit);
  };
};

function getExpressionName(expressions: ts.PropertyAccessExpression | ts.LeftHandSideExpression) {
  return getListOfExpressionName(expressions).reverse().join('.');
}

function parseTestHook(expressionName: string, node: ts.ExpressionStatement, creator: Creator) {
  const call = node.expression as ts.CallExpression;
  if (isHook.it(expressionName)) {
    return createItHook(expressionName, call, node, creator);
  }

  if (isHook.beforeEach(expressionName)) {
    return createBeforeEach(creator, call);
  }

  return node;
}

function createGoTo(creator: Creator, call: ts.CallExpression) {
  return creator.awaitExpression(creator.playwrightCommand(call, COMMANDS.GOTO), call.typeArguments, call.arguments);
}

function createClickCommand(propertyExpression: ts.PropertyAccessExpression, creator: Creator) {
  const expressionName = getExpressionName(propertyExpression);
  if (isCy.isFirst(expressionName) || isCy.isLast(expressionName)) {
    const foundExpression = findGetPropertyExpression(propertyExpression);

    const newExpression = creator.propertyAccessExpression(
      creator.playwrightLocatorProperty(
        propertyExpression.expression,
        isCy.isFirst(expressionName) ? LOCATOR_PROPERTIES.FIRST : LOCATOR_PROPERTIES.LAST,
        foundExpression.typeArguments,
        foundExpression.arguments
      ),
      COMMANDS.CLICK
    );

    const items = ts.isCallExpression(propertyExpression.parent) ? propertyExpression.parent.arguments : [];

    return creator.awaitExpression(newExpression, undefined, items);
  }

  const { propertyTypeAccessArguments, propertyAccessArguments } =
    getArgumentsOfPropertyAccessExpression(propertyExpression);
  const items = ts.isCallExpression(propertyExpression.parent) ? propertyExpression.parent.arguments : [];
  const newArguments = [...propertyAccessArguments].concat(...items) as unknown as ts.NodeArray<ts.Expression>;
  return creator.awaitExpression(
    creator.playwrightCommand(propertyExpression.expression, COMMANDS.CLICK),
    propertyTypeAccessArguments,
    newArguments
  );
}

function createExpectValidation(call: ts.CallExpression, creator: Creator) {
  const propertyExpression = call.expression as ts.PropertyAccessExpression;
  const callArgs = call.arguments.map((arg) => arg.getText().replace(/"|'/g, ''));
  const { propertyTypeAccessArguments, propertyAccessArguments } =
    getArgumentsOfPropertyAccessExpression(propertyExpression);
  const cyCommandName = getExpressionName(propertyExpression.expression);
  let newExpression = propertyExpression.expression;

  if (isCy.get(cyCommandName) || isCy.isFirst(cyCommandName) || isCy.isLast(cyCommandName)) {
    if (isCy.isFirst(cyCommandName) || isCy.isLast(cyCommandName)) {
      const foundExpression = findGetPropertyExpression(propertyExpression);

      newExpression = creator.playwrightLocatorProperty(
        propertyExpression.expression,
        isCy.isFirst(cyCommandName) ? LOCATOR_PROPERTIES.FIRST : LOCATOR_PROPERTIES.LAST,
        foundExpression.typeArguments,
        foundExpression.arguments
      );
    } else {
      newExpression = creator.callExpression(
        creator.playwrightCommand(propertyExpression.expression, COMMANDS.LOCATOR),
        propertyTypeAccessArguments,
        propertyAccessArguments
      );
    }
  }

  if (isCy.validation.haveLength(callArgs[0])) {
    return creator.expect(newExpression, VALIDATION.TO_HAVE_COUNT, [creator.numeric(callArgs[1])]);
  }

  if (isCy.validation.toHaveText(callArgs[0])) {
    return creator.expect(newExpression, VALIDATION.TO_HAVE_TEXT, [creator.string(callArgs[1])]);
  }

  return creator.expect(newExpression, VALIDATION.TO_BE_VISIBLE);
}

function getListOfExpressionName(expression: ts.PropertyAccessExpression | ts.LeftHandSideExpression) {
  const result: string[] = [];
  if ('name' in expression) {
    result.push(expression.name.escapedText.toString());
  }

  if ('escapedText' in expression) {
    result.push(expression.escapedText as string);
  }

  if ('expression' in expression) {
    result.push(...getListOfExpressionName(expression.expression));
  }

  return result;
}

function createItHook(expressionName: string, call: ts.CallExpression, node: ts.ExpressionStatement, creator: Creator) {
  let expression: ts.Expression;
  if (isHook.isItSkipOrOnly(expressionName)) {
    if (!ts.isPropertyAccessExpression(call.expression)) return node;
    expression = creator.propertyAccessExpression(HOOKS.TEST, call.expression.name);
  } else {
    expression = creator.identifier(HOOKS.TEST);
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

function createBeforeEach(creator: Creator, call: ts.CallExpression) {
  const expression = creator.identifier(HOOKS.BEFORE_EACH);
  return creator.callExpression(expression, call.typeArguments, [
    creator.arrowFunction(
      getBodyOfCall(call, creator),
      [creator.destructuringParameter('page')],
      [creator.asyncToken()]
    ),
  ]);
}

function getArgumentsOfPropertyAccessExpression(propertyAccessExpression: ts.PropertyAccessExpression) {
  const callExpression = propertyAccessExpression.expression;
  const propertyTypeAccessArguments = ts.isCallExpression(callExpression) ? callExpression.typeArguments : undefined;
  const propertyAccessArguments = ts.isCallExpression(callExpression)
    ? callExpression.arguments
    : ([] as unknown as ts.NodeArray<ts.Expression>);

  return { propertyTypeAccessArguments, propertyAccessArguments };
}

function getBodyOfCall(callExpression: ts.CallExpression, creator: Creator): ts.Block {
  const callbackArgument = callExpression.arguments.find((arg) => ts.isFunctionLike(arg));
  const foundCallback = callbackArgument ? (callbackArgument as ts.FunctionExpression) : undefined;

  if (foundCallback?.body) {
    return foundCallback.body;
  }

  return creator.emptyBlock();
}

function findGetPropertyExpression(propertyExpression: ts.PropertyAccessExpression): ts.CallExpression {
  const expressionName = getExpressionName(propertyExpression);
  if ('cy.get' === expressionName) {
    return propertyExpression.parent as ts.CallExpression;
  }

  if (ts.isCallExpression(propertyExpression.expression)) {
    return findGetPropertyExpression(propertyExpression.expression.expression as ts.PropertyAccessExpression);
  }

  return propertyExpression.parent as ts.CallExpression;
}
