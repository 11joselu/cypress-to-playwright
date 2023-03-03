import ts, { Modifier } from 'typescript';
import { PLAYWRIGHT_PAGE_NAME, COMMANDS, VALIDATION } from './playwright';

export const nodeCreator = (factory: ts.NodeFactory) => {
  return {
    expressionStatement: createExpressionStatement(factory),
    playwrightCommand: createPlaywrightCommand(factory),
    identifier: createIdentifier(factory),
    propertyAccessExpression: createPropertyAccessExpression(factory),
    arrowFunction: createArrowFunction(factory),
    callExpression: createCallExpression(factory),
    destructuringParameter: createDestructuringParameter(factory),
    awaitExpression: createAwaitExpression(factory),
    expect: playwrightExpect(factory),
  };
};

function createExpressionStatement(factory: ts.NodeFactory) {
  return (newExpression: ts.Expression, callExpression: ts.CallExpression) => {
    return factory.createExpressionStatement(
      factory.createCallExpression(newExpression, callExpression.typeArguments, callExpression.arguments)
    );
  };
}

function createPlaywrightCommand(factory: ts.NodeFactory) {
  return (callExpression: ts.CallExpression | ts.LeftHandSideExpression, commandName: COMMANDS) => {
    return factory.createPropertyAccessExpression(
      factory.createIdentifier(PLAYWRIGHT_PAGE_NAME),
      factory.createIdentifier(commandName)
    );
  };
}

function createAwaitExpression(factory: ts.NodeFactory) {
  return (
    expression: ts.PropertyAccessExpression | ts.CallExpression,
    typeArguments: ts.NodeArray<ts.TypeNode> | undefined,
    argumentsArray: ts.NodeArray<ts.Expression>
  ) => {
    return factory.createAwaitExpression(factory.createCallExpression(expression, typeArguments, argumentsArray));
  };
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
  return (body: ts.Block, parameters: ts.ParameterDeclaration[], modifiers?: ts.Modifier[]) => {
    return factory.createArrowFunction(
      modifiers,
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

function playwrightExpect(factory: ts.NodeFactory) {
  return (expression: ts.LeftHandSideExpression) => {
    const awaitExpression = createAwaitExpression(factory);
    return awaitExpression(
      factory.createPropertyAccessExpression(
        factory.createCallExpression(factory.createIdentifier(VALIDATION.EXPECT), undefined, [expression]),
        factory.createIdentifier('toBeVisible')
      ),
      undefined,
      [] as unknown as ts.NodeArray<ts.Expression>
    );
  };
}
