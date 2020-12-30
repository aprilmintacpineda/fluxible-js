# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.0.10] - 2017-06-20

See [diff](https://github.com/aprilmintacpineda/fluxible-js/pull/3/files)

### Changed
- Calls to `restore` on `initializeStore` will now merge `initialStore` and `savedStore`; `savedStore` will always take precedence over `initializeStore`. This is to allow for better defaults when adding new values to `restore`.
