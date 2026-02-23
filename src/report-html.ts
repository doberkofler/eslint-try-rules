import {type RuleResult} from './types.ts';

const TITLE = 'ESLint try rules';

/**
 * Escapes HTML characters.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export const escapeHtml = (str: string): string => str.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/**
 * Generates HTML report.
 * @param {RuleResult[]} results - The results to include in the report.
 * @returns {string} The generated HTML.
 */
export const generateHtml = (results: RuleResult[]): string => {
	let totalErr = 0;
	let totalWarn = 0;
	let totalFix = 0;

	const rows: string = results
		.map((r: RuleResult): string => {
			totalErr += r.errors;
			totalWarn += r.warnings;
			totalFix += r.fixable;

			const total = r.errors + r.warnings;
			const fixablePercent = total > 0 ? Math.round((r.fixable / total) * 100) : 0;

			const confStr: string = escapeHtml(JSON.stringify(r.config ?? 'N/A'));
			let detailsRow = '';
			let toggleIcon = '<span style="color:#ccc;">&#x25B6;</span>';

			if (r.details.length > 0) {
				const list: string = r.details
					.map((d): string => `<li><code>${escapeHtml(d.filePath)}:${d.line}:${d.column}</code> - ${escapeHtml(d.message)}</li>`)
					.join('');

				detailsRow = `<tr style="display:none;background:#f9f9f9;"><td colspan="8"><ul>${list}</ul></td></tr>`;
				toggleIcon = `<span style="cursor:pointer;" onclick="const r=this.closest('tr').nextElementSibling;r.style.display=r.style.display==='none'?'table-row':'none';this.innerHTML=r.style.display==='none'?'&#x25B6;':'&#x25BC;'">&#x25B6;</span>`;
			}

			let statusIcon = '<span style="color:green;">&#x2714;</span>';
			if (r.errors > 0) {
				statusIcon = '<span style="color:red;">&#x2716;</span>';
			} else if (r.warnings > 0) {
				statusIcon = '<span style="color:orange;">&#x26A0;</span>';
			}

			return `<tr>
				<td>${toggleIcon} ${statusIcon} ${escapeHtml(r.ruleId)}</td>
				<td><code>${confStr}</code></td>
				<td>${r.filesCount}</td>
				<td>${r.errors}</td>
				<td>${r.warnings}</td>
				<td style="font-weight:bold;">${total}</td>
				<td>${r.fixable}</td>
				<td>${fixablePercent}%</td>
			</tr>\n\t\t\t\t${detailsRow}`;
		})
		.join('\n\t\t\t\t');

	const totalIssues = totalErr + totalWarn;
	const totalFixablePercent = totalIssues > 0 ? Math.round((totalFix / totalIssues) * 100) : 0;

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>${TITLE}</title>
	<style>
		body { font-family: sans-serif; margin: 2rem; }
		table { border-collapse: collapse; width: 100%; }
		th, td { border: 1px solid #ddd; padding: 8px; text-align: right; vertical-align: top; }
		th:first-child, td:first-child, th:nth-child(2), td:nth-child(2) { text-align: left; }
		ul { margin: 0; padding-left: 20px; font-size: 0.9em; }
		tfoot { font-weight: bold; background: #eee; }
	</style>
</head>
<body>
	<h1>${TITLE}</h1>
	<table>
		<thead>
			<tr><th>Rule</th><th>Config</th><th>Files</th><th>Errors</th><th>Warnings</th><th>Total</th><th>Fixable</th><th>% Fix</th></tr>
		</thead>
		<tbody>
			${rows}
		</tbody>
		<tfoot>
			<tr>
				<td colspan="3">Totals</td>
				<td>${totalErr}</td>
				<td>${totalWarn}</td>
				<td>${totalIssues}</td>
				<td>${totalFix}</td>
				<td>${totalFixablePercent}%</td>
			</tr>
		</tfoot>
	</table>
</body>
</html>`;
};
