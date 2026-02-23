import ansis from 'ansis';
import {type RuleResult, type SortOption, type MessageDetail} from './types.ts';

/**
 * Sorts rule results by ruleId.
 * @param {RuleResult} a - First result.
 * @param {RuleResult} b - Second result.
 * @returns {number} Comparison result.
 */
export const sortByRuleId = (a: RuleResult, b: RuleResult): number => a.ruleId.localeCompare(b.ruleId);

/**
 * Sorts rule results by severity (errors + warnings).
 * @param {RuleResult} a - First result.
 * @param {RuleResult} b - Second result.
 * @returns {number} Comparison result.
 */
export const sortBySeverity = (a: RuleResult, b: RuleResult): number => {
	const totalA = a.errors + a.warnings;
	const totalB = b.errors + b.warnings;
	if (totalA !== totalB) {
		return totalB - totalA; // Descending
	}
	return sortByRuleId(a, b);
};

/**
 * Sorts message details by file path.
 * @param {MessageDetail} a - First detail.
 * @param {MessageDetail} b - Second detail.
 * @returns {number} Comparison result.
 */
export const sortByFilePath = (a: MessageDetail, b: MessageDetail): number => a.filePath.localeCompare(b.filePath);

/**
 * Outputs the results to the console.
 * @param {RuleResult[]} results - The results to output.
 * @param {SortOption} sortOption - The sorting criteria.
 */
export const printConsoleReport = (results: RuleResult[], sortOption: SortOption): void => {
	const finalResults = [...results].toSorted((a, b) => {
		if (sortOption === 'severity') {
			return sortBySeverity(a, b);
		}
		return sortByRuleId(a, b);
	});

	let totalErrors = 0;
	let totalWarnings = 0;
	let totalFixable = 0;
	const uniqueFiles = new Set<string>();

	for (const r of finalResults) {
		totalErrors += r.errors;
		totalWarnings += r.warnings;
		totalFixable += r.fixable;

		for (const d of r.details) {
			uniqueFiles.add(d.filePath);
		}

		const sortedDetails = r.details.toSorted(sortByFilePath);

		const stats: string[] = [`${r.filesCount} files`];
		if (r.errors > 0) {
			stats.push(ansis.red(`${r.errors} errors`));
		}
		if (r.warnings > 0) {
			stats.push(ansis.yellow(`${r.warnings} warnings`));
		}
		if (r.fixable > 0) {
			stats.push(ansis.green(`${r.fixable} fixable`));
		}

		console.log(`\n${ansis.bold(r.ruleId)} (${stats.join(' | ')})`);
		for (const d of sortedDetails) {
			console.log(`${ansis.blue(d.filePath)}:${ansis.magenta(String(d.line))}:${ansis.magenta(String(d.column))} ${ansis.dim('-')} ${d.message}`);
		}
	}

	console.log(`\n${ansis.bold('Summary by Rule')}`);
	const maxRuleIdLength = Math.max(...finalResults.map((r) => r.ruleId.length), 'Rule'.length);
	const errorLabel = 'Errors';
	const warningLabel = 'Warnings';
	const fixableLabel = 'Fixable';
	const filesLabel = 'Files';

	const header = `${ansis.bold('Rule'.padEnd(maxRuleIdLength))} | ${ansis.bold(errorLabel.padStart(8))} | ${ansis.bold(warningLabel.padStart(8))} | ${ansis.bold(fixableLabel.padStart(8))} | ${ansis.bold(filesLabel.padStart(8))}`;
	const separator = '-'.repeat(maxRuleIdLength + 3 + 8 + 3 + 8 + 3 + 8 + 3 + 8);
	console.log(header);
	console.log(separator);

	for (const r of finalResults) {
		const ruleId = r.ruleId.padEnd(maxRuleIdLength);
		const errors = String(r.errors).padStart(8);
		const warnings = String(r.warnings).padStart(8);
		const fixable = String(r.fixable).padStart(8);
		const files = String(r.filesCount).padStart(8);

		console.log(
			`${ruleId} | ${r.errors > 0 ? ansis.red(errors) : errors} | ${r.warnings > 0 ? ansis.yellow(warnings) : warnings} | ${r.fixable > 0 ? ansis.green(fixable) : fixable} | ${files}`,
		);
	}
	console.log(separator);
	console.log(
		`${ansis.bold('Totals'.padEnd(maxRuleIdLength))} | ${ansis.red.bold(String(totalErrors).padStart(8))} | ${ansis.yellow.bold(String(totalWarnings).padStart(8))} | ${ansis.green.bold(String(totalFixable).padStart(8))} | ${ansis.bold(String(uniqueFiles.size).padStart(8))}\n`,
	);
};
