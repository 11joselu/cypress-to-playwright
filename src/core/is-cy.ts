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
  contains(expressionName: string) {
    return 'cy.contains' === expressionName;
  },
  click(expressionName: string) {
    return ['cy.get.click', 'cy.get.first.click', 'cy.get.last.click', 'cy.contains.click'].includes(expressionName);
  },
  should(expressionName: string) {
    return ['cy.get.should', 'cy.get.first.should', 'cy.get.last.should'].includes(expressionName);
  },
  isFirst(expressionName: string) {
    return expressionName.startsWith('cy.get.first');
  },
  isLast(expressionName: string) {
    return expressionName.startsWith('cy.get.last');
  },
  selectByContains(expressionName: string) {
    const strings = expressionName.split('.');
    return this.contains(strings[0] + '.' + strings[1]);
  },
  type(expressionName: string) {
    return [
      'cy.get.type',
      'cy.get.first.type',
      'cy.get.last.type',
      'cy.contains.type',
      'cy.contains.first.type',
      'cy.contains.last.type',
    ].includes(expressionName);
  },
  check(expressionName: string) {
    return [
      'cy.get.check',
      'cy.get.first.check',
      'cy.get.last.check',
      'cy.contains.check',
      'cy.contains.first.check',
      'cy.contains.last.check',
    ].includes(expressionName);
  },
  uncheck(expressionName: string) {
    return [
      'cy.get.uncheck',
      'cy.get.first.uncheck',
      'cy.get.last.uncheck',
      'cy.contains.uncheck',
      'cy.contains.first.uncheck',
      'cy.contains.last.uncheck',
    ].includes(expressionName);
  },
  select(expressionName: string) {
    return [
      'cy.get.select',
      'cy.get.first.select',
      'cy.get.last.select',
      'cy.contains.select',
      'cy.contains.first.select',
      'cy.contains.last.select',
    ].includes(expressionName);
  },
  scrollTo(expressionName: string) {
    return [
      'cy.get.scrollTo',
      'cy.get.first.scrollTo',
      'cy.get.last.scrollTo',
      'cy.contains.scrollTo',
      'cy.contains.first.scrollTo',
      'cy.contains.last.scrollTo',
    ].includes(expressionName);
  },
  scrollIntoView(expressionName: string) {
    return [
      'cy.get.scrollIntoView',
      'cy.get.first.scrollIntoView',
      'cy.get.last.scrollIntoView',
      'cy.contains.scrollIntoView',
      'cy.contains.first.scrollIntoView',
      'cy.contains.last.scrollIntoView',
    ].includes(expressionName);
  },
  dblclick(expressionName: string) {
    return [
      'cy.get.dblclick',
      'cy.get.first.dblclick',
      'cy.get.last.dblclick',
      'cy.contains.dblclick',
      'cy.contains.first.dblclick',
      'cy.contains.last.dblclick',
    ].includes(expressionName);
  },
  clear(expressionName: string) {
    return [
      'cy.get.clear',
      'cy.get.first.clear',
      'cy.get.last.clear',
      'cy.contains.clear',
      'cy.contains.first.clear',
      'cy.contains.last.clear',
    ].includes(expressionName);
  },
  intercept(expressionName: string) {
    return 'cy.intercept' === expressionName;
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
    beChecked(expressionName: string) {
      return 'be.checked' === expressionName;
    },
    beDisabled(expressionName: string) {
      return 'be.disabled' === expressionName;
    },
    haveAttr(expressionName: string) {
      return 'have.attr' === expressionName;
    },
    isNegativeValidation(expressionName: string) {
      return expressionName.startsWith('not.');
    },
  },
};
