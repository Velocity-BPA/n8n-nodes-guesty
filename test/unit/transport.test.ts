/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 */

import {
	buildFilterQuery,
	parseDate,
	simplifyResponse,
	validateRequiredFields,
	formatPhoneNumbers,
	buildAddressObject,
	extractListingIds,
} from '../../nodes/Guesty/transport/GuestyApi';

describe('Guesty Transport Layer Functions', () => {
	describe('buildFilterQuery', () => {
		it('should build query from simple filters', () => {
			const filters = { status: 'confirmed', source: 'airbnb' };
			const result = buildFilterQuery(filters);
			expect(result).toEqual({ status: 'confirmed', source: 'airbnb' });
		});

		it('should join array values with commas', () => {
			const filters = { ids: ['id1', 'id2', 'id3'] };
			const result = buildFilterQuery(filters);
			expect(result).toEqual({ ids: 'id1,id2,id3' });
		});

		it('should handle nested objects', () => {
			const filters = { dateRange: { from: '2024-01-01', to: '2024-01-31' } };
			const result = buildFilterQuery(filters);
			expect(result).toEqual({
				'dateRange[from]': '2024-01-01',
				'dateRange[to]': '2024-01-31',
			});
		});

		it('should skip null and undefined values', () => {
			const filters = { a: 'value', b: null, c: undefined, d: '' };
			const result = buildFilterQuery(filters);
			expect(result).toEqual({ a: 'value' });
		});
	});

	describe('parseDate', () => {
		it('should return date as-is if already in YYYY-MM-DD format', () => {
			const result = parseDate('2024-01-15');
			expect(result).toBe('2024-01-15');
		});

		it('should convert Date object to YYYY-MM-DD format', () => {
			const date = new Date('2024-01-15T12:00:00Z');
			const result = parseDate(date);
			expect(result).toBe('2024-01-15');
		});

		it('should parse and convert ISO string', () => {
			const result = parseDate('2024-01-15T14:30:00.000Z');
			expect(result).toBe('2024-01-15');
		});

		it('should return original string if cannot parse', () => {
			const result = parseDate('invalid-date-string');
			expect(result).toBe('invalid-date-string');
		});
	});

	describe('simplifyResponse', () => {
		it('should extract nested object fields', () => {
			const data = {
				id: '123',
				address: { city: 'NYC', country: 'USA' },
			};
			const result = simplifyResponse(data, ['address']);
			expect(result).toEqual({
				id: '123',
				address: { city: 'NYC', country: 'USA' },
				address_city: 'NYC',
				address_country: 'USA',
			});
		});

		it('should handle non-existent fields', () => {
			const data = { id: '123' };
			const result = simplifyResponse(data, ['nonExistent']);
			expect(result).toEqual({ id: '123' });
		});
	});

	describe('validateRequiredFields', () => {
		it('should not throw for valid data', () => {
			const data = { field1: 'value1', field2: 'value2' };
			expect(() => {
				validateRequiredFields(data, ['field1', 'field2'], 'test');
			}).not.toThrow();
		});

		it('should throw for missing fields', () => {
			const data = { field1: 'value1' };
			expect(() => {
				validateRequiredFields(data, ['field1', 'field2'], 'test');
			}).toThrow('Missing required fields for test: field2');
		});

		it('should throw for null values', () => {
			const data = { field1: null };
			expect(() => {
				validateRequiredFields(data, ['field1'], 'test');
			}).toThrow('Missing required fields for test: field1');
		});

		it('should throw for empty string values', () => {
			const data = { field1: '' };
			expect(() => {
				validateRequiredFields(data, ['field1'], 'test');
			}).toThrow('Missing required fields for test: field1');
		});
	});

	describe('formatPhoneNumbers', () => {
		it('should format single string phone', () => {
			const result = formatPhoneNumbers('+1234567890');
			expect(result).toEqual([{ number: '+1234567890' }]);
		});

		it('should format array of string phones', () => {
			const result = formatPhoneNumbers(['+1234567890', '+0987654321']);
			expect(result).toEqual([
				{ number: '+1234567890' },
				{ number: '+0987654321' },
			]);
		});

		it('should pass through array of objects', () => {
			const input = [{ number: '+1234567890', type: 'mobile' }];
			const result = formatPhoneNumbers(input);
			expect(result).toEqual(input);
		});

		it('should handle mixed array', () => {
			const input = ['+1234567890', { number: '+0987654321' }];
			const result = formatPhoneNumbers(input as string[]);
			expect(result).toEqual([
				{ number: '+1234567890' },
				{ number: '+0987654321' },
			]);
		});
	});

	describe('buildAddressObject', () => {
		it('should build address from fields', () => {
			const fields = {
				street: '123 Main St',
				city: 'New York',
				state: 'NY',
				zipcode: '10001',
				country: 'USA',
			};
			const result = buildAddressObject(fields);
			expect(result).toEqual(fields);
		});

		it('should skip empty fields', () => {
			const fields = { street: '123 Main St', city: '', state: undefined };
			const result = buildAddressObject(fields);
			expect(result).toEqual({ street: '123 Main St' });
		});

		it('should include lat/lng if provided', () => {
			const fields = {
				city: 'NYC',
				lat: 40.7128,
				lng: -74.006,
			};
			const result = buildAddressObject(fields);
			expect(result).toEqual(fields);
		});
	});

	describe('extractListingIds', () => {
		it('should return array as-is', () => {
			const input = ['id1', 'id2', 'id3'];
			const result = extractListingIds(input);
			expect(result).toEqual(input);
		});

		it('should parse comma-separated string', () => {
			const result = extractListingIds('id1, id2, id3');
			expect(result).toEqual(['id1', 'id2', 'id3']);
		});

		it('should filter empty values from array', () => {
			const input = ['id1', '', 'id2', '  ', 'id3'];
			const result = extractListingIds(input);
			expect(result).toEqual(['id1', 'id2', 'id3']);
		});

		it('should filter empty values from string', () => {
			const result = extractListingIds('id1,,id2,  ,id3');
			expect(result).toEqual(['id1', 'id2', 'id3']);
		});
	});
});
