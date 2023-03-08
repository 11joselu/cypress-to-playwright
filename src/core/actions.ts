import ts from 'typescript';
import { Creator } from './node-creator.js';
import { isCy } from './is-cy.js';
import { LOCATOR_PROPERTIES } from './playwright.js';

export function handle(expressionName: string, propertyExpression: ts.PropertyAccessExpression, creator: Creator) {
  if (isCy.click(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.CLICK);
  }

  if (isCy.type(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.TYPE);
  }

  if (isCy.check(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.CHECK);
  }

  if (isCy.uncheck(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.UNCHECK);
  }

  if (isCy.select(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.SELECT);
  }

  if (isCy.scrollTo(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.SCROLL_TO);
  }

  if (isCy.scrollIntoView(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.SCROLL_INTO_VIEW);
  }

  if (isCy.dblclick(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.DBL_CLICK);
  }

  if (isCy.clear(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.CLEAR, [creator.string('')]);
  }

  if (isCy.focus(expressionName)) {
    return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.FOCUS);
  }

  return createPlaywrightCommand(propertyExpression, creator, LOCATOR_PROPERTIES.BLUR);
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

function getArgumentsOfPropertyAccessExpression(propertyAccessExpression: ts.PropertyAccessExpression) {
  const callExpression = propertyAccessExpression.expression;
  const propertyTypeAccessArguments = ts.isCallExpression(callExpression) ? callExpression.typeArguments : undefined;
  const propertyAccessArguments = ts.isCallExpression(callExpression)
    ? callExpression.arguments
    : ([] as unknown as ts.NodeArray<ts.Expression>);

  return { propertyTypeAccessArguments, propertyAccessArguments };
}

function getExpressionName(expressions: ts.PropertyAccessExpression | ts.LeftHandSideExpression) {
  return getListOfExpressionName(expressions).reverse().join('.');
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

function fixString(str: string) {
  return str.replace(/["'`]/g, '');
}
