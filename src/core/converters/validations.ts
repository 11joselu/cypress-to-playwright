import ts from 'typescript';
import { Factory } from './node-factory.js';
import { isCy } from '../is/is-cy.js';
import { COMMANDS, LOCATOR_PROPERTIES, VALIDATION } from '../playwright.js';
import { fixString } from './fix-string.js';

export function handle(call: ts.CallExpression, factory: Factory) {
  const propertyExpression = call.expression as ts.PropertyAccessExpression;
  const callArgs = call.arguments.map((arg) => fixString(arg.getText()));
  const { propertyTypeAccessArguments, propertyAccessArguments } =
    getArgumentsOfPropertyAccessExpression(propertyExpression);
  const cyCommandName = getExpressionName(propertyExpression.expression);
  let newExpression = propertyExpression.expression;

  if (isCy.get(cyCommandName) || isCy.isFirst(cyCommandName) || isCy.isLast(cyCommandName)) {
    if (isCy.isFirst(cyCommandName) || isCy.isLast(cyCommandName)) {
      const foundExpression = findGetPropertyExpression(propertyExpression);

      newExpression = factory.playwrightLocatorProperty(
        isCy.isFirst(cyCommandName) ? LOCATOR_PROPERTIES.FIRST : LOCATOR_PROPERTIES.LAST,
        foundExpression.typeArguments,
        foundExpression.arguments
      );
    } else {
      newExpression = factory.callExpression(
        factory.playwrightCommand(COMMANDS.LOCATOR),
        propertyTypeAccessArguments,
        propertyAccessArguments
      );
    }
  }

  let shouldCyValidation = callArgs[0];
  const isNegativeValidation = isCy.validation.isNegativeValidation(shouldCyValidation);

  if (isNegativeValidation) shouldCyValidation = shouldCyValidation.replace('not.', '');

  if (isCy.validation.haveLength(shouldCyValidation)) {
    return factory.expect(
      newExpression,
      VALIDATION.TO_HAVE_COUNT,
      [factory.numeric(callArgs[1])],
      isNegativeValidation
    );
  }

  if (isCy.validation.toHaveText(shouldCyValidation)) {
    return factory.expect(newExpression, VALIDATION.TO_HAVE_TEXT, [call.arguments[1]], isNegativeValidation);
  }

  if (isCy.validation.toHaveClass(shouldCyValidation)) {
    return factory.expect(newExpression, VALIDATION.TO_HAVE_CLASS, [call.arguments[1]], isNegativeValidation);
  }

  if (isCy.validation.beVisible(shouldCyValidation)) {
    return factory.expect(newExpression, VALIDATION.TO_BE_VISIBLE, [], isNegativeValidation);
  }

  if (isCy.validation.toHaveValue(shouldCyValidation)) {
    return factory.expect(newExpression, VALIDATION.TO_HAVE_VALUE, [call.arguments[1]], isNegativeValidation);
  }

  if (isCy.validation.toContain(shouldCyValidation)) {
    return factory.expect(newExpression, VALIDATION.TO_CONTAIN_TEXT, [call.arguments[1]], isNegativeValidation);
  }

  if (isCy.validation.beChecked(shouldCyValidation)) {
    return factory.expect(newExpression, VALIDATION.BE_CHECKED, [], isNegativeValidation);
  }

  if (isCy.validation.beDisabled(shouldCyValidation)) {
    return factory.expect(newExpression, VALIDATION.BE_DISABLED, [], isNegativeValidation);
  }

  if (isCy.validation.haveAttr(shouldCyValidation)) {
    return factory.expect(
      newExpression,
      VALIDATION.TO_HAVE_ATTR,
      callArgs.filter((_, index) => index).map((arg) => factory.string(arg)),
      isNegativeValidation
    );
  }

  return undefined;
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
