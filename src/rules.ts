import {readFileSync} from 'node:fs';
import path from 'node:path';
import stripJsonComments from 'strip-json-comments';
import {z} from 'zod';

/**
 * The Zod schema for the rules file.
 */
export const RulesSchema = z.record(z.string(), z.unknown());

/**
 * Parses the rules file.
 * @param {string} filePath - Path to the rules file (JSON or JSONC).
 * @returns {Record<string, unknown>} The parsed rules.
 * @throws {Error} If the file cannot be read or parsed.
 */
export const parseRulesFile = (filePath: string): Record<string, unknown> => {
	try {
		const content = readFileSync(path.resolve(filePath), 'utf8');
		const json: unknown = JSON.parse(stripJsonComments(content));
		return RulesSchema.parse(json);
	} catch (error: unknown) {
		if (error instanceof z.ZodError) {
			throw new Error(`Invalid rules format: ${error.message}`);
		}
		if (error instanceof SyntaxError) {
			throw new Error(`Failed to parse rules JSON: ${error.message}`);
		}
		throw error;
	}
};
