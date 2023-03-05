import ts from 'typescript';
import { PLAYWRIGHT_PAGE_NAME, COMMANDS, VALIDATION, LOCATOR_PROPERTIES } from './playwright';

type Args = ts.NodeArray<ts.Expression> | ts.NumericLiteral[] | ts.StringLiteral[] | ts.Expression[];

export type Creator = {
  callExpressionStatement(newExpression: ts.Expression, callExpression: ts.CallExpression): ts.Statement;
  statement(statement: ts.Expression): ts.Statement;
  propertyAccessExpression(
    expression: string | ts.Expression,
    name: string | ts.MemberName
  ): ts.PropertyAccessExpression;
  identifier(name: string): ts.Identifier;
  arrowFunction(body: ts.Block, parameters: ts.ParameterDeclaration[], modifiers?: ts.Modifier[]): ts.ArrowFunction;
  callExpression(
    expression: ts.Expression,
    typeArguments: ts.NodeArray<ts.TypeNode> | undefined,
    argumentsArray: ts.NodeArray<ts.Expression> | ts.Expression[]
  ): ts.CallExpression;
  destructuringParameter(parameterName: string): ts.ParameterDeclaration;
  awaitCallExpression(
    expression: ts.PropertyAccessExpression | ts.CallExpression,
    typeArguments?: ts.NodeArray<ts.TypeNode> | undefined,
    args?: ts.NodeArray<ts.Expression> | ts.NumericLiteral[]
  ): ts.AwaitExpression;
  await(expression: ts.CallExpression): ts.AwaitExpression;
  emptyBlock(): ts.Block;
  asyncToken(): ts.ModifierToken<ts.SyntaxKind.AsyncKeyword>;
  variable(name: string, value: ts.Expression, flag?: ts.NodeFlags): ts.VariableStatement;
  block(statements: ts.Statement[]): ts.Block;
  numeric(value: string): ts.NumericLiteral;
  string(value: string): ts.StringLiteral;
  expect(
    validationValues: ts.LeftHandSideExpression,
    validationType: Omit<VALIDATION, 'EXPECT'>,
    validationArgs?: Args,
    isNegative?: boolean
  ): ts.AwaitExpression;
  playwrightCommand(commandName: COMMANDS): ts.PropertyAccessExpression;
  playwrightLocatorProperty(
    property: LOCATOR_PROPERTIES,
    locatorTypeArgs?: ts.NodeArray<ts.TypeNode> | undefined,
    locatorArgs?: ts.NodeArray<ts.Expression> | ts.Expression[],
    propertyTypeArgs?: ts.NodeArray<ts.TypeNode> | undefined,
    propertyArgs?: ts.NodeArray<ts.Expression> | ts.Expression[]
  ): ts.CallExpression;
};

export const nodeCreator = (factory: ts.NodeFactory): Creator => {
  return {
    callExpressionStatement: createWrappedCallExpressionInStatement(factory),
    statement: createStatement(factory),
    propertyAccessExpression: createPropertyAccessExpression(factory),
    identifier: createIdentifier(factory),
    arrowFunction: createArrowFunction(factory),
    callExpression: createCallExpression(factory),
    destructuringParameter: createDestructuringParameter(factory),
    awaitCallExpression: createAwaitCallExpression(factory),
    await: createAwait(factory),
    emptyBlock: createEmptyBlock(factory),
    asyncToken: createAsyncToken(factory),
    variable: createVariable(factory),
    block: createBlock(factory),
    numeric: createNumericLiteral(factory),
    string: createStringLiteral(factory),
    expect: createPlaywrightExpect(factory),
    playwrightCommand: createPlaywrightCommand(factory),
    playwrightLocatorProperty: createPlaywrightLocatorProperty(factory),
  };
};

function createWrappedCallExpressionInStatement(factory: ts.NodeFactory) {
  const statement = createStatement(factory);
  return (newExpression: ts.Expression, callExpression: ts.CallExpression) => {
    return statement(
      factory.createCallExpression(newExpression, callExpression.typeArguments, callExpression.arguments)
    );
  };
}

function createStatement(factory: ts.NodeFactory) {
  return (statement: ts.Expression): ts.Statement => {
    return factory.createExpressionStatement(statement);
  };
}

