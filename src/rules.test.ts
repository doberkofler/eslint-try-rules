import {describe, it, expect, vi} from 'vitest';
import {parseRulesFile, RulesSchema} from './rules.ts';
import {readFileSync} from 'node:fs';

vi.mock('node:fs', () => ({
	readFileSync: vi.fn(),
}));

describe('RulesSchema', () => {
	it('should validate valid rules', () => {
		const rules = {'no-console': 'error'};
		expect(RulesSchema.parse(rules)).toEqual(rules);
	});

	it('should fail on invalid rules', () => {
		expect(() => RulesSchema.parse(null)).toThrow();
	});
});

describe('parseRulesFile', () => {
	it('should parse valid JSON', () => {
		vi.mocked(readFileSync).mockReturnValue('{"rule": "error"}');
		const result = parseRulesFile('test.json');
		expect(result).toEqual({rule: 'error'});
	});

	it('should parse JSONC (with comments)', () => {
		vi.mocked(readFileSync).mockReturnValue('{\n// comment\n"rule": "error"\n}');
		const result = parseRulesFile('test.jsonc');
		expect(result).toEqual({rule: 'error'});
	});

	it('should throw on invalid JSON', () => {
		vi.mocked(readFileSync).mockReturnValue('invalid');
		expect(() => parseRulesFile('test.json')).toThrow(/Failed to parse rules JSON/);
	});

	it('should throw on invalid rules format', () => {
		vi.mocked(readFileSync).mockReturnValue('[]');
		expect(() => parseRulesFile('test.json')).toThrow(/Invalid rules format/);
	});

	it('should rethrow unknown errors', () => {
		vi.mocked(readFileSync).mockImplementation(() => {
			throw new Error('FileSystem error');
		});
		expect(() => parseRulesFile('test.json')).toThrow('FileSystem error');
	});
});
