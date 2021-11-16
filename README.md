# @RokuCommunity/logger
A node.js logger library for use in the RokuCommunity projects.

[![build](https://img.shields.io/github/workflow/status/rokucommunity/logger/build.svg?logo=github)](https://github.com/rokucommunity/logger/actions?query=workflow%3Abuild)
[![Coverage Status](https://coveralls.io/repos/github/rokucommunity/logger/badge.svg?branch=master)](https://coveralls.io/github/rokucommunity/logger?branch=master)
[![NPM Version](https://img.shields.io/npm/v/@rokucommunity/logger.svg)](https://www.npmjs.com/package/@rokucommunity/logger)


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