# @RokuCommunity/logger
A node.js logger library for use in the RokuCommunity projects.

[![build status](https://img.shields.io/github/actions/workflow/status/rokucommunity/logger/build.yml?branch=master&logo=github)](https://github.com/rokucommunity/logger/actions/workflows/build.yml?query=branch%3Amaster+workflow%3Abuild)
[![security](https://img.shields.io/github/actions/workflow/status/rokucommunity/logger/security-audit.yml?branch=master&label=security&logo=data:image/svg%2Bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHJlY3QgeD0iMyIgeT0iOCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjciIHJ4PSIxIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik01IDhWNWEzIDMgMCAwIDEgNiAwdjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==)](https://github.com/rokucommunity/logger/actions/workflows/security-audit.yml)
[![coverage status](https://img.shields.io/coveralls/github/rokucommunity/logger?logo=coveralls)](https://coveralls.io/github/rokucommunity/logger?branch=master)
[![monthly downloads](https://img.shields.io/npm/dm/@rokucommunity/logger.svg?sanitize=true&logo=npm&logoColor=&label=npm)](https://npmcharts.com/compare/@rokucommunity/logger?minimal=true)
[![npm version](https://img.shields.io/npm/v/@rokucommunity/logger.svg?logo=npm&label=npm)](https://www.npmjs.com/package/@rokucommunity/logger)
[![license](https://img.shields.io/github/license/rokucommunity/logger.svg)](LICENSE)
[![Slack](https://img.shields.io/badge/Slack-RokuCommunity-4A154B?logo=slack)](https://join.slack.com/t/rokudevelopers/shared_invite/zt-4vw7rg6v-NH46oY7hTktpRIBM_zGvwA)

## Installation

### npm

```bash
npm install @rokucommunity/logger
```

## Usage
```javascript
//import the logger
const logger = require('logger');
logger.logLevel = 'trace';
logger.error('Critical failure');
logger.warn('Something might be wrong');
logger.log('Normal message');
logger.info('Might be interesting');
logger.debug('Probably not interesting');
logger.trace('Definitely not interesting');
```
**Output:**

![image](https://user-images.githubusercontent.com/2544493/142052929-092dcd09-9cf1-4689-b867-4be1337fc02f.png)

## Advanced Usage
### Log inheritance and Prefixing
A `Logger` instance can inherit settings from a parent, only needing to provide settings for the values it wants to override. All loggers inherit from the base `Logger` that is the default export from this module.

Consider the following example:
```javascript
const logger = require('./dist');
logger.log('Hello from logger');

const childLogger = logger.createLogger({prefix: '[Child]'});
childLogger.log('Hello from childLogger');

const grandchildLogger = childLogger.createLogger({prefix: '[Grandchild]'});
grandchildLogger.log('Hello from grandchildLogger');
```

**Output:**
```
[14:38:30.429][LOG] Hello from logger
[14:38:30.432][LOG] [Child] Hello from childLogger
[14:38:30.432][LOG] [Child][Grandchild] Hello from grandchildLogger
```

## Accepted security advisories

Dependencies flagged by `npm audit` that we have reviewed and chosen not to upgrade are tracked in [audit-ci.jsonc](https://github.com/RokuCommunity/logger/blob/master/audit-ci.jsonc). Each entry includes the advisory ID, the date it was added, and the reason it does not apply to this project.
