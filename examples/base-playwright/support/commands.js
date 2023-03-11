export async function addTodo(newItem, page) {
  await page.locator('[data-test=new-todo]').type(`${newItem}{enter}`);
}
