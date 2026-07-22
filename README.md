# Python Dependency Audit

A small, static tool that checks a `requirements.txt` against [PyPI](https://pypi.org) and [OSV.dev](https://osv.dev) for known vulnerabilities and license risk — entirely in the browser, no install and no build step.

## Why

Most dependency-audit tools want a CLI, a lockfile, and a CI pipeline. This one is for the moment before all that: paste your requirements, get a plain-English read on what you're pulling in, in the time it takes to make coffee.

## Features

- **Vulnerability scanning** against the OSV.dev database, with severity and the version that fixes each issue
- **License detection** that goes further than raw PyPI metadata: it reads [PEP 639](https://peps.python.org/pep-0639/) license expressions, trove classifiers, and free-text license fields (including full license text some packages paste in instead of naming it), and falls back to the linked GitHub repo's detected license when PyPI has nothing usable
- **Overall risk rating** (green / amber / red) based on the worst vulnerability severity and whether any restricted copyleft license shows up
- **Ignore list** for vulnerability IDs you've already triaged and accepted
- **Exportable HTML report** for sharing or archiving a scan
- Zero dependencies, zero build step — open `index.html` and go

## Usage

1. Open `index.html` in a browser (double-click it, or serve the folder — both work)
2. Paste the contents of your `requirements.txt`, or upload the file
3. Click **Run audit**
4. Review the findings, download the report if you want a copy

## Limitations

- Version ranges (`>=2.0`, `~=1.4`) are checked against the package's latest release, not full range resolution. Pin with `==` for an exact check.
- License detection is best-effort. Some packages genuinely don't publish a machine-readable license anywhere PyPI or GitHub can surface — those show as "Unknown" rather than a guess.
- The GitHub fallback uses GitHub's unauthenticated API, which is rate-limited; on very large manifests it may not reach every package.
- This checks direct dependencies as listed, not their transitive dependencies.

## Project structure

```
.
├── index.html            entry point
├── css/
│   └── style.css         all styling
├── js/
│   ├── constants.js      license lists, classifier map, text signatures
│   ├── parser.js         requirements.txt parsing
│   ├── license.js        license resolution chain
│   ├── pypi.js           PyPI registry client
│   ├── osv.js            OSV.dev vulnerability client
│   ├── audit.js          per-package orchestration, concurrency pool
│   ├── report.js         rendering + standalone report export
│   └── app.js            DOM wiring
└── assets/
    └── favicon.svg
```

## License

All rights reserved — free to use and modify for your own purposes, not to redistribute or claim as your own. See [LICENSE](LICENSE) for the exact terms.