function createPropertyAccessExpression(factory: ts.NodeFactory) {
  const identifier = createIdentifier(factory);
  return (expression: string | ts.Expression, name: string | ts.MemberName) => {
    let newExpression: ts.Identifier | ts.Expression;
    if (typeof expression === 'string') {
      newExpression = identifier(expression);
    } else {
      newExpression = expression;
    }
    return factory.createPropertyAccessExpression(newExpression, name);
  };
}

function createAwaitCallExpression(factory: ts.NodeFactory) {
  const callExpression = createCallExpression(factory);
  return (
    expression: ts.PropertyAccessExpression | ts.CallExpression,
    typeArguments?: ts.NodeArray<ts.TypeNode>,
    args?: Args
  ) => {
    return factory.createAwaitExpression(callExpression(expression, typeArguments, args || ([] as Args)));
  };
}

function createAwait(factory: ts.NodeFactory) {
  return (expression: ts.PropertyAccessExpression | ts.CallExpression) => {
    return factory.createAwaitExpression(expression);
  };
}

function createIdentifier(factory: ts.NodeFactory) {
  return (name: string) => {
    return factory.createIdentifier(name);
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
  const identifier = createIdentifier(factory);
  return (parameterName: string) => {
    return factory.createParameterDeclaration(
      [],
      undefined,
      factory.createObjectBindingPattern([
        factory.createBindingElement(undefined, undefined, identifier(parameterName)),
      ])
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
  const identifier = createIdentifier(factory);
  return function (name: string, value: ts.Expression, flag: ts.NodeFlags = ts.NodeFlags.Const) {
    return factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [factory.createVariableDeclaration(identifier(name), undefined, undefined, value)],
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

function createNumericLiteral(factory: ts.NodeFactory) {
  return (value: string) => {
    return factory.createNumericLiteral(value);
  };
}

function createStringLiteral(factory: ts.NodeFactory) {
  return (value: string) => {
    return factory.createStringLiteral(value);
  };
}

function createPlaywrightExpect(factory: ts.NodeFactory) {
  return (
    expression: ts.LeftHandSideExpression,
    validationType: Omit<VALIDATION, 'EXPECT'>,
    validationArgs:
      | ts.NodeArray<ts.Expression>
      | ts.NumericLiteral[]
      | ts.StringLiteral[] = [] as unknown as ts.NodeArray<ts.Expression>,
    isNegative = false
  ) => {
    const awaitExpression = createAwaitCallExpression(factory);
    const identifier = createIdentifier(factory);
    const callExpression = createCallExpression(factory);

    if (isNegative) {
      return awaitExpression(
        factory.createPropertyAccessExpression(
          factory.createPropertyAccessExpression(
            callExpression(identifier(VALIDATION.EXPECT), undefined, [expression]),
            factory.createIdentifier('not')
          ),
          identifier(validationType as string)
        ),
        undefined,
        validationArgs
      );
    }

    return awaitExpression(
      factory.createPropertyAccessExpression(
        callExpression(identifier(VALIDATION.EXPECT), undefined, [expression]),
        identifier(validationType as string)
      ),
      undefined,
      validationArgs
    );
  };
}

function createPlaywrightCommand(factory: ts.NodeFactory) {
  const propertyAccessExpression = createPropertyAccessExpression(factory);
  const identifier = createIdentifier(factory);
  return (commandName: COMMANDS) => {
    return propertyAccessExpression(PLAYWRIGHT_PAGE_NAME, identifier(commandName));
  };
}

function createPlaywrightLocatorProperty(factory: ts.NodeFactory) {
  const callExpression = createCallExpression(factory);
  const propertyAccessExpression = createPropertyAccessExpression(factory);
  const playwrightCommand = createPlaywrightCommand(factory);
  return (
    property: LOCATOR_PROPERTIES,
    locatorTypeArgs: ts.NodeArray<ts.TypeNode> | undefined = undefined,
    locatorArgs: ts.NodeArray<ts.Expression> | ts.Expression[] = [] as unknown as ts.NodeArray<ts.Expression>,
    propertyTypeArgs: ts.NodeArray<ts.TypeNode> | undefined = undefined,
    propertyArgs: ts.NodeArray<ts.Expression> | ts.Expression[] = [] as unknown as ts.NodeArray<ts.Expression>
  ) => {
    return callExpression(
      propertyAccessExpression(
        callExpression(playwrightCommand(COMMANDS.LOCATOR), locatorTypeArgs, locatorArgs),
        property
      ),
      propertyTypeArgs,
      propertyArgs
    );
  };
}
