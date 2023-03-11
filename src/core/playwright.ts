export const enum COMMANDS {
  GOTO = 'goto',
  LOCATOR = 'locator',
  WAIT = 'waitForTimeout',
  CONTEXT = 'context',
  CLEAR_COOKIES = 'clearCookies',
}

export const enum ROUTE {
  NAME = 'route',
  FULFILL = 'fulfill',
  REQUEST = 'request',
  STATUS = 'status',
  BODY = 'body',
  FALLBACK = 'fallback',

  METHOD = 'method',
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
  DBL_CLICK = 'dblclick',
  CLEAR = 'fill',
  FOCUS = 'focus',
  BLUR = 'blur',
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
  BE_CHECKED = 'toBeChecked',
  BE_DISABLED = 'toBeDisabled',
  TO_HAVE_ATTR = 'toHaveAttribute',
}

export const PLAYWRIGHT_PAGE_NAME = 'page';

export const enum HOOKS {
  BEFORE_EACH = 'beforeEach',
  TEST = 'test',
  AFTER_EACH = 'afterEach',
  DESCRIBE = 'describe',
}
