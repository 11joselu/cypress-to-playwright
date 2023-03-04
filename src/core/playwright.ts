export const enum COMMANDS {
  GOTO = 'goto',
  LOCATOR = 'locator',
}

export const enum LOCATOR_PROPERTIES {
  FIRST = 'first',
  LAST = 'last',
  TYPE = 'type',
  CLICK = 'click',
  CHECK = 'check',
  UNCHECK = 'uncheck',
  SELECT = 'selectOption',
  SCROLL_TO = 'scroll',
  SCROLL_INTO_VIEW = 'scrollIntoViewIfNeeded',
}

export const enum VALIDATION {
  EXPECT = 'expect',
  TO_BE = 'toBe',
  TO_BE_VISIBLE = 'toBeVisible',
  TO_HAVE_TEXT = 'toHaveText',
  TO_HAVE_COUNT = 'toHaveCount',
  TO_HAVE_CLASS = 'toHaveClass',
  TO_HAVE_VALUE = 'toHaveValue',
  TO_CONTAIN_TEXT = 'toContainText',
}

export const PLAYWRIGHT_PAGE_NAME = 'page';

export const enum HOOKS {
  BEFORE_EACH = 'beforeEach',
  TEST = 'test',
}
