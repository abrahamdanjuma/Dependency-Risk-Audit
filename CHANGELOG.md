# Changelog

All notable changes to this project are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/) conventions.

## [Unreleased]
### Added
- PEP 639 `license_expression` support as the primary license signal
- Free-text license detection for packages that paste the full license text instead of naming it
- GitHub repo license fallback for packages with no usable PyPI license metadata

### Changed
- License strings are now normalized against a common alias table before being classified as safe/restricted/review

## [0.1.0]
### Added
- Initial release: paste-and-scan audit against PyPI and OSV.dev
- Risk rating (green/amber/red), per-package vulnerability table, ignore list for triaged findings
- Downloadable standalone HTML report
