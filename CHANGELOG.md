# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [0.1.1](https://github.com/rokucommunity/logger/compare/v0.1.0...v0.1.1) 2022-03-04
### Changed
 - `ConsoleTransport` now passes arguments to the console rather than stringifying the entire object, leading to a better developer experience



## [0.1.0](https://github.com/rokucommunity/logger/compare/0dbbaa7afae535e679630cb5cf01fd175524f0fb...v0.1.0) 2021-12-01
### Added
 - initial release.
    - `ConsoleTransport` - logs to the javascript console
    - `FileTransport`- a file logger
    - `QueuedTransport` for logging that happens after a writer is attached.
