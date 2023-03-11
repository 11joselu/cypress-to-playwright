import ts, { Expression, ModifierLike, ParameterDeclaration } from 'typescript';
import { COMMANDS, LOCATOR_PROPERTIES, PLAYWRIGHT_PAGE_NAME, ROUTE, VALIDATION } from '../playwright.js';
import { fixString } from './fix-string.js';

type Args = ts.NodeArray<ts.Expression> | ts.NumericLiteral[] | ts.StringLiteral[] | ts.Expression[];

export type Factory = {
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
  exportToken(): ts.ModifierToken<ts.SyntaxKind.ExportKeyword>;
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
  playwrightIntercept(node: ts.CallExpression): ts.CallExpression;
  functionWithPageParameter(
    node: ts.FunctionDeclaration | ts.VariableDeclaration
  ): ts.FunctionDeclaration | ts.VariableDeclaration;
  parameter: (name: string) => ts.ParameterDeclaration;
  function(
    name: string,
    parameters: ts.ParameterDeclaration[] | ts.NodeArray<ts.ParameterDeclaration>,
    body: ts.Block,
    modifiers?: ts.ModifierLike[]
  ): ts.FunctionDeclaration;
};

export const nodeFactory = (factory: ts.NodeFactory): Factory => {
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
    playwrightIntercept: createPlaywrightIntercept(factory),
    functionWithPageParameter: createFunctionWithPageParameter(factory),
    parameter: createParameter(factory),
    function: createFunction(factory),
    exportToken: createExportToken(factory),
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

function createParameter(factory: ts.NodeFactory) {
  return function (name: string) {
    return factory.createParameterDeclaration(undefined, undefined, createIdentifier(factory)(name));
  };
}

function createObjectLiteral(factory: ts.NodeFactory) {
  return function (properties: ts.PropertyAssignment[]) {
    return factory.createObjectLiteralExpression(properties);
  };
}

function createProperty(factory: ts.NodeFactory) {
  return function (name: string, value: ts.NumericLiteral | ts.Identifier) {
    return factory.createPropertyAssignment(name, value);
  };
}

function createIfStatement(factory: ts.NodeFactory) {
  return function (expression: Expression, thenStatement: ts.Statement, elseStatement?: ts.Statement) {
    return factory.createIfStatement(expression, thenStatement, elseStatement);
  };
}

function createToken(factory: ts.NodeFactory) {
  return function (kind: ts.SyntaxKind.ExclamationEqualsEqualsToken) {
    return factory.createToken(kind);
  };
}

function createReturn(factory: ts.NodeFactory) {
  return function (value?: ts.Expression) {
    return factory.createReturnStatement(value);
  };
}

function createBinaryExpression(factory: ts.NodeFactory) {
  return function (
    expression: ts.CallExpression,
    token: ts.Token<ts.SyntaxKind.ExclamationEqualsEqualsToken>,
    stringLiteral: ts.StringLiteral
  ) {
    return factory.createBinaryExpression(expression, token, stringLiteral);
  };
}

function createPlaywrightIntercept(factory: ts.NodeFactory) {
  function isRest(arg: ts.Expression) {
    return ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'].includes(fixString(arg.getText().toUpperCase()));
  }

  const stringLiteral = createStringLiteral(factory);
  const identifier = createIdentifier(factory);
  const numericLiteral = createNumericLiteral(factory);
  const propertyAccessExpression = createPropertyAccessExpression(factory);
  const callExpression = createCallExpression(factory);
  const arrowFunction = createArrowFunction(factory);
  const block = createBlock(factory);
  const statement = createStatement(factory);
  const objectLiteralExpression = createObjectLiteral(factory);
  const propertyAssignment = createProperty(factory);
  const parameterDeclaration = createParameter(factory);
  const ifStatement = createIfStatement(factory);
  const binaryExpression = createBinaryExpression(factory);
  const token = createToken(factory);
  const returnStatement = createReturn(factory);
  const callOfProperty = createCallOfProperty(factory);

  return function createRouteIntercept(node: ts.CallExpression) {
    const method = node.arguments.find((arg) => isRest(arg));
    const urlArg = node.arguments.find((arg) => !isRest(arg) && !ts.isObjectLiteralExpression(arg)) as ts.StringLiteral;
    // Convert Cypress-style URL pattern to RegExp
    const url = urlArg.text.replace(/\*\*/g, '.*');
    const optionsArg = node.arguments.find(ts.isObjectLiteralExpression) as ts.ObjectLiteralExpression;
    const bodyProp = optionsArg.properties.find((prop) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return ts.isIdentifier(prop.name) && prop.name.text === 'body';
    }) as ts.PropertyAssignment;
    const statusCodeProp = optionsArg.properties.find((prop) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return ts.isIdentifier(prop.name) && prop.name.text === 'statusCode';
    }) as ts.PropertyAssignment;
    const body = identifier(bodyProp.initializer.getText());
    const statusCode = numericLiteral(statusCodeProp.initializer.getText());
    const bodyExpressions = [
      statement(
        callOfProperty(ROUTE.NAME, ROUTE.FULFILL, [
          objectLiteralExpression([propertyAssignment(ROUTE.STATUS, statusCode), propertyAssignment(ROUTE.BODY, body)]),
        ])
      ),
    ];

    if (method) {
      const requestCallExpression = callExpression(
        propertyAccessExpression(callOfProperty(ROUTE.NAME, ROUTE.REQUEST, []), identifier(ROUTE.METHOD)),
        undefined,
        []
      );
      const bodyIfStatement = ifStatement(
        binaryExpression(
          requestCallExpression,
          token(ts.SyntaxKind.ExclamationEqualsEqualsToken),
          stringLiteral(fixString(method.getFullText()))
        ),
        block([statement(callOfProperty(ROUTE.NAME, ROUTE.FALLBACK, [])), returnStatement(undefined)]),
        undefined
      );

      bodyExpressions.unshift(bodyIfStatement);
    }

    return callOfProperty(PLAYWRIGHT_PAGE_NAME, ROUTE.NAME, [
      stringLiteral(url),
      arrowFunction(block(bodyExpressions), [parameterDeclaration(ROUTE.NAME)]),
    ]);
  };
}

