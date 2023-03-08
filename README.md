<h1 align="center">Welcome to Cypress to Playwright 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/node-%3E%3D16.0.0-blue.svg" />
  <a href="https://github.com/11joselu/cypress-to-playwright#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/11joselu/cypress-to-playwright/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/11joselu/cypress-to-playwright/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/11joselu/Cypress to Playwright" />
  </a>
  <a href="https://twitter.com/11joselu" target="_blank">
    <img alt="Twitter: 11joselu" src="https://img.shields.io/twitter/follow/11joselu.svg?style=social" />
  </a>
</p>

> Automatic migration from cypress to playwright

## Prerequisites

- node >=16.0.0

## Install

```sh
npm install @11joselu/cypress-to-playwright -g
```

## Usage

```sh
npx @11joselu/cypress-to-playwright <cypress_directory>
```

## Supported migrations

### Hooks
| Cypress                 | Playwright                        |
|-------------------------|-----------------------------------|
| `it('text', fn())`      | `test('text', fn({ page }))`      |
| `it.only('text', fn())` | `test.only('text', fn({ page }))` |
| `it.skip('text', fn())` | `test.skip('text', fn({ page }))` |
| `beforeEach(fn())`      | `beforeEach(fn({ page }))`        |

[View more in test file](/test/converter.hooks.test.ts)

### Commands
| Cypress                                                                                             | Playwright                                                  |
|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| `cy.visit()`                                                                                        | `page.goto()`                                               |
| `cy.get()`                                                                                          | `page.locator()`                                            |
| `cy.contains(aText)`                                                                                | `page.locator(text=aText)`                                  |
| `cy.get().first()` or `cy.get().last()`. <br/><br/>Same for `cy.contains`                           | `page.locator().first()` or `page.locator().first()`        |
| `cy.get().click()`, `cy.get().check()`. `cy.get().select()` etc... <br/><br/>Same for `cy.contains` | `page.locator().click()` or `page.locator().check()` etc... |

[in actions test file](/test/converter.cy-validations.test.ts) or [View more in validations test file](/test/converter.cy-actions.test.ts)


### Intercept
| Cypress                                              | Playwright                       |
|------------------------------------------------------|----------------------------------|
| `cy.intercept('<method>', '<url>', <responseObject>` | `page.route(<url>, (route) => {} | 

❌ Alias is not supported. That's means no `wait` support 

[View more in test file](/test/converter.cy-commands.test.ts)


## Author

**Jose Cabrera**

* Website: https://twitter.com/11joselu
* Twitter: [@11joselu](https://twitter.com/11joselu)
* Github: [@11joselu](https://github.com/11joselu)

## Contributing

### Run tests

```sh
npm run test
```

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/11joselu/cypress-to-playwright/issues).



##  License

Copyright © 2023 [Jose Cabrera](https://github.com/11joselu).<br />
This project is [MIT](https://github.com/11joselu/cypress-to-playwright/blob/master/LICENSE) licensed.
