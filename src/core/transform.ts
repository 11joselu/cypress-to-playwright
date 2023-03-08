import ts from 'typescript';
import { Creator, nodeCreator } from './node-creator.js';
import { COMMANDS } from './playwright.js';
import { isCy } from './is-cy.js';
import { isHook } from './is-hook.js';
import * as hook from './hook.js';
import * as actions from './actions.js';
import * as validations from './validations.js';

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
        return hook.handle(expressionName, node, creator);
      }

      if (!isCy.startWithCy(expressionName) || !ts.isPropertyAccessExpression(call.expression)) return node;

      if (isAction(expressionName)) {
        return actions.handle(expressionName, call.expression, creator);
      }

      if (isCy.visit(expressionName)) {
        return createGoTo(creator, call);
      }

      if (isCy.should(expressionName)) {
        return validations.handle(call, creator);
      }

      if (isCy.intercept(expressionName)) {
        return creator.playwrightIntercept(call);
      }

      return node;
    }

    return ts.visitNode(rootNode, visit);
  };
};

function getExpressionName(expressions: ts.PropertyAccessExpression | ts.LeftHandSideExpression) {
  return getListOfExpressionName(expressions).reverse().join('.');
}

function createGoTo(creator: Creator, call: ts.CallExpression) {
  return creator.awaitCallExpression(creator.playwrightCommand(COMMANDS.GOTO), call.typeArguments, call.arguments);
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
function isRunnerHook(expressionName: string) {
  return (
    isHook.beforeEach(expressionName) ||
    isHook.it(expressionName) ||
    isHook.afterEach(expressionName) ||
    isHook.describe(expressionName)
  );
}
function isAction(expressionName: string) {
  return (
    isCy.click(expressionName) ||
    isCy.type(expressionName) ||
    isCy.check(expressionName) ||
    isCy.uncheck(expressionName) ||
    isCy.select(expressionName) ||
    isCy.scrollTo(expressionName) ||
    isCy.scrollIntoView(expressionName) ||
    isCy.dblclick(expressionName) ||
    isCy.clear(expressionName) ||
    isCy.focus(expressionName) ||
    isCy.blur(expressionName)
  );
}
