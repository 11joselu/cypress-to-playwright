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
    return createQueryAction('type').includes(expressionName);
  },
  check(expressionName: string) {
    return createQueryAction('check').includes(expressionName);
  },
  uncheck(expressionName: string) {
    return createQueryAction('uncheck').includes(expressionName);
  },
  select(expressionName: string) {
    return createQueryAction('select').includes(expressionName);
  },
  scrollTo(expressionName: string) {
    return createQueryAction('scrollTo').includes(expressionName);
  },
  scrollIntoView(expressionName: string) {
    return createQueryAction('scrollIntoView').includes(expressionName);
  },
  dblclick(expressionName: string) {
    return createQueryAction('dblclick').includes(expressionName);
  },
  clear(expressionName: string) {
    return createQueryAction('clear').includes(expressionName);
  },
  focus(expressionName: string) {
    return createQueryAction('focus').includes(expressionName);
  },
  blur(expressionName: string) {
    return createQueryAction('blur').includes(expressionName);
  },
  intercept(expressionName: string) {
    return 'cy.intercept' === expressionName;
  },
  wait(expressionName: string) {
    return 'cy.wait' === expressionName;
  },
  clearCookies(expressionName: string) {
    return 'cy.clearCookies' === expressionName;
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

function createQueryAction(action: string) {
  return [
    `cy.get.${action}`,
    `cy.get.first.${action}`,
    `cy.get.last.${action}`,
    `cy.contains.${action}`,
    `cy.contains.first.${action}`,
    `cy.contains.last.${action}`,
  ];
}
