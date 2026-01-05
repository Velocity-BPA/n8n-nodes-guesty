/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { guestyApiRequest } from '../../transport/GuestyApi';
import { cleanObject, toExecutionData } from '../../utils/utils';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const checkInDate = this.getNodeParameter('checkInDate', index) as string;
	const checkOutDate = this.getNodeParameter('checkOutDate', index) as string;
	const guestsCount = this.getNodeParameter('guestsCount', index) as number;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		listingId,
		checkInDateLocalized: checkInDate,
		checkOutDateLocalized: checkOutDate,
		guestsCount,
	};

	// Handle optional fields
	if (additionalFields.numberOfGuests) {
		body.numberOfGuests = cleanObject(additionalFields.numberOfGuests as IDataObject);
	}
	if (additionalFields.ignoreTerms !== undefined) {
		body.ignoreTerms = additionalFields.ignoreTerms;
	}
	if (additionalFields.ignoreCalendar !== undefined) {
		body.ignoreCalendar = additionalFields.ignoreCalendar;
	}
	if (additionalFields.ignoreBlocks !== undefined) {
		body.ignoreBlocks = additionalFields.ignoreBlocks;
	}
	if (additionalFields.couponCode) {
		body.couponCode = additionalFields.couponCode;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/quotes',
		body: cleanObject(body),
		useBookingApi: true,
	});

	return toExecutionData(response);
}

export async function createReservation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const quoteId = this.getNodeParameter('quoteId', index) as string;
	const guestDetails = this.getNodeParameter('guestDetails', index) as IDataObject;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		quoteId,
		guest: cleanObject(guestDetails),
	};

	// Handle optional fields
	if (additionalFields.paymentMethodId) {
		body.paymentMethodId = additionalFields.paymentMethodId;
	}
	if (additionalFields.source) {
		body.source = additionalFields.source;
	}
	if (additionalFields.notes) {
		body.notes = additionalFields.notes;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/reservations',
		body: cleanObject(body),
		useBookingApi: true,
	});

	return toExecutionData(response);
}
