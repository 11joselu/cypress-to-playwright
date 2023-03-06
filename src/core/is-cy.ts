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
    return isFirstOfLastWithCommand(expressionName, '.click');
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
  type(expressionName: string) {
    return isFirstOfLastWithCommand(expressionName, '.type');
  },
  check(expressionName: string) {
    return isFirstOfLastWithCommand(expressionName, '.check');
  },
  uncheck(expressionName: string) {
    return isFirstOfLastWithCommand(expressionName, '.uncheck');
  },
  select(expressionName: string) {
    return isFirstOfLastWithCommand(expressionName, '.select');
  },
  scrollTo(expressionName: string) {
    return isFirstOfLastWithCommand(expressionName, '.scrollTo');
  },
  scrollIntoView(expressionName: string) {
    return isFirstOfLastWithCommand(expressionName, '.scrollIntoView');
  },
  dblclick(expressionName: string) {
    return isFirstOfLastWithCommand(expressionName, '.dblclick');
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

function isCyWithPropertyAccess(expressionName: string) {
  return isCy.get(expressionName) || isCy.isFirst(expressionName) || isCy.isLast(expressionName);
}

function isFirstOfLastWithCommand(expressionName: string, searchValue: string) {
  const cleanedExpression = expressionName.replace(searchValue, '');
  return isCyWithPropertyAccess(cleanedExpression) && expressionName.endsWith(searchValue);
}
