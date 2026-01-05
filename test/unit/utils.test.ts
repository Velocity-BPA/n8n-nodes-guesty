/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 */

import {
	toExecutionData,
	deepMerge,
	cleanObject,
	formatErrorMessage,
	parseCommaSeparated,
	toLocalizedDate,
	calculateNights,
	generateDateRange,
	isValidEmail,
	isValidPhone,
	capitalizeWords,
	generateUniqueId,
	chunkArray,
	flattenObject,
} from '../../nodes/Guesty/utils/utils';

describe('Guesty Utility Functions', () => {
	describe('toExecutionData', () => {
		it('should convert data array to execution data format', () => {
			const input = [{ id: '1', name: 'Test' }];
			const result = toExecutionData(input);
			expect(result).toHaveLength(1);
			expect(result[0]).toHaveProperty('json');
			expect(result[0].json).toEqual({ id: '1', name: 'Test' });
		});

		it('should handle empty array', () => {
			const result = toExecutionData([]);
			expect(result).toEqual([]);
		});

		it('should handle single object', () => {
			const input = { id: '1', name: 'Test' };
			const result = toExecutionData(input);
			expect(result).toHaveLength(1);
			expect(result[0].json).toEqual(input);
		});
	});

	describe('deepMerge', () => {
		it('should merge two objects deeply', () => {
			const target = { a: 1, b: { c: 2 } };
			const source = { b: { d: 3 }, e: 4 };
			const result = deepMerge(target, source);
			expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
		});

		it('should handle null values', () => {
			const target = { a: 1 };
			const source = { b: null };
			const result = deepMerge(target, source);
			expect(result).toEqual({ a: 1, b: null });
		});

		it('should override primitive values', () => {
			const target = { a: 1 };
			const source = { a: 2 };
			const result = deepMerge(target, source);
			expect(result).toEqual({ a: 2 });
		});
	});

	describe('cleanObject', () => {
		it('should remove null and undefined values', () => {
			const input = { a: 1, b: null, c: undefined, d: 'test' };
			const result = cleanObject(input);
			expect(result).toEqual({ a: 1, d: 'test' });
		});

		it('should remove empty strings', () => {
			const input = { a: '', b: 'test' };
			const result = cleanObject(input);
			expect(result).toEqual({ b: 'test' });
		});

		it('should handle nested objects', () => {
			const input = { a: { b: null, c: 1 }, d: 2 };
			const result = cleanObject(input);
			expect(result).toEqual({ a: { c: 1 }, d: 2 });
		});

		it('should remove empty nested objects', () => {
			const input = { a: { b: null }, d: 2 };
			const result = cleanObject(input);
			expect(result).toEqual({ d: 2 });
		});
	});

	describe('formatErrorMessage', () => {
		it('should format Error object', () => {
			const error = new Error('Test error');
			const result = formatErrorMessage(error);
			expect(result).toBe('Test error');
		});

		it('should format string error', () => {
			const result = formatErrorMessage('String error');
			expect(result).toBe('String error');
		});

		it('should format object with message property', () => {
			const error = { message: 'Object error' };
			const result = formatErrorMessage(error);
			expect(result).toBe('Object error');
		});

		it('should return default for unknown error type', () => {
			const result = formatErrorMessage(null);
			expect(result).toBe('Unknown error occurred');
		});
	});

	describe('parseCommaSeparated', () => {
		it('should parse comma-separated string', () => {
			const result = parseCommaSeparated('a, b, c');
			expect(result).toEqual(['a', 'b', 'c']);
		});

		it('should trim whitespace', () => {
			const result = parseCommaSeparated('  a  ,  b  ,  c  ');
			expect(result).toEqual(['a', 'b', 'c']);
		});

		it('should filter empty values', () => {
			const result = parseCommaSeparated('a,,b,  ,c');
			expect(result).toEqual(['a', 'b', 'c']);
		});

		it('should return array as-is', () => {
			const result = parseCommaSeparated(['a', 'b', 'c']);
			expect(result).toEqual(['a', 'b', 'c']);
		});
	});

	describe('toLocalizedDate', () => {
		it('should return empty string for empty input', () => {
			const result = toLocalizedDate('');
			expect(result).toBe('');
		});

		it('should return date as-is if already in YYYY-MM-DD format', () => {
			const result = toLocalizedDate('2024-01-15');
			expect(result).toBe('2024-01-15');
		});

		it('should convert ISO date to YYYY-MM-DD format', () => {
			const result = toLocalizedDate('2024-01-15T12:00:00Z');
			expect(result).toBe('2024-01-15');
		});
	});

	describe('calculateNights', () => {
		it('should calculate nights between two dates', () => {
			const result = calculateNights('2024-01-15', '2024-01-18');
			expect(result).toBe(3);
		});

		it('should return 0 for same date', () => {
			const result = calculateNights('2024-01-15', '2024-01-15');
			expect(result).toBe(0);
		});

		it('should handle ISO date strings', () => {
			const result = calculateNights(
				'2024-01-15T00:00:00Z',
				'2024-01-20T00:00:00Z'
			);
			expect(result).toBe(5);
		});
	});

	describe('generateDateRange', () => {
		it('should generate array of dates', () => {
			const result = generateDateRange('2024-01-15', '2024-01-18');
			expect(result).toEqual([
				'2024-01-15',
				'2024-01-16',
				'2024-01-17',
				'2024-01-18',
			]);
		});

		it('should return single date for same start and end', () => {
			const result = generateDateRange('2024-01-15', '2024-01-15');
			expect(result).toEqual(['2024-01-15']);
		});
	});

	describe('isValidEmail', () => {
		it('should return true for valid email', () => {
			expect(isValidEmail('test@example.com')).toBe(true);
		});

		it('should return false for invalid email', () => {
			expect(isValidEmail('invalid-email')).toBe(false);
		});

		it('should return false for empty string', () => {
			expect(isValidEmail('')).toBe(false);
		});
	});

	describe('isValidPhone', () => {
		it('should return true for valid phone', () => {
			expect(isValidPhone('+1234567890')).toBe(true);
		});

		it('should return true for phone with dashes', () => {
			expect(isValidPhone('123-456-7890')).toBe(true);
		});

		it('should return false for short phone', () => {
			expect(isValidPhone('12345')).toBe(false);
		});
	});

	describe('capitalizeWords', () => {
		it('should capitalize first letter of each word', () => {
			const result = capitalizeWords('hello world');
			expect(result).toBe('Hello World');
		});

		it('should handle single word', () => {
			const result = capitalizeWords('hello');
			expect(result).toBe('Hello');
		});

		it('should handle empty string', () => {
			const result = capitalizeWords('');
			expect(result).toBe('');
		});
	});

	describe('generateUniqueId', () => {
		it('should generate unique IDs', () => {
			const id1 = generateUniqueId();
			const id2 = generateUniqueId();
			expect(id1).not.toBe(id2);
		});

		it('should generate string ID', () => {
			const result = generateUniqueId();
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('chunkArray', () => {
		it('should split array into chunks', () => {
			const result = chunkArray([1, 2, 3, 4, 5], 2);
			expect(result).toEqual([[1, 2], [3, 4], [5]]);
		});

		it('should return single chunk for small array', () => {
			const result = chunkArray([1, 2], 5);
			expect(result).toEqual([[1, 2]]);
		});

		it('should handle empty array', () => {
			const result = chunkArray([], 2);
			expect(result).toEqual([]);
		});
	});

	describe('flattenObject', () => {
		it('should flatten nested object', () => {
			const input = { a: { b: { c: 1 } }, d: 2 };
			const result = flattenObject(input);
			expect(result).toEqual({ 'a.b.c': 1, d: 2 });
		});

		it('should keep arrays as values', () => {
			const input = { a: [1, 2, 3] };
			const result = flattenObject(input);
			expect(result).toEqual({ a: [1, 2, 3] });
		});

		it('should handle flat object', () => {
			const input = { a: 1, b: 2 };
			const result = flattenObject(input);
			expect(result).toEqual({ a: 1, b: 2 });
		});
	});
});
