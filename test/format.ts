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
