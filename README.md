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

![](https://github.com/11joselu/cypress-to-playwright/blob/main/docs/migration-example.gif)

## Prerequisites

- node >=16.0.0

## Install

```sh
npm install @11joselu/cypress-to-playwright -D
```

## Usage

```sh
npx @11joselu/cypress-to-playwright <cypress_directory>
```

## How it works

1. It will read all js files found in the <cypress_directory> folder.
2. It will convert each cypress command (supported ones) to the playwright version.
3. It will write the new files in the playwright folder at the same level as the indicated folder.
4. Follow the steps indicated in the script.

## Supported migrations

[Detailed table](/docs/migration.md)



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
