export const isHook = {
  beforeEach(expressionName: string) {
    return 'beforeEach' === expressionName;
  },
  afterEach(expressionName: string) {
    return 'afterEach' === expressionName;
  },
  describe(expressionName: string) {
    return 'describe' === expressionName || this.isDescribeSkipOrOnly(expressionName);
  },
  isDescribeSkipOrOnly(expressionName: string) {
    return 'describe.only' === expressionName || 'describe.skip' === expressionName;
  },
  it(expressionName: string) {
    return 'it' === expressionName || this.isItSkipOrOnly(expressionName);
  },
  isItSkipOrOnly(expressionName: string) {
    return 'it.only' === expressionName || 'it.skip' === expressionName;
  },
};
