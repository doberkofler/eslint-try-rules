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

	console.log('\n' + ansis.bold.cyan('--- CLI Report ---'));
	for (const r of finalResults) {
		totalErrors += r.errors;
		totalWarnings += r.warnings;
		totalFixable += r.fixable;

		const sortedDetails = r.details.toSorted(sortByFilePath);

		const stats: string[] = [];
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
			console.log(
				`  ${ansis.dim('->')} ${ansis.blue(d.filePath)}:${ansis.magenta(String(d.line))}:${ansis.magenta(String(d.column))} ${ansis.dim('-')} ${d.message}`,
			);
		}
	}

	console.log('\n' + ansis.cyan('------------------'));
	const totals = [ansis.red.bold(`${totalErrors} errors`), ansis.yellow.bold(`${totalWarnings} warnings`), ansis.green.bold(`${totalFixable} fixable`)].join(
		' | ',
	);

	console.log(`${ansis.bold('Totals')} | ${totals}\n`);
};
