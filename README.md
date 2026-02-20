  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Node.js CI](https://github.com/doberkofler/eslint-try-rules/actions/workflows/node.js.yml/badge.svg)](https://github.com/doberkofler/eslint-try-rules/actions/workflows/node.js.yml)
  [![Coverage Status](https://coveralls.io/repos/github/doberkofler/eslint-try-rules/badge.svg?branch=main)](https://coveralls.io/github/doberkofler/eslint-try-rules?branch=main)

# eslint-try-rules

`eslint-try-rules` is a CLI tool designed to help developers incrementally adopt stricter ESLint rules. It allows you to test a set of rules against your codebase and generates a report showing which files would fail, without actually modifying your existing ESLint configuration.

## Features

- **Test Rules in Isolation:** Run specific rules against your project to see their impact.
- **Support for JSON and JSONC:** Load rules from standard JSON or JSON files with comments.
- **Progress Tracking:** Real-time progress bar with ETA during linting.
- **Detailed Reports:** Generates a colored CLI summary and a comprehensive HTML report.
- **Flexible Sorting:** Sort results by rule ID or by severity (total errors + warnings).
- **ESLint 9+ Support:** Built for the new ESLint Flat Config system.
- **Safe Adoption:** No changes are made to your existing `eslint.config.js`.

## Installation

You can run it directly using `npx`:

```bash
npx eslint-try-rules --rules try-rules.json
```

Or install it globally:

```bash
npm install -g eslint-try-rules
```

Or as a development dependency in your project:

```bash
npm install -D eslint-try-rules
```

## Usage

Create a `try-rules.json` (or `.jsonc`) file with the rules you want to test:

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "curly": "error"
}
```

Run the tool:

```bash
eslint-try-rules --rules try-rules.json
```

### Try the Example

You can run an example against this project's own source code:

```bash
npm run example
```

This uses the rules defined in `example/try-rules.jsonc`.

### Options

- `--rules <path>`: (Required) Path to the JSON/JSONC file containing the rules to test.
- `--config <path>`: (Optional) Path to your project's ESLint configuration file (e.g., `eslint.config.js`).
- `--sort <rule|severity>`: (Optional) Sort results by rule ID (default) or by severity (total errors + warnings).

## Output

The tool provides:
1.  **CLI Report:** A summary of errors and warnings per rule, including file locations.
2.  **HTML Report:** A detailed, interactive HTML report saved as `eslint-incremental-report.html`.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions on how to build, test, and contribute to this project.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/eslint-try-rules.svg
[npm-url]: https://npmjs.org/package/eslint-try-rules

[downloads-image]: https://img.shields.io/npm/dm/eslint-try-rules.svg
[downloads-url]: https://npmjs.org/package/eslint-try-rules
