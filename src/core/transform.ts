import ts from 'typescript';
import { Creator, nodeCreator } from './node-creator.js';
import { COMMANDS, HOOKS, LOCATOR_PROPERTIES, VALIDATION } from './playwright.js';
import { isCy } from './is-cy.js';
import { isHook } from './is-hook.js';

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

      if (isRunnerHook(expressionName)) {
        return parseTestHook(expressionName, node, creator);
      }

      if (!isCy.startWithCy(expressionName) || !ts.isPropertyAccessExpression(call.expression)) return node;

      if (isCy.visit(expressionName)) {
        return createGoTo(creator, call);
      }

      if (isCy.click(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.CLICK);
      }

      if (isCy.should(expressionName)) {
        return createExpectValidation(call, creator);
      }

      if (isCy.type(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.TYPE);
      }

      if (isCy.check(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.CHECK);
      }

      if (isCy.uncheck(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.UNCHECK);
      }

      if (isCy.select(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.SELECT);
      }

      if (isCy.scrollTo(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.SCROLL_TO);
      }

      if (isCy.scrollIntoView(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.SCROLL_INTO_VIEW);
      }

      if (isCy.dblclick(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.DBL_CLICK);
      }

      if (isCy.clear(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.CLEAR, [creator.string('')]);
      }

      if (isCy.intercept(expressionName)) {
        return creator.playwrightIntercept(call);
      }

      if (isCy.focus(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.FOCUS);
      }

      if (isCy.blur(expressionName)) {
        return createPlaywrightCommand(call.expression, creator, LOCATOR_PROPERTIES.BLUR);
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
}

function createGoTo(creator: Creator, call: ts.CallExpression) {
  return creator.awaitCallExpression(creator.playwrightCommand(COMMANDS.GOTO), call.typeArguments, call.arguments);
}

function createPlaywrightCommand(
  propertyExpression: ts.PropertyAccessExpression,
  creator: Creator,
  command: LOCATOR_PROPERTIES,
  toInjectArgs: ts.Expression[] = []
) {
  const argumentsOfPropertyAccessExpression = getArgumentsOfPropertyAccessExpression(propertyExpression);
  const parent = ts.isCallExpression(propertyExpression.parent) ? propertyExpression.parent : null;
  const expressionName = getExpressionName(propertyExpression);

  const propertyArgs = [...toInjectArgs, ...(parent?.arguments ?? [])];

  if (isCy.isFirst(expressionName) || isCy.isLast(expressionName)) {
    const foundExpression = findGetPropertyExpression(propertyExpression);

    const expression = creator.callExpression(
      creator.propertyAccessExpression(
        creator.playwrightLocatorProperty(
          isCy.isFirst(expressionName) ? LOCATOR_PROPERTIES.FIRST : LOCATOR_PROPERTIES.LAST,
          foundExpression.typeArguments,
          foundExpression.arguments
        ),
        command
      ),
      parent?.typeArguments,
      propertyArgs
    );

    return creator.await(expression);
  }

  let propertyAccessArguments = argumentsOfPropertyAccessExpression.propertyAccessArguments;

  if (isCy.selectByContains(expressionName)) {
    propertyAccessArguments = propertyAccessArguments.map((item) => {
      if (ts.isStringLiteral(item)) return creator.string(`text=${fixString(item.getText())}`);
      return item;
    }) as unknown as ts.NodeArray<ts.Expression>;
  }

  return creator.await(
    creator.playwrightLocatorProperty(
      command,
      argumentsOfPropertyAccessExpression.propertyTypeAccessArguments,
      propertyAccessArguments,
      parent?.typeArguments,
      propertyArgs
    )
  );
}

