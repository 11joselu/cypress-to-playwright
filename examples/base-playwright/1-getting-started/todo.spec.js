import { test, expect } from '@playwright/test';
test.describe('example to-do app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.cypress.io/todo');
  });
  test('displays two todo items by default', async ({ page }) => {
    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-list li').first()).toHaveText('Pay electric bill');
    await expect(page.locator('.todo-list li').last()).toHaveText('Walk the dog');
  });
  test('can add new todo items', async ({ page }) => {
    const newItem = 'Feed the cat';
    cy.addTodo(newItem);
    await expect(page.locator('.todo-list li')).toHaveCount(3);
    await expect(page.locator('.todo-list li').last()).toHaveText(newItem);
  });
});
