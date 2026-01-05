/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { guestyApiRequest, guestyApiRequestAllItems, buildFilterQuery, formatPhoneNumbers } from '../../transport/GuestyApi';
import { cleanObject, toExecutionData } from '../../utils/utils';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const firstName = this.getNodeParameter('firstName', index) as string;
	const lastName = this.getNodeParameter('lastName', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		firstName,
		lastName,
	};

	if (additionalFields.email) {
		body.email = additionalFields.email;
	}
	if (additionalFields.phones) {
		body.phones = formatPhoneNumbers(additionalFields.phones as string[]);
	}
	if (additionalFields.address) {
		body.address = cleanObject(additionalFields.address as IDataObject);
	}
	if (additionalFields.notes) {
		body.notes = additionalFields.notes;
	}
	if (additionalFields.tags) {
		body.tags = additionalFields.tags;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/guests',
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const guestId = this.getNodeParameter('guestId', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/guests/${guestId}`,
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
				endpoint: '/guests',
				qs,
			},
			'results',
		);
	} else {
		const response = await guestyApiRequest.call(this, {
			method: 'GET',
			endpoint: '/guests',
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
	const guestId = this.getNodeParameter('guestId', index) as string;
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
	if (updateFields.phones) {
		body.phones = formatPhoneNumbers(updateFields.phones as string[]);
	}
	if (updateFields.address) {
		body.address = cleanObject(updateFields.address as IDataObject);
	}
	if (updateFields.notes) {
		body.notes = updateFields.notes;
	}
	if (updateFields.tags) {
		body.tags = updateFields.tags;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/guests/${guestId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function search(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const searchQuery = this.getNodeParameter('searchQuery', index) as string;
	const additionalFilters = this.getNodeParameter('additionalFilters', index) as IDataObject;

	const qs: IDataObject = {
		q: searchQuery,
		...buildFilterQuery(additionalFilters),
	};

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: '/guests',
		qs,
	});

	const responseData = (response.results as IDataObject[]) || [response];
	return toExecutionData(responseData);
}
