import ts from 'typescript';
import { PLAYWRIGHT_PAGE_NAME, COMMANDS, VALIDATION } from './playwright';

export type Creator = {
  playwrightCommand(
    callExpression: ts.CallExpression | ts.LeftHandSideExpression,
    commandName: COMMANDS
  ): ts.PropertyAccessExpression;
  identifier(name: string): ts.Identifier;
  expect(
    validationValues: ts.LeftHandSideExpression,
    validationType: Omit<VALIDATION, 'EXPECT'>,
    args?: ts.NodeArray<ts.Expression> | ts.NumericLiteral[]
  ): ts.AwaitExpression;
  awaitExpression(
    expression: ts.PropertyAccessExpression | ts.CallExpression,
    typeArguments: ts.NodeArray<ts.TypeNode> | undefined,
    args: ts.NodeArray<ts.Expression> | ts.NumericLiteral[]
  ): ts.AwaitExpression;
  callExpression(
    expression: ts.Expression,
    typeArguments: ts.NodeArray<ts.TypeNode> | undefined,
    argumentsArray: ts.NodeArray<ts.Expression> | ts.Expression[]
  ): ts.CallExpression;
  expressionStatement(newExpression: ts.Expression, callExpression: ts.CallExpression): ts.ExpressionStatement;
  destructuringParameter(parameterName: string): ts.ParameterDeclaration;
  propertyAccessExpression(identifierName: string, name: string | ts.MemberName): ts.PropertyAccessExpression;
  arrowFunction(body: ts.Block, parameters: ts.ParameterDeclaration[], modifiers?: ts.Modifier[]): ts.ArrowFunction;
  emptyBlock(): ts.Block;
  asyncToken(): ts.ModifierToken<ts.SyntaxKind.AsyncKeyword>;
  variable(name: string, value: ts.Expression, flag?: ts.NodeFlags): ts.VariableStatement;
  block(statements: ts.Statement[]): ts.Block;
  statement(statement: ts.Expression): ts.Statement;
  numeric(value: string): ts.NumericLiteral;
};

export const nodeCreator = (factory: ts.NodeFactory): Creator => {
  return {
    expressionStatement: createExpressionStatement(factory),
    statement: createVariableStatement(factory),
    playwrightCommand: createPlaywrightCommand(factory),
    identifier: createIdentifier(factory),
    propertyAccessExpression: createPropertyAccessExpression(factory),
    arrowFunction: createArrowFunction(factory),
    callExpression: createCallExpression(factory),
    destructuringParameter: createDestructuringParameter(factory),
    awaitExpression: createAwaitExpression(factory),
    expect: playwrightExpect(factory),
    emptyBlock: createEmptyBlock(factory),
    asyncToken: createAsyncToken(factory),
    variable: createVariable(factory),
    block: createBlock(factory),
    numeric: createNumericLiteral(factory),
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
    args: ts.NodeArray<ts.Expression> | ts.NumericLiteral[]
  ) => {
    return factory.createAwaitExpression(factory.createCallExpression(expression, typeArguments, args));
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
  return (
    expression: ts.LeftHandSideExpression,
    validationType: Omit<VALIDATION, 'EXPECT'>,
    args: ts.NodeArray<ts.Expression> | ts.NumericLiteral[] = [] as unknown as ts.NodeArray<ts.Expression>
  ) => {
    const awaitExpression = createAwaitExpression(factory);
    return awaitExpression(
      factory.createPropertyAccessExpression(
        factory.createCallExpression(factory.createIdentifier(VALIDATION.EXPECT), undefined, [expression]),
        factory.createIdentifier(validationType as string)
      ),
      undefined,
      args
    );
  };
}

function createEmptyBlock(factory: ts.NodeFactory) {
  return () => {
    return factory.createBlock([], false);
  };
}

function createAsyncToken(factory: ts.NodeFactory) {
  return () => {
    return factory.createToken(ts.SyntaxKind.AsyncKeyword);
  };
}

function createVariable(factory: ts.NodeFactory) {
  return function (name: string, value: ts.Expression, flag: ts.NodeFlags = ts.NodeFlags.Const) {
    return factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [factory.createVariableDeclaration(factory.createIdentifier(name), undefined, undefined, value)],
        flag
      )
    );
  };
}

function createBlock(factory: ts.NodeFactory) {
  return (statements: ts.Statement[]) => {
    return factory.createBlock(statements, true);
  };
}

function createVariableStatement(factory: ts.NodeFactory) {
  return (statement: ts.Expression): ts.Statement => {
    return factory.createExpressionStatement(statement);
  };
}

function createNumericLiteral(factory: ts.NodeFactory) {
  return (value: string) => {
    return factory.createNumericLiteral(value);
  };
}
