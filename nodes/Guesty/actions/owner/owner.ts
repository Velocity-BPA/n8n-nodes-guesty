/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { guestyApiRequest, guestyApiRequestAllItems, buildFilterQuery, extractListingIds } from '../../transport/GuestyApi';
import { cleanObject, toExecutionData } from '../../utils/utils';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const firstName = this.getNodeParameter('firstName', index) as string;
	const lastName = this.getNodeParameter('lastName', index) as string;
	const email = this.getNodeParameter('email', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		firstName,
		lastName,
		email,
	};

	if (additionalFields.phone) {
		body.phone = additionalFields.phone;
	}
	if (additionalFields.address) {
		body.address = cleanObject(additionalFields.address as IDataObject);
	}
	if (additionalFields.listingIds) {
		body.listingIds = extractListingIds(additionalFields.listingIds as string);
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/owners',
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ownerId = this.getNodeParameter('ownerId', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/owners/${ownerId}`,
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
				endpoint: '/owners',
				qs,
			},
			'results',
		);
	} else {
		const response = await guestyApiRequest.call(this, {
			method: 'GET',
			endpoint: '/owners',
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
	const ownerId = this.getNodeParameter('ownerId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.firstName) {
		body.firstName = updateFields.firstName;
	}
	if (updateFields.lastName) {
		body.lastName = updateFields.lastName;
	}
	if (updateFields.email) {
		body.email = updateFields.email;
	}
	if (updateFields.phone) {
		body.phone = updateFields.phone;
	}
	if (updateFields.address) {
		body.address = cleanObject(updateFields.address as IDataObject);
	}
	if (updateFields.listingIds) {
		body.listingIds = extractListingIds(updateFields.listingIds as string);
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/owners/${ownerId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}
