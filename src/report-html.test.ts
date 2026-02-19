import {describe, it, expect} from 'vitest';
import {generateHtml, escapeHtml} from './report-html.ts';
import {type RuleResult} from './types.ts';

describe('escapeHtml', () => {
	it('should escape HTML characters', () => {
		expect(escapeHtml('<>&')).toBe('&lt;&gt;&amp;');
	});
});

describe('generateHtml', () => {
	it('should generate valid HTML with results', () => {
		const results: RuleResult[] = [
			{
				ruleId: 'test-rule',
				config: 'error',
				errors: 1,
				warnings: 0,
				fixable: 0,
				details: [{filePath: 'test.ts', line: 1, column: 1, message: 'error message'}],
			},
		];
		const html = generateHtml(results);
		expect(html).toContain('test-rule');
		expect(html).toContain('test.ts:1:1');
		expect(html).toContain('error message');
	});

	it('should handle results with no details', () => {
		const results: RuleResult[] = [
			{
				ruleId: 'no-details',
				config: {},
				errors: 0,
				warnings: 1,
				fixable: 0,
				details: [],
			},
		];
		const html = generateHtml(results);
		expect(html).toContain('no-details');
		expect(html).toContain('#ccc'); // Color for inactive toggle
	});

	it('should handle missing config', () => {
		const results: RuleResult[] = [
			{
				ruleId: 'no-config',
				config: undefined,
				errors: 1,
				warnings: 0,
				fixable: 0,
				details: [],
			},
		];
		const html = generateHtml(results);
		expect(html).toContain('N/A');
	});

	it('should handle empty results', () => {
		const html = generateHtml([]);
		expect(html).toContain('Totals');
		expect(html).toContain('0</td>');
	});
});
