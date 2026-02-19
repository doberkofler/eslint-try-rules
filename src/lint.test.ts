import {describe, it, expect, vi} from 'vitest';
import {runLint, createRuleFilter} from './lint.ts';
import {ESLint} from 'eslint';
import {glob} from 'tinyglobby';

vi.mock('eslint', () => {
	const ESLint = vi.fn();
	ESLint.prototype.isPathIgnored = vi.fn().mockResolvedValue(false);
	ESLint.prototype.lintFiles = vi.fn().mockResolvedValue([]);
	return {ESLint};
});

vi.mock('tinyglobby', () => ({
	glob: vi.fn().mockResolvedValue([]),
}));

describe('runLint', () => {
	it('should return empty results if no files found', async () => {
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		vi.mocked(glob).mockResolvedValue([]);
		const result = await runLint(process.cwd(), {}, ['.']);
		expect(result).toEqual([]);
	});

	it('should process lint results correctly', async () => {
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		vi.mocked(glob).mockResolvedValue(['test.ts']);
		const mockResults = [
			{
				filePath: 'test.ts',
				messages: [
					{ruleId: 'r1', severity: 2, message: 'err', line: 1, column: 1},
					{ruleId: 'r1', severity: 1, message: 'warn', line: 2, column: 2, fix: {}},
				],
			},
		];

		const mockESLintInstance = {
			isPathIgnored: vi.fn().mockResolvedValue(false),
			lintFiles: vi.fn().mockResolvedValue(mockResults),
		};
		vi.mocked(ESLint).mockImplementation(function () {
			return mockESLintInstance as any;
		});

		const result = await runLint(process.cwd(), {r1: 'error'}, ['.']);

		expect(result).toHaveLength(1);
		expect(result[0]?.ruleId).toBe('r1');
		expect(result[0]?.errors).toBe(1);
		expect(result[0]?.warnings).toBe(1);
		expect(result[0]?.fixable).toBe(1);
		expect(result[0]?.details).toHaveLength(2);
	});

	it('should skip ignored files', async () => {
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		vi.mocked(glob).mockResolvedValue(['ignored.ts', 'valid.ts']);
		const mockESLintInstance = {
			isPathIgnored: vi.fn().mockImplementation((p: string) => Promise.resolve(p.includes('ignored.ts'))),
			lintFiles: vi.fn().mockResolvedValue([]),
		};
		vi.mocked(ESLint).mockImplementation(function () {
			return mockESLintInstance as any;
		});

		await runLint(process.cwd(), {}, ['.']);
		expect(mockESLintInstance.lintFiles).toHaveBeenCalledWith(['valid.ts']);
	});

	it('should handle messages without ruleId', async () => {
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		vi.mocked(glob).mockResolvedValue(['test.ts']);
		const mockResults = [
			{
				filePath: 'test.ts',
				messages: [{ruleId: null, severity: 2, message: 'err', line: 1, column: 1}],
			},
		];
		const mockESLintInstance = {
			isPathIgnored: vi.fn().mockResolvedValue(false),
			lintFiles: vi.fn().mockResolvedValue(mockResults),
		};
		vi.mocked(ESLint).mockImplementation(function () {
			return mockESLintInstance as any;
		});

		const result = await runLint(process.cwd(), {}, ['.']);
		expect(result).toHaveLength(1);
		expect(result[0]?.ruleId).toBe('unknown');
	});

	it('should add unrequested ruleIds encountered during linting', async () => {
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		vi.mocked(glob).mockResolvedValue(['test.ts']);
		const mockResults = [
			{
				filePath: 'test.ts',
				messages: [{ruleId: 'unrequested', severity: 2, message: 'err', line: 1, column: 1}],
			},
		];
		const mockESLintInstance = {
			isPathIgnored: vi.fn().mockResolvedValue(false),
			lintFiles: vi.fn().mockResolvedValue(mockResults),
		};
		vi.mocked(ESLint).mockImplementation(function () {
			return mockESLintInstance as any;
		});

		const result = await runLint(process.cwd(), {requested: 'error'}, ['.']);
		expect(result).toHaveLength(1);
		expect(result[0]?.ruleId).toBe('unrequested');
	});

	it('should expand directory patterns', async () => {
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		vi.mocked(glob).mockResolvedValue([]);
		await runLint(process.cwd(), {}, ['src']);
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		expect(glob).toHaveBeenCalledWith([expect.stringContaining('src')], expect.any(Object));
	});

	it('should handle custom glob patterns', async () => {
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		vi.mocked(glob).mockResolvedValue([]);
		await runLint(process.cwd(), {}, ['*.ts']);
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		expect(glob).toHaveBeenCalledWith(['*.ts'], expect.any(Object));
	});
});

describe('createRuleFilter', () => {
	it('should return true for requested rules', () => {
		const filter = createRuleFilter({r1: 'error'});
		expect(filter({ruleId: 'r1'})).toBe(true);
	});

	it('should return false for unrequested rules', () => {
		const filter = createRuleFilter({r1: 'error'});
		expect(filter({ruleId: 'r2'})).toBe(false);
	});
});
