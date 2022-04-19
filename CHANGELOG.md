# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



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
