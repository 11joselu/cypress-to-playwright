import { test, expect } from '@playwright/test';

export async addTodo(newItem, page) {
  await page.locator('[data-test=new-todo]').type(`${newItem}{enter}`);
});