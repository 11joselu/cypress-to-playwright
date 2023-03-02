import { js as beautify } from 'js-beautify';

export function format(result: string) {
  return beautify(result, {
    indent_size: 2,
  });
}
