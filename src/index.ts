#!/usr/bin/env node
import {writeFileSync, realpathSync} from 'node:fs';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import {Command} from 'commander';
import ansis from 'ansis';
import {runLint} from './lint.ts';
import {generateHtml} from './report-html.ts';
import {printConsoleReport} from './report-console.ts';
import {type SortOption} from './types.ts';
import {parseRulesFile} from './rules.ts';
import packageJson from '../package.json' with {type: 'json'};

const VERSION = packageJson.version;

/**
 * Main execution.
 * @returns {Promise<void>}
 */
export const main = async (): Promise<void> => {
	const start: number = performance.now();
	const program = new Command();

	program
		.name('eslint-try-rules')
		.version(VERSION)
		.description('Try stricter ESLint rules on your codebase.')
		.argument('[patterns...]', 'Files/directories/globs to lint.', ['.'])
		.requiredOption('--rules <path>', 'Path to a JSON/JSONC file containing the ESLint rules to test.')
		.option('--config <path>', "Path to your project's ESLint configuration file.")
		.option('--sort <type>', 'Sort results by "rule" (default) or "severity" (errors + warnings).', 'rule')
		.option('--output <type>', 'Output format: "console", "html", or "both" (default).', 'both')
		.option('--silent', 'Suppress progress messages.');

	program.parse();

	const options = program.opts<{rules: string; config?: string; sort: string; output: string; silent: boolean}>();
	const patterns = program.args;
	const cwd: string = process.cwd();

	if (options.sort !== 'rule' && options.sort !== 'severity') {
		throw new Error('Invalid sort option. Use "rule" or "severity".');
	}

	if (options.output !== 'console' && options.output !== 'html' && options.output !== 'both') {
		throw new Error('Invalid output option. Use "console", "html" or "both".');
	}

	const rules = parseRulesFile(path.resolve(cwd, options.rules));

	if (!options.silent) {
		console.log(ansis.bold.bgBlue.white(' ESLint Try Rules ') + ansis.dim(` v${VERSION}`));
		console.log(`${ansis.bold.blue('ℹ')} Starting eslint-try-rules for ${ansis.bold(String(Object.keys(rules).length))} rules...\n`);
	}

	const finalResults = await runLint(cwd, rules, patterns, options.config ? path.resolve(cwd, options.config) : undefined, options.silent);

	if (options.output === 'console' || options.output === 'both') {
		printConsoleReport(finalResults, options.sort as SortOption);
	}

	let outPath = '';
	if (options.output === 'html' || options.output === 'both') {
		const html: string = generateHtml(finalResults);
		outPath = path.resolve(cwd, 'eslint-try-rules.html');
		writeFileSync(outPath, html, 'utf8');
	}

	const durationMs: number = (performance.now() - start) / 1000;
	const reportMsg = outPath ? `: ${ansis.underline(`file://${outPath}`)}` : '';
	console.log(`${ansis.bold.green('✔')} Report generated in ${ansis.bold(durationMs.toFixed(2))}s${reportMsg}`);
};

/* v8 ignore start */
const isMain = (): boolean => {
	if (!process.argv[1]) {
		return false;
	}
	try {
		const scriptPath = realpathSync(process.argv[1]);
		return scriptPath === import.meta.filename || scriptPath.endsWith('index.mjs');
	} catch {
		return false;
	}
};

if (isMain()) {
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
