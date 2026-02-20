import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		exclude: ['**/node_modules/**', '**/dist/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			include: ['src/**/*.ts'],
			thresholds: {
				lines: 100,
				functions: 100,
				statements: 100,
				branches: 90,
			},
		},
	},
});
