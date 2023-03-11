export function fixString(str: string) {
  return str.replace(/["'`]/g, '');
}
