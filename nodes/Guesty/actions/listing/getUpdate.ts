/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { guestyApiRequest, guestyApiRequestAllItems, buildFilterQuery } from '../../transport/GuestyApi';
import { cleanObject, toExecutionData } from '../../utils/utils';

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/listings/${listingId}`,
	});

	return toExecutionData(response);
}

export async function getAll(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const filters = this.getNodeParameter('filters', index) as IDataObject;

	const qs: IDataObject = buildFilterQuery(filters);

	if (!returnAll) {
		const limit = this.getNodeParameter('limit', index) as number;
		qs.limit = limit;
	}

	let responseData: IDataObject[];

	if (returnAll) {
		responseData = await guestyApiRequestAllItems.call(
			this,
			{
				method: 'GET',
				endpoint: '/listings',
				qs,
			},
			'results',
		);
	} else {
		const response = await guestyApiRequest.call(this, {
			method: 'GET',
			endpoint: '/listings',
			qs,
		});
		responseData = (response.results as IDataObject[]) || [response];
	}

	return toExecutionData(responseData);
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	// Simple fields
	const simpleFields = [
		'title',
		'nickname',
		'isListed',
		'propertyType',
		'roomType',
		'accommodates',
		'bedrooms',
		'bathrooms',
		'beds',
	];

	for (const field of simpleFields) {
		if (updateFields[field] !== undefined) {
			body[field] = updateFields[field];
		}
	}

	// Handle nested objects
	if (updateFields.address) {
		body.address = cleanObject(updateFields.address as IDataObject);
	}

	if (updateFields.prices) {
		body.prices = cleanObject(updateFields.prices as IDataObject);
	}

	if (updateFields.terms) {
		body.terms = cleanObject(updateFields.terms as IDataObject);
	}

	if (updateFields.publicDescription) {
		body.publicDescription = cleanObject(updateFields.publicDescription as IDataObject);
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/listings/${listingId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}
