import ts from 'typescript';
import { Factory } from './node-factory.js';

export function handle(node: ts.ExpressionStatement, factory: Factory) {
  const call = node.expression as ts.CallExpression;
  const [name] = call.arguments;

  return factory.function(fixString(name.getText()), [], factory.emptyBlock());
}

function fixString(str: string) {
  return str.replace(/["'`]/g, '');
}
