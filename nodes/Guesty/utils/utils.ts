/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Convert response data to n8n execution data format
 */
export function toExecutionData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (Array.isArray(data)) {
		return data.map((item) => ({ json: item }));
	}
	return [{ json: data }];
}

/**
 * Deep merge two objects
 */
export function deepMerge(target: IDataObject, source: IDataObject): IDataObject {
	const output = { ...target };

	for (const key of Object.keys(source)) {
		if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
			output[key] = deepMerge(target[key] as IDataObject, source[key] as IDataObject);
		} else {
			output[key] = source[key];
		}
	}

	return output;
}

/**
 * Remove empty/null/undefined values from object
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		if (value !== null && value !== undefined && value !== '') {
			if (typeof value === 'object' && !Array.isArray(value)) {
				const nestedCleaned = cleanObject(value as IDataObject);
				if (Object.keys(nestedCleaned).length > 0) {
					cleaned[key] = nestedCleaned;
				}
			} else if (Array.isArray(value) && value.length > 0) {
				cleaned[key] = value;
			} else if (typeof value !== 'object') {
				cleaned[key] = value;
			}
		}
	}

	return cleaned;
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	if (typeof error === 'object' && error !== null) {
		const errorObj = error as IDataObject;
		if (errorObj.message) {
			return String(errorObj.message);
		}
		if (errorObj.error) {
			return String(errorObj.error);
		}
		return JSON.stringify(error);
	}
	return 'Unknown error occurred';
}

/**
 * Parse comma-separated string to array
 */
export function parseCommaSeparated(input: string | string[]): string[] {
	if (Array.isArray(input)) {
		return input;
	}
	if (typeof input === 'string') {
		return input.split(',').map((s) => s.trim()).filter((s) => s !== '');
	}
	return [];
}

/**
 * Convert ISO date string to localized date (YYYY-MM-DD)
 */
export function toLocalizedDate(isoDate: string): string {
	if (!isoDate) {
		return '';
	}

	// If already in YYYY-MM-DD format
	if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
		return isoDate;
	}

	const date = new Date(isoDate);
	if (isNaN(date.getTime())) {
		return isoDate;
	}

	return date.toISOString().split('T')[0];
}

/**
 * Calculate nights between two dates
 */
export function calculateNights(checkIn: string, checkOut: string): number {
	const start = new Date(checkIn);
	const end = new Date(checkOut);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		return 0;
	}

	const diffTime = Math.abs(end.getTime() - start.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate date range array
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
	const dates: string[] = [];
	const current = new Date(startDate);
	const end = new Date(endDate);

	while (current <= end) {
		dates.push(current.toISOString().split('T')[0]);
		current.setDate(current.getDate() + 1);
	}

	return dates;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhone(phone: string): boolean {
	// Remove common separators
	const cleaned = phone.replace(/[\s\-().+]/g, '');
	// Should be numeric and reasonable length
	return /^\d{7,15}$/.test(cleaned);
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
	return str
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

/**
 * Generate a unique ID (for local use)
 */
export function generateUniqueId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}

/**
 * Flatten nested object to dot notation
 */
export function flattenObject(obj: IDataObject, prefix: string = ''): IDataObject {
	const result: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		const newKey = prefix ? `${prefix}.${key}` : key;

		if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
			Object.assign(result, flattenObject(value as IDataObject, newKey));
		} else {
			result[newKey] = value;
		}
	}

	return result;
}
