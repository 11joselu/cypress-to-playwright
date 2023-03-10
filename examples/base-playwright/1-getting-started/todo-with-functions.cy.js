test.describe('example to-do app', () => {
    test.beforeEach(async ({ page }) => {
        await gotoPage(page);
    })
    test('displays two todo items by default', async ({ page }) => {
      await validateItemsAsArrowFunction(page);
    });
    test('can add new todo items', async ({ page }) => {
        const newItem = 'Feed the cat';
        await page.locator('[data-test=new-todo]').type(`${newItem}{enter}`)
        await expect(page.locator('.todo-list li')).toHaveCount(3)
        await expect(page.locator('.todo-list li').last()).toHaveText(newItem)
    });
});

async function gotoPage(page) {
  await page.goto("https://example.cypress.io/todo");
}

const validateItemsAsArrowFunction = async(page) => {
  await expect(page.locator(".todo-list li")).toHaveCount(2);
  await expect(page.locator(".todo-list li").first()).toHaveText("Pay electric bill");
  await expect(page.locator(".todo-list li").last()).toHaveText("Walk the dog");
}
