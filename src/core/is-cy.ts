export const isCy = {
  startWithCy(expressionName: string) {
    return expressionName.startsWith('cy.');
  },
  visit(expressionName: string) {
    return 'cy.visit' === expressionName;
  },
  get(expressionName: string) {
    return 'cy.get' === expressionName;
  },
  click(expressionName: string) {
    const cleanedExpression = expressionName.replace('.click', '');
    return isCyWithPropertyAccess(cleanedExpression) && expressionName.endsWith('.click');
  },
  should(expressionName: string) {
    return expressionName.endsWith('.should');
  },
  isFirst(expressionName: string) {
    return expressionName.startsWith('cy.get.first');
  },
  isLast(expressionName: string) {
    return expressionName.startsWith('cy.get.last');
  },
  validation: {
    haveLength(expressionName: string) {
      return 'have.length' === expressionName;
    },
    toHaveText(expressionName: string) {
      return 'have.text' === expressionName;
    },
  },
};

function isCyWithPropertyAccess(expressionName: string) {
  return isCy.get(expressionName) || isCy.isFirst(expressionName);
}
