# eslint-try-stricter

`eslint-try-stricter` is a CLI tool designed to help developers incrementally adopt stricter ESLint rules. It allows you to test a set of rules against your codebase and generates a report showing which files would fail, without actually modifying your existing ESLint configuration.

## Features

- **Test Rules in Isolation:** Run specific rules against your project to see their impact.
- **Support for JSON and JSONC:** Load rules from standard JSON or JSON files with comments.
- **Progress Tracking:** Real-time progress bar with ETA during linting.
- **Detailed Reports:** Generates a colored CLI summary and a comprehensive HTML report.
- **Flexible Sorting:** Sort results by rule ID or by severity (total errors + warnings).
- **ESLint 9+ Support:** Built for the new ESLint Flat Config system.
- **Safe Adoption:** No changes are made to your existing `eslint.config.js`.

## Installation

```bash
npm install -g eslint-try-stricter
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
eslint-try-stricter --rules try-rules.json
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

## Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Test
```bash
npm run test
```

## License

MIT
