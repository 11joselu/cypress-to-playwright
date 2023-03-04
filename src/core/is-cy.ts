export const isCy = {
  visit(expressionName: string) {
    return 'cy.visit' === expressionName;
  },
  get(expressionName: string) {
    return 'cy.get' === expressionName;
  },
  click(expressionName: string) {
    return 'cy.get.click' === expressionName;
  },
  should(expressionName: string) {
    return (
      'cy.get.should' === expressionName ||
      'cy.get.first.should' === expressionName ||
      'cy.get.last.should' === expressionName
    );
  },
  startWithCy(expressionName: string) {
    return expressionName.startsWith('cy.');
  },
  validation: {
    haveLength(expressionName: string) {
      return 'have.length' === expressionName;
    },
    toHaveText(expressionName: string) {
      return 'have.text' === expressionName;
    },
  },
  isFirst(expressionName: string) {
    return expressionName.startsWith('cy.get.first');
  },
  isLast(expressionName: string) {
    return expressionName.startsWith('cy.get.last');
  },
};
