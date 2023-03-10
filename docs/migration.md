# Supported Code

> **Warning**
> 
> If it does not appear here, it means that it's not supported


## Hooks
| Cypress                                 | Playwright                                   |
|-----------------------------------------|----------------------------------------------|
| `beforeEach(() => {})`                  | `test.beforeEach(() => {})`                  |
| `afterEach(() => {})`                   | `test.afterEach(() => {})`                   |
| `describe("test suite", () => {})`      | `test.describe("test suite", () => {})`      |
| `describe.only("test suite", () => {})` | `test.describe.only("test suite", () => {})` |
| `describe.skip("test suite", () => {})` | `test.describe.skip("test suite", () => {})` |
| `it("test case", () => {})`             | `test("test case", ({page}) => {})`          |
| `it.only("test case", () => {})`        | `test.only("test case", ({page}) => {})`     |
| `it.skip("test case", () => {})`        | `test.skip("test case", ({page}) => {})`     |



## Commands
| Cypress                                                      | Playwright                                              |
|--------------------------------------------------------------|---------------------------------------------------------|
| `cy.intercept('<method>', 'http://localhost/an-url/**', {})` | `page.route('http://localhost/an-url/.*', route => {})` |
| `cy.intercept(<url>)`                                        | ❌                                                       |
| `cy.intercept(routeMatcher)`                                 | ❌                                                       |
| `cy.viewport()`                                              | ❌                                                       |
| `cy.wait()`                                                  | Coming soon                                             |
| `cy.clearCookies()`                                          | Coming soon                                             |
| `cy.setCookie('key', 'value')`                               | Coming soon                                             |
| `cy.title()`                                                 | Coming soon                                             |


## Queries
| Cypress                                                | Playwright                                      |
|--------------------------------------------------------|-------------------------------------------------|
| `cy.get("selector")`                                   | `await page.locator("selector")`                |
| `cy.contains("searchText")`                            | `await page.locator("text=searchText")`         |
| `cy.get("selector").first()`                           | `await page.locator("selector").first()`        |
| `cy.get("selector").last()`                            | `await page.locator("selector").last()`         |
| `cy.contains("searchText").first()`                    | `await page.locator("text=searchText").first()` |
| `cy.contains("searchText").last()`                     | `await page.locator("text=searchText").last()`  |
| `cy.get("selector").parent()`                          | `await page.locator("text=searchText").last()`  |
| `cy.contains("searchText").eq(1)`                      | Coming soon                                     |
| `cy.contains("searchText").find()`                     | ❌                                               |
| `cy.contains("searchText").filter()`                   | ❌                                               |
| `cy.contains("searchText").parent()`                   | ❌                                               |
| `cy.contains("searchText").parents()`                  | ❌                                               |
| ...[and more](https://docs.cypress.io/api/commands/as) |                                                 |


## Actions
| Cypress                           | Playwright                                          |
|-----------------------------------|-----------------------------------------------------|
| `.click()`                        | `await page.locator.click()`                        |
| `.click({force: true})`           | `await page.locator.click({force: true})`           |
| `.type("message")`                | `await page.locator.type("message")`                |
| `.type("message", {force: true})` | `await page.locator.type("message", {force: true})` |
| `.check()`                        | `await page.locator.check()`                        |
| `.check({force: true})`           | `await page.locator.check({force: true})`           |
| `.uncheck()`                      | `await page.locator.uncheck()`                      |
| `.uncheck({force: true})`         | `await page.locator.uncheck({force: true})`         |
| `.select("item")`                 | `await page.locator.select("item")`                 |
| `.scrollTo(250, 250)`             | `await page.locator.scroll(250, 250)`               |
| `.scrollIntoView()`               | `await page.locator.scrollIntoViewIfNeeded()`       |
| `.dblclick()`                     | `await page.locator.dblclick()`                     |
| `.dblclick({force: true})`        | `await page.locator.dblclick({force: true})`        |
| `.clear()`                        | `await page.locator.fill("")`                       |
| `.clear({force: true})`           | `await page.locator.clear("", {force: true})`       |
| `.focus()`                        | `await page.locator.focus()`                        |
| `.blur()`                         | `await page.locator.blur()`                         |


## Validations
| Cypress                                               | Playwright                                                         |
|-------------------------------------------------------|--------------------------------------------------------------------|
| `cy.get().should("be.visible")`                       | `await expect(page.locator()).toBeVisible()`                       |
| `cy.get().should("have.length", 2)`                   | `await expect(page.locator()).toHaveCount(2)`                      |
| `cy.get().should("have.text", "text")`                | `await expect(page.locator()).toHaveText("text")`                  |
| `cy.get().should("have.class", "aClass")`             | `await expect(page.locator()).toHaveClass("aClass")`               |
| `cy.get().should("have.value", "a text message")`     | `await expect(page.locator()).toHaveValue("a text message")`       |
| `cy.get().should("contain", "a text message")`        | `await expect(page.locator()).toContainText("a text message")`     |
| `cy.get().should("be.checked")`                       | `await expect(page.locator()).toBeChecked()`                       |
| `cy.get().should("be.disabled")`                      | `await expect(page.locator()).toBeDisabled()`                      |
| `cy.get().should("have.attr", "type", "text")`        | `await expect(page.locator()).toHaveAttribute('type', 'text')`     |
| `cy.get().should("not.be.visible")`                   | `await expect(page.locator()).not.toBeVisible()`                   |
| `cy.get().should("not.have.length", 2)`               | `await expect(page.locator()).not.toHaveCount(2)`                  |
| `cy.get().should("not.have.text", "text")`            | `await expect(page.locator()).not.toHaveText("text")`              |
| `cy.get().should("not.have.class", "aClass")`         | `await expect(page.locator()).not.toHaveClass("aClass")`           |
| `cy.get().should("not.have.value", "a text message")` | `await expect(page.locator()).not.toHaveValue("a text message")`   |
| `cy.get().should("not.contain", "a text message")`    | `await expect(page.locator()).not.toContainText("a text message")` |
| `cy.get().should("not.be.checked")`                   | `await expect(page.locator()).not.toBeChecked()`                   |
| `cy.get().should("not.be.disabled")`                  | `await expect(page.locator()).not.toBeDisabled()`                  |
| `cy.get().should("not.have.attr", "type", "text")`    | `await expect(page.locator()).not.toHaveAttribute('type', 'text')` |
| `cy.get().should("").should("")`                      | ❌                                                                  |
| `cy.get().should("").and("")`                         | ❌                                                                  |


## Connectors
> **Warning**
> 
> Too complex. Not supported

Example of connectors:

```javascript
 cy.get('.connectors-each-ul>li')
      .each(($el, index, $list) => {
        console.log($el, index, $list)
      })
```