import ts from 'typescript';
import { PLAYWRIGHT_PAGE_NAME, Playwright } from './playwright';

export const nodeCreator = (factory: ts.NodeFactory) => {
  return {
    expressionStatement: createExpressionStatement(factory),
    awaitPlaywrightCommand: createAwaitPlaywrightCommand(factory),
    identifier: createIdentifier(factory),
    propertyAccessExpression: createPropertyAccessExpression(factory),
    arrowFunction: createArrowFunction(factory),
    callExpression: createCallExpression(factory),
    destructuringParameter: createDestructuringParameter(factory),
  };
};

function createExpressionStatement(factory: ts.NodeFactory) {
  return (newExpression: ts.Expression, callExpression: ts.CallExpression) => {
    return factory.createExpressionStatement(
      factory.createCallExpression(newExpression, callExpression.typeArguments, callExpression.arguments)
    );
  };
}

function createAwaitPlaywrightCommand(factory: ts.NodeFactory) {
  return (callExpression: ts.CallExpression | ts.LeftHandSideExpression, commandName: Playwright) => {
    const typeArguments = ts.isCallExpression(callExpression) ? callExpression.typeArguments : undefined;
    const argumentsArr = ts.isCallExpression(callExpression)
      ? callExpression.arguments
      : ([] as unknown as ts.NodeArray<ts.Expression>);
    return createAwaitExpression(
      factory,
      factory.createPropertyAccessExpression(
        factory.createIdentifier(PLAYWRIGHT_PAGE_NAME),
        factory.createIdentifier(commandName)
      ),
      typeArguments,
      argumentsArr
    );
  };
}
function createAwaitExpression(
  factory: ts.NodeFactory,
  expression: ts.PropertyAccessExpression,
  typeArguments: ts.NodeArray<ts.TypeNode> | undefined,
  argumentsArray: ts.NodeArray<ts.Expression>
) {
  return factory.createAwaitExpression(factory.createCallExpression(expression, typeArguments, argumentsArray));
}

function createIdentifier(factory: ts.NodeFactory) {
  return (name: string) => {
    return factory.createIdentifier(name);
  };
}

function createPropertyAccessExpression(factory: ts.NodeFactory) {
  return (identifierName: string, name: string | ts.MemberName) => {
    return factory.createPropertyAccessExpression(createIdentifier(factory)(identifierName), name);
  };
}

function createArrowFunction(factory: ts.NodeFactory) {
  return (body: ts.Block, parameters: ts.ParameterDeclaration[]) => {
    return factory.createArrowFunction(
      undefined,
      undefined,
      parameters,
      undefined,
      factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      body
    );
  };
}

function createCallExpression(factory: ts.NodeFactory) {
  return (
    expression: ts.Expression,
    typeArguments: ts.NodeArray<ts.TypeNode> | undefined,
    argumentsArray: ts.NodeArray<ts.Expression> | ts.Expression[]
  ) => {
    return factory.createCallExpression(expression, typeArguments, argumentsArray);
  };
}

function createDestructuringParameter(factory: ts.NodeFactory) {
  return (parameterName: string) => {
    return factory.createParameterDeclaration(
      [],
      undefined,
      factory.createObjectBindingPattern([
        factory.createBindingElement(undefined, undefined, factory.createIdentifier(parameterName)),
      ])
    );
  };
}
