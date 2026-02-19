import {ESLint, type Linter} from 'eslint';
import path from 'node:path';
import cliProgress from 'cli-progress';
import {glob} from 'tinyglobby';
import {type RuleResult} from './types.ts';

/**
 * Creates a rule filter for ESLint.
 * @param {Record<string, unknown>} rules - The rules to filter.
 * @returns {(rule: {ruleId: string}) => boolean} The filter function.
 */
export const createRuleFilter =
	(rules: Record<string, unknown>) =>
	({ruleId}: {ruleId: string}): boolean =>
		Object.prototype.hasOwnProperty.call(rules, ruleId);

/**
 * Runs ESLint on the codebase with the provided rules.
 * @param {string} cwd - The current working directory.
 * @param {Record<string, unknown>} rules - The rules to test.
 * @param {string[]} patterns - The file patterns to lint.
 * @param {string} [configFile] - Optional path to the ESLint config file.
 * @returns {Promise<RuleResult[]>} The linting results.
 */
export const runLint = async (cwd: string, rules: Record<string, unknown>, patterns: string[], configFile?: string): Promise<RuleResult[]> => {
	const eslintOptions: ESLint.Options = {
		cwd,
		cache: false,
		overrideConfigFile: configFile,
		overrideConfig: [
			{
				rules: rules as Linter.RulesRecord,
			},
		],
		ruleFilter: createRuleFilter(rules) as ESLint.Options['ruleFilter'],
	};

	const eslint = new ESLint(eslintOptions);

	console.log('Searching for files...');

	// To mimic ESLint, we expand directories in patterns if they are not already globs
	const globPatterns = patterns.map((p) => {
		if (p === '.') {
			return '**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}';
		}
		// If it's a directory (or at least looks like one and isn't a glob), expand it
		if (!p.includes('*') && !p.includes('?') && !p.includes('[') && !p.includes('{')) {
			// Basic check for directory - if it doesn't have an extension or we can check fs
			// But for simplicity and matching ESLint CLI:
			return path.join(p, '**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}');
		}
		return p;
	});

	const allFiles = await glob(globPatterns, {
		cwd,
		ignore: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
		absolute: true,
	});

	const filesToLint: string[] = [];
	for (const file of allFiles) {
		if (!(await eslint.isPathIgnored(file))) {
			filesToLint.push(file);
		}
	}

	if (filesToLint.length === 0) {
		console.log('No files found to lint.');
		return [];
	}

	const progressBar = new cliProgress.SingleBar({
		format: 'Linting | {bar} | {percentage}% | {value}/{total} Files | ETA: {eta}s',
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		hideCursor: true,
	});

	progressBar.start(filesToLint.length, 0);

	const allResults: ESLint.LintResult[] = [];

	// Chunk size for performance
	const chunkSize = 10;
	for (let i = 0; i < filesToLint.length; i += chunkSize) {
		const chunk = filesToLint.slice(i, i + chunkSize);
		const chunkResults = await eslint.lintFiles(chunk);
		allResults.push(...chunkResults);
		progressBar.update(Math.min(i + chunkSize, filesToLint.length));
	}

	progressBar.stop();

	return processResults(cwd, rules, allResults);
};

/**
 * Processes ESLint results into RuleResult format.
 * @param {string} cwd - Current working directory.
 * @param {Record<string, unknown>} rules - Rules tested.
 * @param {ESLint.LintResult[]} results - Results from ESLint.
 * @returns {RuleResult[]} Processed results.
 */
const processResults = (cwd: string, rules: Record<string, unknown>, results: ESLint.LintResult[]): RuleResult[] => {
	const ruleMap = new Map<string, RuleResult>();

	for (const ruleId of Object.keys(rules)) {
		ruleMap.set(ruleId, {
			ruleId,
			config: rules[ruleId],
			errors: 0,
			warnings: 0,
			fixable: 0,
			details: [],
		});
	}

	for (const res of results) {
		for (const msg of res.messages) {
			const rId = msg.ruleId ?? 'unknown';
			let rr = ruleMap.get(rId);

			if (!rr) {
				rr = {
					ruleId: rId,
					config: 'unknown',
					errors: 0,
					warnings: 0,
					fixable: 0,
					details: [],
				};
				ruleMap.set(rId, rr);
			}

			if (msg.severity === 2) {
				rr.errors++;
			} else {
				rr.warnings++;
			}
			if (msg.fix !== undefined) {
				rr.fixable++;
			}

			rr.details.push({
				filePath: path.relative(cwd, res.filePath),
				line: msg.line,
				column: msg.column,
				message: msg.message,
			});
		}
	}

	return [...ruleMap.values()].filter((r) => r.errors > 0 || r.warnings > 0);
};