function createExpectValidation(call: ts.CallExpression, creator: Creator) {
  const propertyExpression = call.expression as ts.PropertyAccessExpression;
  const callArgs = call.arguments.map((arg) => fixString(arg.getText()));
  const { propertyTypeAccessArguments, propertyAccessArguments } =
    getArgumentsOfPropertyAccessExpression(propertyExpression);
  const cyCommandName = getExpressionName(propertyExpression.expression);
  let newExpression = propertyExpression.expression;

  if (isCy.get(cyCommandName) || isCy.isFirst(cyCommandName) || isCy.isLast(cyCommandName)) {
    if (isCy.isFirst(cyCommandName) || isCy.isLast(cyCommandName)) {
      const foundExpression = findGetPropertyExpression(propertyExpression);

      newExpression = creator.playwrightLocatorProperty(
        isCy.isFirst(cyCommandName) ? LOCATOR_PROPERTIES.FIRST : LOCATOR_PROPERTIES.LAST,
        foundExpression.typeArguments,
        foundExpression.arguments
      );
    } else {
      newExpression = creator.callExpression(
        creator.playwrightCommand(COMMANDS.LOCATOR),
        propertyTypeAccessArguments,
        propertyAccessArguments
      );
    }
  }

  let shouldCyValidation = callArgs[0];
  const isNegativeValidation = isCy.validation.isNegativeValidation(shouldCyValidation);

  if (isNegativeValidation) shouldCyValidation = shouldCyValidation.replace('not.', '');

  if (isCy.validation.haveLength(shouldCyValidation)) {
    return creator.expect(
      newExpression,
      VALIDATION.TO_HAVE_COUNT,
      [creator.numeric(callArgs[1])],
      isNegativeValidation
    );
  }

  if (isCy.validation.toHaveText(shouldCyValidation)) {
    return creator.expect(newExpression, VALIDATION.TO_HAVE_TEXT, [call.arguments[1]], isNegativeValidation);
  }

  if (isCy.validation.toHaveClass(shouldCyValidation)) {
    return creator.expect(newExpression, VALIDATION.TO_HAVE_CLASS, [call.arguments[1]], isNegativeValidation);
  }

  if (isCy.validation.beVisible(shouldCyValidation)) {
    return creator.expect(newExpression, VALIDATION.TO_BE_VISIBLE, [], isNegativeValidation);
  }

  if (isCy.validation.toHaveValue(shouldCyValidation)) {
    return creator.expect(newExpression, VALIDATION.TO_HAVE_VALUE, [call.arguments[1]], isNegativeValidation);
  }

  if (isCy.validation.toContain(shouldCyValidation)) {
    return creator.expect(newExpression, VALIDATION.TO_CONTAIN_TEXT, [call.arguments[1]], isNegativeValidation);
  }

  if (isCy.validation.beChecked(shouldCyValidation)) {
    return creator.expect(newExpression, VALIDATION.BE_CHECKED, [], isNegativeValidation);
  }

  if (isCy.validation.beDisabled(shouldCyValidation)) {
    return creator.expect(newExpression, VALIDATION.BE_DISABLED, [], isNegativeValidation);
  }

  if (isCy.validation.haveAttr(shouldCyValidation)) {
    return creator.expect(
      newExpression,
      VALIDATION.TO_HAVE_ATTR,
      callArgs.filter((_, index) => index).map((arg) => creator.string(arg)),
      isNegativeValidation
    );
  }

  throw new Error(`Unknown "${shouldCyValidation}" validation`);
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
  if (isCy.get(expressionName)) {
    return propertyExpression.parent as ts.CallExpression;
  }

  if (ts.isCallExpression(propertyExpression.expression)) {
    return findGetPropertyExpression(propertyExpression.expression.expression as ts.PropertyAccessExpression);
  }

  return propertyExpression.parent as ts.CallExpression;
}

function fixString(str: string) {
  return str.replace(/["'`]/g, '');
}
function isRunnerHook(expressionName: string) {
  return (
    isHook.beforeEach(expressionName) ||
    isHook.it(expressionName) ||
    isHook.afterEach(expressionName) ||
    isHook.describe(expressionName)
  );
}
