import { test, expect } from '@playwright/test';
export async function addTodo(newItem, page) {
  await page.locator('[data-test=new-todo]').type(`${newItem}{enter}`);
}
