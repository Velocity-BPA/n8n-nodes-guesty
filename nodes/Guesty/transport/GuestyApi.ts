/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import {
	GUESTY_API_BASE_URL,
	GUESTY_BOOKING_API_BASE_URL,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '../constants/constants';

export interface IGuestyApiRequestOptions {
	method: IHttpRequestMethods;
	endpoint: string;
	body?: IDataObject;
	qs?: IDataObject;
	useBookingApi?: boolean;
	headers?: IDataObject;
}

/**
 * Make an authenticated API request to Guesty
 */
export async function guestyApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	options: IGuestyApiRequestOptions,
): Promise<IDataObject> {
	const { method, endpoint, body, qs, useBookingApi = false, headers = {} } = options;

	const baseUrl = useBookingApi ? GUESTY_BOOKING_API_BASE_URL : GUESTY_API_BASE_URL;

	const requestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		qs: qs || {},
		body: body || undefined,
		json: true,
	};

	try {
		const response = await this.helpers.requestWithAuthentication.call(
			this,
			'guestyApi',
			requestOptions,
		);
		return response as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: `Guesty API Error: ${(error as Error).message}`,
		});
	}
}

/**
 * Make an authenticated API request to Guesty and return all results (handling pagination)
 */
export async function guestyApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	options: IGuestyApiRequestOptions,
	propertyName: string = 'results',
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let responseData: IDataObject;
	let skip = 0;
	const limit = options.qs?.limit || DEFAULT_PAGE_SIZE;

	// Ensure limit doesn't exceed max
	const effectiveLimit = Math.min(Number(limit), MAX_PAGE_SIZE);

	do {
		options.qs = {
			...options.qs,
			skip,
			limit: effectiveLimit,
		};

		responseData = await guestyApiRequest.call(this, options);

		const items = responseData[propertyName] as IDataObject[];
		if (items && Array.isArray(items)) {
			returnData.push(...items);
		}

		skip += effectiveLimit;
	} while (
		responseData[propertyName] &&
		(responseData[propertyName] as IDataObject[]).length === effectiveLimit
	);

	return returnData;
}

/**
 * Build filter query string from filter options
 */
export function buildFilterQuery(filters: IDataObject): IDataObject {
	const query: IDataObject = {};

	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== null && value !== '') {
			if (Array.isArray(value)) {
				query[key] = value.join(',');
			} else if (typeof value === 'object') {
				// Handle nested objects (e.g., date ranges)
				const nested = value as IDataObject;
				for (const [nestedKey, nestedValue] of Object.entries(nested)) {
					if (nestedValue !== undefined && nestedValue !== null) {
						query[`${key}[${nestedKey}]`] = nestedValue;
					}
				}
			} else {
				query[key] = value;
			}
		}
	}

	return query;
}

/**
 * Parse date string to ISO format if needed
 */
export function parseDate(date: string | Date): string {
	if (date instanceof Date) {
		return date.toISOString().split('T')[0];
	}
	// If already in YYYY-MM-DD format, return as is
	if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return date;
	}
	// Try to parse and convert
	const parsed = new Date(date);
	if (!isNaN(parsed.getTime())) {
		return parsed.toISOString().split('T')[0];
	}
	return date;
}

/**
 * Simplify response data by extracting nested objects
 */
export function simplifyResponse(data: IDataObject, fieldsToExtract: string[]): IDataObject {
	const simplified: IDataObject = { ...data };

	for (const field of fieldsToExtract) {
		if (simplified[field] && typeof simplified[field] === 'object') {
			const nested = simplified[field] as IDataObject;
			for (const [key, value] of Object.entries(nested)) {
				simplified[`${field}_${key}`] = value;
			}
		}
	}

	return simplified;
}

/**
 * Handle rate limiting with exponential backoff
 */
export async function handleRateLimit<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
): Promise<T> {
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;

			// Check if it's a rate limit error (429)
			if ((error as JsonObject).statusCode === 429 && attempt < maxRetries) {
				const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
				await new Promise((resolve) => setTimeout(resolve, waitTime));
				continue;
			}

			throw error;
		}
	}

	throw lastError;
}

/**
 * Validate required fields are present
 */
export function validateRequiredFields(
	data: IDataObject,
	requiredFields: string[],
	operationName: string,
): void {
	const missingFields: string[] = [];

	for (const field of requiredFields) {
		if (data[field] === undefined || data[field] === null || data[field] === '') {
			missingFields.push(field);
		}
	}

	if (missingFields.length > 0) {
		throw new Error(
			`Missing required fields for ${operationName}: ${missingFields.join(', ')}`,
		);
	}
}

/**
 * Format phone numbers array
 */
export function formatPhoneNumbers(phones: string | string[] | IDataObject[]): IDataObject[] {
	if (typeof phones === 'string') {
		return [{ number: phones }];
	}

	if (Array.isArray(phones)) {
		return phones.map((phone) => {
			if (typeof phone === 'string') {
				return { number: phone };
			}
			return phone as IDataObject;
		});
	}

	return [];
}

/**
 * Build address object from flat fields
 */
export function buildAddressObject(addressFields: IDataObject): IDataObject {
	const address: IDataObject = {};

	const addressKeys = ['full', 'street', 'city', 'state', 'country', 'zipcode', 'lat', 'lng'];

	for (const key of addressKeys) {
		if (addressFields[key] !== undefined && addressFields[key] !== '') {
			address[key] = addressFields[key];
		}
	}

	return address;
}

/**
 * Extract listing IDs from various input formats
 */
export function extractListingIds(input: string | string[]): string[] {
	if (Array.isArray(input)) {
		return input.filter((id) => id && id.trim() !== '');
	}

	if (typeof input === 'string') {
		return input.split(',').map((id) => id.trim()).filter((id) => id !== '');
	}

	return [];
}
