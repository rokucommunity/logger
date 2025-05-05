# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [0.3.11](https://github.com/rokucommunity/logger/compare/0.3.10...v0.3.11) - 2025-05-05
### Changed
 - (chore)  Migrate to Shared CI ([#12](https://github.com/rokucommunity/logger/pull/12))



## [0.3.10](https://github.com/rokucommunity/logger/compare/v0.3.9...v0.3.10) - 2025-03-26
### Changed
 - Added the ability to turn off timestamps in the output and fixed a potental crash if the format string was empty ([#11](https://github.com/rokucommunity/logger/pull/11))



## [0.3.9](https://github.com/rokucommunity/logger/compare/v0.3.8...v0.3.9) - 2024-05-09
### Changed
 - Keep the timestamp braces outside of the colors ([#10](https://github.com/rokucommunity/logger/pull/10))



## [0.3.8](https://github.com/rokucommunity/logger/compare/v0.3.7...v0.3.8) - 2024-05-09
### Added
 - new `timestampFormat` option ([#9](https://github.com/rokucommunity/logger/pull/9))
### Fixed
 - build issues with node14 ([#8](https://github.com/rokucommunity/logger/pull/8))



## [0.3.7](https://github.com/rokucommunity/logger/compare/v0.3.6...v0.3.7) - 2024-04-25
### Added
 - add new `printLogLevel` option ([#7](https://github.com/rokucommunity/logger/pull/7))



## [0.3.6](https://github.com/rokucommunity/logger/compare/v0.3.5...v0.3.6) - 2024-04-23
### Fixed
 - support using `LogLevelNumeric` for `timeStart` ([#6](https://github.com/rokucommunity/logger/pull/6))



## [0.3.5](https://github.com/rokucommunity/logger/compare/v0.3.4...v0.3.5) - 2024-04-23
### Added
 - Add `timeStart` function ([#5](https://github.com/rokucommunity/logger/pull/5))



## [0.3.4](https://github.com/rokucommunity/logger/compare/v0.3.3...v0.3.4) - 2024-04-17
### Changed
 - Add support for numeric logLevel ([#4](https://github.com/rokucommunity/logger/pull/4))



## [0.3.3](https://github.com/rokucommunity/logger/compare/v0.3.2...v0.3.3) - 2023-05-17
### Changed
 - fix dependency and audit issues ([04af7a0](https://github.com/rokucommunity/logger/commit/04af7a0))
 - Fix workflow build link ([b851603](https://github.com/rokucommunity/logger/commit/b851603))
 - Merge branch 'master' of https://github.com/rokucommunity/logger ([cf0ed74](https://github.com/rokucommunity/logger/commit/cf0ed74))
 - Fix build status badge ([b1e490b](https://github.com/rokucommunity/logger/commit/b1e490b))



## [0.3.2](https://github.com/rokucommunity/logger/compare/v0.3.1...v0.3.2) - 2023-03-16
### Changed
 - Fix crash when encountering bigint ([#3](https://github.com/rokucommunity/logger/pull/3))



## [0.3.1](https://github.com/rokucommunity/logger/compare/v0.3.0...v0.3.1) - 2023-01-24
### Changed
 - Fix npm audit issues ([0583c2b](https://github.com/rokucommunity/logger/commit/0583c2b))



## [0.3.0](https://github.com/rokucommunity/logger/compare/v0.2.0...v0.3.0) 2022-04-19
### Fixed
add enableColor option - for enabling/disabling colors, which can be inherited through the logger chain. ([#2](https://github.com/rokucommunity/logger/pull/2))
adds consistentLogLevelWidth option - for enforcing that all logLevel printed text are the same width. ([#2](https://github.com/rokucommunity/logger/pull/2))



## [0.2.0](https://github.com/rokucommunity/logger/compare/v0.1.2...v0.2.0) 2022-03-07
### Fixed
 - add `Logger.isLogLevelEnabled` method



## [0.1.2](https://github.com/rokucommunity/logger/compare/v0.1.1...v0.1.2) 2022-03-07
### Fixed
 - bug where `ConsoleTransport` was adding too many sequential empty spaces



## [0.1.1](https://github.com/rokucommunity/logger/compare/v0.1.0...v0.1.1) 2022-03-04
### Changed
 - `ConsoleTransport` now passes arguments to the console rather than stringifying the entire object, leading to a better developer experience



## [0.1.0](https://github.com/rokucommunity/logger/compare/0dbbaa7afae535e679630cb5cf01fd175524f0fb...v0.1.0) 2021-12-01
### Added
 - initial release.
    - `ConsoleTransport` - logs to the javascript console
    - `FileTransport`- a file logger
    - `QueuedTransport` for logging that happens after a writer is attached.
