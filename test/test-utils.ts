import prettier from 'prettier';

export function format(result: string) {
  return prettier.format(result, {
    trailingComma: 'es5',
    tabWidth: 2,
    semi: true,
    singleQuote: true,
    parser: 'babel',
  });
}

export function createOption(cy: string, playwright: string) {
  return { cy, playwright };
}
