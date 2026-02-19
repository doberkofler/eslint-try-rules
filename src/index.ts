#!/usr/bin/env node
import {writeFileSync} from 'node:fs';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import {Command} from 'commander';
import ansis from 'ansis';
import {runLint} from './lint.ts';
import {generateHtml} from './report-html.ts';
import {printConsoleReport} from './report-console.ts';
import {type SortOption} from './types.ts';
import {parseRulesFile} from './rules.ts';

/**
 * Main execution.
 * @returns {Promise<void>}
 */
export const main = async (): Promise<void> => {
	const start: number = performance.now();
	const program = new Command();

	program
		.name('eslint-try-rules')
		.description('Try stricter ESLint rules on your codebase.')
		.argument('[patterns...]', 'Files/directories/globs to lint.', ['.'])
		.requiredOption('--rules <path>', 'Path to a JSON/JSONC file containing the ESLint rules to test.')
		.option('--config <path>', "Path to your project's ESLint configuration file.")
		.option('--sort <type>', 'Sort results by "rule" (default) or "severity" (errors + warnings).', 'rule');

	program.parse();

	const options = program.opts<{rules: string; config?: string; sort: string}>();
	const patterns = program.args;
	const cwd: string = process.cwd();

	if (options.sort !== 'rule' && options.sort !== 'severity') {
		throw new Error('Invalid sort option. Use "rule" or "severity".');
	}

	const rules = parseRulesFile(path.resolve(cwd, options.rules));

	console.log(`${ansis.bold.blue('ℹ')} Starting eslint-try-rules for ${ansis.bold(String(Object.keys(rules).length))} rules...\n`);

	const finalResults = await runLint(cwd, rules, patterns, options.config ? path.resolve(cwd, options.config) : undefined);

	printConsoleReport(finalResults, options.sort as SortOption);

	const html: string = generateHtml(finalResults);
	const outPath: string = path.resolve(cwd, 'eslint-incremental-report.html');
	writeFileSync(outPath, html, 'utf8');

	const durationMs: number = (performance.now() - start) / 1000;
	console.log(`${ansis.bold.green('✔')} Report generated in ${ansis.bold(durationMs.toFixed(2))}s: ${ansis.underline(`file://${outPath}`)}`);
};

/* v8 ignore start */
if (process.argv[1] === import.meta.filename || process.argv[1]?.endsWith('index.mjs')) {
	try {
		await main();
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`\n${ansis.red.bold('✖')} ${error.message}`);
		} else {
			console.error(`\n${ansis.red.bold('✖')} Unknown error`, error);
		}

		process.exit(1);
	}
}
/* v8 ignore stop */
