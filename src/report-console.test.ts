import {describe, it, expect, vi, beforeEach} from 'vitest';
import {printConsoleReport, sortByRuleId, sortBySeverity, sortByFilePath} from './report-console.ts';
import {type RuleResult} from './types.ts';

describe('sorting helpers', () => {
	it('sortByRuleId should sort by ID', () => {
		const r1 = {ruleId: 'a'} as RuleResult;
		const r2 = {ruleId: 'b'} as RuleResult;
		expect(sortByRuleId(r1, r2)).toBeLessThan(0);
	});

	it('sortBySeverity should sort by errors', () => {
		const r1 = {ruleId: 'r1', errors: 10, warnings: 0} as RuleResult;
		const r2 = {ruleId: 'r2', errors: 5, warnings: 0} as RuleResult;
		expect(sortBySeverity(r1, r2)).toBeLessThan(0);
	});

	it('sortByFilePath should sort by path', () => {
		const d1 = {filePath: 'a.ts'} as any;
		const d2 = {filePath: 'b.ts'} as any;
		expect(sortByFilePath(d1, d2)).toBeLessThan(0);
	});
});

describe('printConsoleReport', () => {
	const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
		// Mock implementation
	});

	beforeEach(() => {
		logSpy.mockClear();
	});

	it('should sort results by ruleId by default', () => {
		const results: RuleResult[] = [
			{ruleId: 'b', config: {}, errors: 1, warnings: 0, fixable: 0, details: []},
			{ruleId: 'a', config: {}, errors: 1, warnings: 0, fixable: 0, details: []},
		];
		printConsoleReport(results, 'rule');
		const calls = logSpy.mock.calls.map((c) => c[0] as string);
		const ruleALine = calls.findIndex((c) => c.includes('a'));
		const ruleBLine = calls.findIndex((c) => c.includes('b'));
		expect(ruleALine).toBeLessThan(ruleBLine);
	});

	it('should sort results by severity when requested', () => {
		const results: RuleResult[] = [
			{ruleId: 'low', config: {}, errors: 1, warnings: 0, fixable: 0, details: []},
			{ruleId: 'high', config: {}, errors: 10, warnings: 5, fixable: 0, details: []},
		];
		printConsoleReport(results, 'severity');
		const calls = logSpy.mock.calls.map((c) => c[0] as string);
		const highLine = calls.findIndex((c) => c.includes('high'));
		const lowLine = calls.findIndex((c) => c.includes('low'));
		expect(highLine).toBeLessThan(lowLine);
	});

	it('should fallback to ruleId sort if severity is equal', () => {
		const results: RuleResult[] = [
			{ruleId: 'b', config: {}, errors: 1, warnings: 0, fixable: 0, details: []},
			{ruleId: 'a', config: {}, errors: 1, warnings: 0, fixable: 0, details: []},
		];
		printConsoleReport(results, 'severity');
		const calls = logSpy.mock.calls.map((c) => c[0] as string);
		const ruleALine = calls.findIndex((c) => c.includes('a'));
		const ruleBLine = calls.findIndex((c) => c.includes('b'));
		expect(ruleALine).toBeLessThan(ruleBLine);
	});

	it('should output totals', () => {
		const results: RuleResult[] = [{ruleId: 'r1', config: {}, errors: 1, warnings: 2, fixable: 1, details: []}];
		printConsoleReport(results, 'rule');
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Totals'));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('1 errors'));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('2 warnings'));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('1 fixable'));
	});

	it('should handle results with no errors or fixables', () => {
		const results: RuleResult[] = [{ruleId: 'r1', config: {}, errors: 0, warnings: 1, fixable: 0, details: []}];
		printConsoleReport(results, 'rule');
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('1 warnings'));
		// Check that errors and fixable are NOT in the rule line (they should be undefined/filtered out)
		// But they will be in the Totals line.
	});

	it('should output rule details if provided', () => {
		const results: RuleResult[] = [
			{
				ruleId: 'r1',
				config: {},
				errors: 1,
				warnings: 0,
				fixable: 0,
				details: [{filePath: 'test.ts', line: 1, column: 1, message: 'msg'}],
			},
		];
		printConsoleReport(results, 'rule');
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test.ts'));
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('msg'));
	});
});
