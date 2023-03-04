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
    toHaveClass(expressionName: string) {
      return 'have.class' === expressionName;
    },
    beVisible(expressionName: string) {
      return 'be.visible' === expressionName;
    },
    toHaveValue(expressionName: string) {
      return 'have.value' === expressionName;
    },
    toContain(expressionName: string) {
      return 'contain' === expressionName;
    },
  },
  type(expressionName: string) {
    return 'cy.get.type' === expressionName;
  },
  check(expressionName: string) {
    return 'cy.get.check' === expressionName;
  },
  uncheck(expressionName: string) {
    return 'cy.get.uncheck' === expressionName;
  },
  select(expressionName: string) {
    return 'cy.get.select' === expressionName;
  },
};

function isCyWithPropertyAccess(expressionName: string) {
  return isCy.get(expressionName) || isCy.isFirst(expressionName) || isCy.isLast(expressionName);
}
