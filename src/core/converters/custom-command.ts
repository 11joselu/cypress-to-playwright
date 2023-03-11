import ts from 'typescript';
import { Factory } from './node-factory.js';

export function handle(node: ts.ExpressionStatement, factory: Factory) {
  const call = node.expression as ts.CallExpression;
  const name = call.arguments[0].getText();
  const callback = call.arguments[1] as unknown as ts.FunctionDeclaration;

  return factory.function(fixString(name), callback.parameters, factory.emptyBlock());
}

function fixString(str: string) {
  return str.replace(/["'`]/g, '');
}
