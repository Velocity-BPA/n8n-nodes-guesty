/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { guestyApiRequest } from '../../transport/GuestyApi';
import { cleanObject, toExecutionData } from '../../utils/utils';

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/availability-pricing/api/calendar/listings/${listingId}`,
		qs: {
			startDate,
			endDate,
		},
	});

	return toExecutionData(response);
}

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {
		listingId,
		startDate,
		endDate,
	};

	if (updateFields.status) {
		body.status = updateFields.status;
	}
	if (updateFields.price !== undefined) {
		body.price = updateFields.price;
	}
	if (updateFields.minNights !== undefined) {
		body.minNights = updateFields.minNights;
	}
	if (updateFields.maxNights !== undefined) {
		body.maxNights = updateFields.maxNights;
	}
	if (updateFields.note) {
		body.note = updateFields.note;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/availability-pricing/api/calendar/listings/${listingId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function block(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		listingId,
		startDate,
		endDate,
		status: 'blocked',
	};

	if (additionalFields.blockReason) {
		body.blockReason = additionalFields.blockReason;
	}
	if (additionalFields.note) {
		body.note = additionalFields.note;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/availability-pricing/api/calendar/listings/${listingId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function unblock(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;

	const body: IDataObject = {
		listingId,
		startDate,
		endDate,
		status: 'available',
	};

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/availability-pricing/api/calendar/listings/${listingId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}
