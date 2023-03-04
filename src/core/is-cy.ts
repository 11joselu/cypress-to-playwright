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
    return 'cy.get.should' === expressionName;
  },
  startWithCy(expressionName: string) {
    return expressionName.startsWith('cy.');
  },
};
