export const enum COMMANDS {
  CLICK = 'click',
  GOTO = 'goto',
  LOCATOR = 'locator',
}

export const enum VALIDATION {
  EXPECT = 'expect',
  TO_BE = 'toBe',
  TO_BE_VISIBLE = 'toBeVisible',
  TO_HAVE_TEXT = 'toHaveText',
}

export const PLAYWRIGHT_PAGE_NAME = 'page';

export const enum HOOKS {
  BEFORE_EACH = 'beforeEach',
  TEST = 'test',
}
