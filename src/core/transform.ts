import ts from 'typescript';
import { Factory, nodeFactory } from './node-factory.js';
import { COMMANDS, PLAYWRIGHT_PAGE_NAME } from './playwright.js';
import { isCy } from './is/is-cy.js';
import { isHook } from './is/is-hook.js';
import * as hook from './hooks.js';
import * as actions from './actions.js';
import * as validations from './validations.js';

export function transform(sourceFile: ts.SourceFile) {
  return (context: ts.TransformationContext) => {
    const factory = nodeFactory(context.factory);
    return (rootNode: ts.Node) => {
      function visit(node: ts.Node): ts.Node {
        node = ts.visitEachChild(node, visit, context);

        if (isFunctionOrArrowFunctionWithCyCode(node)) {
          return convertFunctionNode(node, sourceFile, factory);
        }

        if (!(ts.isExpressionStatement(node) && ts.isCallExpression(node.expression))) {
          return node;
        }

        const call = node.expression;
        const foundFunctionDeclaration = sourceFile.statements.find((st) => {
          return ts.isFunctionDeclaration(st) && st.name?.getText() === call.expression.getText();
        });

        if (foundFunctionDeclaration) {
          if (isFunctionOrArrowFunctionWithCyCode(foundFunctionDeclaration)) {
            return factory.callExpression(factory.identifier(call.expression.getText()), call.typeArguments, [
              factory.identifier(PLAYWRIGHT_PAGE_NAME),
            ]);
          }
        }

        const expressionName = getExpressionName(call);

        if (isRunnerHook(expressionName)) {
          return hook.handle(expressionName, node, factory);
        }

        if (!isCyPropertyCall(expressionName, call)) return node;

        if (isAction(expressionName)) {
          return actions.handle(expressionName, call.expression as ts.PropertyAccessExpression, factory);
        }

        if (isValidation(expressionName)) {
          return validations.handle(call, factory);
        }

        if (isCommand(expressionName)) {
          return commands(expressionName, factory, call) || node;
        }

        return node;
      }

      return ts.visitNode(rootNode, visit);
    };
  };
}

function getExpressionName(expressions: ts.PropertyAccessExpression | ts.LeftHandSideExpression) {
  return getListOfExpressionName(expressions).reverse().join('.');
}

function createGoTo(factory: Factory, call: ts.CallExpression) {
  return factory.awaitCallExpression(factory.playwrightCommand(COMMANDS.GOTO), call.typeArguments, call.arguments);
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

function isCyPropertyCall(expressionName: string, call: ts.CallExpression) {
  return isCy.startWithCy(expressionName) && ts.isPropertyAccessExpression(call.expression);
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

function isValidation(expressionName: string) {
  return isCy.should(expressionName);
}

function isCommand(expressionName: string) {
  return isCy.visit(expressionName) || isCy.intercept(expressionName);
}

function commands(expressionName: string, factory: Factory, call: ts.CallExpression) {
  if (isCy.visit(expressionName)) {
    return createGoTo(factory, call);
  } else if (isCy.intercept(expressionName)) {
    return factory.playwrightIntercept(call);
  }

  return null;
}

function includesCyCodeInFnCode(fnBodyContent: string) {
  return fnBodyContent.includes('cy.');
}
function isFunctionOrArrowFunctionWithCyCode(node: ts.Node | ts.VariableDeclaration) {
  return (
    ts.isFunctionDeclaration(node) ||
    (ts.isVariableDeclaration(node) &&
      ts.isArrowFunction((node as ts.VariableDeclaration).initializer as ts.Expression))
  );
}

function convertFunctionNode(
  node: ts.Node | ts.FunctionDeclaration | ts.VariableDeclaration,
  sourceFile: ts.SourceFile,
  factory: Factory
) {
  if (ts.isFunctionDeclaration(node)) {
    const fnBodyContent = node.getFullText(sourceFile);
    if (includesCyCodeInFnCode(fnBodyContent)) {
      return factory.functionWithPageParameter(node);
    }
  }

  if (
    ts.isVariableDeclaration(node) &&
    ts.isArrowFunction((node as ts.VariableDeclaration).initializer as ts.Expression)
  ) {
    const arrowBodyContent = node.getFullText(sourceFile);
    if (includesCyCodeInFnCode(arrowBodyContent)) {
      return factory.functionWithPageParameter(node);
    }
  }

  return node;
}
