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
		const total = r.errors + r.warnings;
		const stats: string[] = [`${r.filesCount} files`];
		let icon = ansis.green('✔');

		if (r.errors > 0) {
			stats.push(ansis.red(`${r.errors} errors`));
			icon = ansis.red('✖');
		}
		if (r.warnings > 0) {
			stats.push(ansis.yellow(`${r.warnings} warnings`));
			if (r.errors === 0) {
				icon = ansis.yellow('⚠');
			}
		}
		if (r.fixable > 0) {
			const fixablePercent = Math.round((r.fixable / total) * 100);
			stats.push(ansis.green(`${r.fixable} fixable (${fixablePercent}%)`));
		}

		console.log(`\n${icon} ${ansis.bold(r.ruleId)} (${stats.join(' | ')})`);
		for (const d of sortedDetails) {
			console.log(`${ansis.blue(d.filePath)}:${ansis.magenta(String(d.line))}:${ansis.magenta(String(d.column))} ${ansis.dim('-')} ${d.message}`);
		}
	}

	console.log(`\n${ansis.bold('Summary by Rule')}`);
	const maxRuleIdLength = Math.max(...finalResults.map((r) => r.ruleId.length), 'Rule'.length) + 2;
	const errorLabel = 'Errors';
	const warningLabel = 'Warnings';
	const totalLabel = 'Total';
	const fixableLabel = 'Fixable';
	const percentLabel = '% Fix';
	const filesLabel = 'Files';

	const header = `${ansis.bold('Rule'.padEnd(maxRuleIdLength))} | ${ansis.bold(errorLabel.padStart(8))} | ${ansis.bold(warningLabel.padStart(8))} | ${ansis.bold(totalLabel.padStart(8))} | ${ansis.bold(fixableLabel.padStart(8))} | ${ansis.bold(percentLabel.padStart(6))} | ${ansis.bold(filesLabel.padStart(8))}`;
	const separator = '-'.repeat(maxRuleIdLength + 3 + 8 + 3 + 8 + 3 + 8 + 3 + 8 + 3 + 6 + 3 + 8);
	console.log(header);
	console.log(separator);

	for (const r of finalResults) {
		let icon = ansis.green('✔');
		if (r.errors > 0) {
			icon = ansis.red('✖');
		} else if (r.warnings > 0) {
			icon = ansis.yellow('⚠');
		}

		let statusChar = '✔';
		if (r.errors > 0) {
			statusChar = '✖';
		} else if (r.warnings > 0) {
			statusChar = '⚠';
		}
		const ruleIdText = `${statusChar} ${r.ruleId}`;
		const paddedRuleId = `${icon} ${r.ruleId}${' '.repeat(Math.max(0, maxRuleIdLength - ruleIdText.length))}`;

		const errors = String(r.errors).padStart(8);
		const warnings = String(r.warnings).padStart(8);
		const totalCount = r.errors + r.warnings;
		const total = String(totalCount).padStart(8);
		const fixable = String(r.fixable).padStart(8);
		const fixablePercent = totalCount > 0 ? Math.round((r.fixable / totalCount) * 100) : 0;
		const percent = `${fixablePercent}%`.padStart(6);
		const files = String(r.filesCount).padStart(8);

		console.log(
			`${paddedRuleId} | ${r.errors > 0 ? ansis.red(errors) : errors} | ${r.warnings > 0 ? ansis.yellow(warnings) : warnings} | ${totalCount > 0 ? ansis.bold(total) : total} | ${r.fixable > 0 ? ansis.green(fixable) : fixable} | ${percent} | ${files}`,
		);
	}
	console.log(separator);
	const totalIssues = totalErrors + totalWarnings;
	const totalFixablePercent = totalIssues > 0 ? Math.round((totalFixable / totalIssues) * 100) : 0;
	console.log(
		`${ansis.bold('Totals'.padEnd(maxRuleIdLength))} | ${ansis.red.bold(String(totalErrors).padStart(8))} | ${ansis.yellow.bold(String(totalWarnings).padStart(8))} | ${ansis.bold(String(totalIssues).padStart(8))} | ${ansis.green.bold(String(totalFixable).padStart(8))} | ${ansis.bold(`${totalFixablePercent}%`.padStart(6))} | ${ansis.bold(String(uniqueFiles.size).padStart(8))}\n`,
	);
};