function createCallOfProperty(factory: ts.NodeFactory) {
  const identifier = createIdentifier(factory);
  const propertyAccessExpression = createPropertyAccessExpression(factory);
  const callExpression = createCallExpression(factory);

  return (
    objIdentifier: ROUTE | typeof PLAYWRIGHT_PAGE_NAME,
    property: ROUTE,
    objectLiteralExpressions: ts.Expression[]
  ) => {
    return callExpression(
      propertyAccessExpression(identifier(objIdentifier), property),
      undefined,
      objectLiteralExpressions
    );
  };
}

function createFunctionWithPageParameter(factory: ts.NodeFactory) {
  return function (node: ts.FunctionDeclaration | ts.VariableDeclaration) {
    const isVariableDeclaration = ts.isVariableDeclaration(node);
    // is there are any possibility to be unknown? How?
    const name = isVariableDeclaration ? node.name.getText() : node.name?.escapedText || 'unknown';
    const typeParameters = isVariableDeclaration
      ? (node.initializer as ts.ArrowFunction).typeParameters
      : node.typeParameters;
    const parameters = isVariableDeclaration ? (node.initializer as ts.ArrowFunction).parameters : node.parameters;

    if (isVariableDeclaration) {
      return factory.createVariableDeclaration(
        name,
        undefined,
        undefined,
        createArrowFunction(factory)(
          (node.initializer as ts.ArrowFunction).body as ts.Block,
          [createParameter(factory)(PLAYWRIGHT_PAGE_NAME), ...(parameters as unknown as ts.ParameterDeclaration[])],
          [createAsyncToken(factory)()]
        )
      );
    }

    return factory.createFunctionDeclaration(
      [createAsyncToken(factory)()],
      undefined,
      createIdentifier(factory)(name),
      typeParameters,
      [createParameter(factory)(PLAYWRIGHT_PAGE_NAME), ...parameters],
      undefined,
      ts.isFunctionDeclaration(node) ? node.body : createEmptyBlock(factory)()
    );
  };
}

function createFunction(factory: ts.NodeFactory) {
  return (
    name: string,
    parameters: ts.ParameterDeclaration[] | ts.NodeArray<ts.ParameterDeclaration>,
    body: ts.Block,
    modifiers: ts.ModifierLike[] = []
  ) => {
    return factory.createFunctionDeclaration(
      modifiers,
      undefined,
      createIdentifier(factory)(name),
      undefined,
      parameters,
      undefined,
      body
    );
  };
}

function createExportToken(factory: ts.NodeFactory) {
  return () => {
    return factory.createToken(ts.SyntaxKind.ExportKeyword);
  };
}
