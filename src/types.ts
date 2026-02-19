/**
 * Extracted message detail.
 */
export type MessageDetail = {
	filePath: string;
	line: number;
	column: number;
	message: string;
};

/**
 * Metric results per rule.
 */
export type RuleResult = {
	ruleId: string;
	config: unknown;
	errors: number;
	warnings: number;
	fixable: number;
	details: MessageDetail[];
};

/**
 * CLI options for sorting results.
 */
export type SortOption = 'rule' | 'severity';
