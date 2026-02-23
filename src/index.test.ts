import {describe, it, expect, vi} from 'vitest';
import {main} from './index.ts';
import {Command} from 'commander';
import {parseRulesFile} from './rules.ts';
import {runLint} from './lint.ts';
import {generateHtml} from './report-html.ts';
import {writeFileSync} from 'node:fs';

vi.mock('commander', () => {
	const Command = vi.fn();
	Command.prototype.name = vi.fn().mockReturnThis();
	Command.prototype.version = vi.fn().mockReturnThis();
	Command.prototype.description = vi.fn().mockReturnThis();
	Command.prototype.argument = vi.fn().mockReturnThis();
	Command.prototype.requiredOption = vi.fn().mockReturnThis();
	Command.prototype.option = vi.fn().mockReturnThis();
	Command.prototype.parse = vi.fn().mockReturnThis();
	Command.prototype.opts = vi.fn().mockReturnValue({rules: 'rules.json', sort: 'rule', output: 'both', silent: false});
	Command.prototype.args = ['.'];
	return {Command};
});

vi.mock('./rules.ts');
vi.mock('./lint.ts');
vi.mock('./report-console.ts');
vi.mock('./report-html.ts');
vi.mock('node:fs');

describe('main', () => {
	it('should execute the full linting flow', async () => {
		vi.mocked(parseRulesFile).mockReturnValue({r1: 'error'});
		vi.mocked(runLint).mockResolvedValue([]);
		vi.mocked(generateHtml).mockReturnValue('<html></html>');

		await main();

		expect(parseRulesFile).toHaveBeenCalled();
		expect(runLint).toHaveBeenCalled();
		expect(generateHtml).toHaveBeenCalled();
		expect(writeFileSync).toHaveBeenCalled();
	});

	it('should handle config option', async () => {
		vi.mocked(runLint).mockClear();
		vi.mocked(Command.prototype.opts).mockReturnValue({
			rules: 'rules.json',
			sort: 'rule',
			config: 'eslint.config.js',
			output: 'both',
			silent: true,
		});
		vi.mocked(parseRulesFile).mockReturnValue({r1: 'error'});
		vi.mocked(runLint).mockResolvedValue([]);

		await main();

		expect(runLint).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.any(Array), expect.stringContaining('eslint.config.js'), true);
	});

	it('should handle silent mode', async () => {
		vi.mocked(runLint).mockClear();
		vi.mocked(Command.prototype.opts).mockReturnValue({
			rules: 'rules.json',
			sort: 'rule',
			output: 'console',
			silent: true,
		});
		vi.mocked(parseRulesFile).mockReturnValue({r1: 'error'});
		vi.mocked(runLint).mockResolvedValue([]);

		await main();

		expect(runLint).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.any(Array), undefined, true);
	});

	it('should handle only html output', async () => {
		vi.mocked(runLint).mockClear();
		vi.mocked(Command.prototype.opts).mockReturnValue({
			rules: 'rules.json',
			sort: 'rule',
			output: 'html',
			silent: false,
		});
		vi.mocked(parseRulesFile).mockReturnValue({r1: 'error'});
		vi.mocked(runLint).mockResolvedValue([]);
		vi.mocked(generateHtml).mockReturnValue('<html></html>');

		await main();

		expect(generateHtml).toHaveBeenCalled();
		expect(writeFileSync).toHaveBeenCalled();
	});

	it('should throw on invalid sort option', async () => {
		vi.mocked(Command.prototype.opts).mockReturnValue({rules: 'rules.json', sort: 'invalid', output: 'both'});

		await expect(main()).rejects.toThrow('Invalid sort option');
	});

	it('should throw on invalid output option', async () => {
		vi.mocked(Command.prototype.opts).mockReturnValue({rules: 'rules.json', sort: 'rule', output: 'invalid'});

		await expect(main()).rejects.toThrow('Invalid output option');
	});
});
