/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { guestyApiRequest, guestyApiRequestAllItems, buildFilterQuery } from '../../transport/GuestyApi';
import { cleanObject, toExecutionData } from '../../utils/utils';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const checkInDate = this.getNodeParameter('checkInDate', index) as string;
	const checkOutDate = this.getNodeParameter('checkOutDate', index) as string;
	const status = this.getNodeParameter('status', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		listingId,
		checkInDateLocalized: checkInDate,
		checkOutDateLocalized: checkOutDate,
		status,
	};

	// Handle guest details
	if (additionalFields.guestId) {
		body.guestId = additionalFields.guestId;
	}

	if (additionalFields.guest) {
		body.guest = cleanObject(additionalFields.guest as IDataObject);
	}

	// Handle guest counts
	if (additionalFields.guests) {
		body.guests = cleanObject(additionalFields.guests as IDataObject);
	}

	// Handle source
	if (additionalFields.source) {
		body.source = additionalFields.source;
	}

	// Handle money/pricing
	if (additionalFields.money) {
		body.money = cleanObject(additionalFields.money as IDataObject);
	}

	// Handle custom fields
	if (additionalFields.customFields) {
		body.customFields = additionalFields.customFields;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/reservations',
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/reservations/${reservationId}`,
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
				endpoint: '/reservations',
				qs,
			},
			'results',
		);
	} else {
		const response = await guestyApiRequest.call(this, {
			method: 'GET',
			endpoint: '/reservations',
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
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	// Simple fields
	if (updateFields.checkInDate) {
		body.checkInDateLocalized = updateFields.checkInDate;
	}
	if (updateFields.checkOutDate) {
		body.checkOutDateLocalized = updateFields.checkOutDate;
	}
	if (updateFields.source) {
		body.source = updateFields.source;
	}

	// Nested objects
	if (updateFields.guest) {
		body.guest = cleanObject(updateFields.guest as IDataObject);
	}
	if (updateFields.guests) {
		body.guests = cleanObject(updateFields.guests as IDataObject);
	}
	if (updateFields.money) {
		body.money = cleanObject(updateFields.money as IDataObject);
	}
	if (updateFields.customFields) {
		body.customFields = updateFields.customFields;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/reservations/${reservationId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function updateStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const status = this.getNodeParameter('status', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/reservations/${reservationId}`,
		body: { status },
	});

	return toExecutionData(response);
}

export async function updateGuestStayStatus(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const guestStayStatus = this.getNodeParameter('guestStayStatus', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/reservations/${reservationId}`,
		body: { guestStayStatus },
	});

	return toExecutionData(response);
}

export async function updateSource(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const source = this.getNodeParameter('source', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/reservations/${reservationId}`,
		body: { source },
	});

	return toExecutionData(response);
}

export async function updateGuestBreakdown(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const adults = this.getNodeParameter('adults', index) as number;
	const children = this.getNodeParameter('children', index, 0) as number;
	const infants = this.getNodeParameter('infants', index, 0) as number;
	const pets = this.getNodeParameter('pets', index, 0) as number;

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/reservations/${reservationId}`,
		body: {
			guests: {
				adults,
				children,
				infants,
				pets,
			},
		},
	});

	return toExecutionData(response);
}

export async function alterDates(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const checkInDate = this.getNodeParameter('checkInDate', index) as string;
	const checkOutDate = this.getNodeParameter('checkOutDate', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/reservations/${reservationId}`,
		body: {
			checkInDateLocalized: checkInDate,
			checkOutDateLocalized: checkOutDate,
		},
	});

	return toExecutionData(response);
}

export async function addNote(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const noteText = this.getNodeParameter('noteText', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/reservations/${reservationId}/notes`,
		body: {
			text: noteText,
		},
	});

	return toExecutionData(response);
}

export async function cancel(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		status: 'canceled',
	};

	if (additionalFields.cancellationReason) {
		body.cancellationReason = additionalFields.cancellationReason;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/reservations/${reservationId}`,
		body,
	});

	return toExecutionData(response);
}
