/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { guestyApiRequest, guestyApiRequestAllItems, buildFilterQuery } from '../../transport/GuestyApi';
import { cleanObject, toExecutionData } from '../../utils/utils';

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
				endpoint: '/invoices',
				qs,
			},
			'results',
		);
	} else {
		const response = await guestyApiRequest.call(this, {
			method: 'GET',
			endpoint: '/invoices',
			qs,
		});
		responseData = (response.results as IDataObject[]) || [response];
	}

	return toExecutionData(responseData);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const invoiceId = this.getNodeParameter('invoiceId', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/invoices/${invoiceId}`,
	});

	return toExecutionData(response);
}

export async function addPayment(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const amount = this.getNodeParameter('amount', index) as number;
	const paymentMethod = this.getNodeParameter('paymentMethod', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		amount,
		paymentMethod,
	};

	if (additionalFields.currency) {
		body.currency = additionalFields.currency;
	}
	if (additionalFields.note) {
		body.note = additionalFields.note;
	}
	if (additionalFields.paidAt) {
		body.paidAt = additionalFields.paidAt;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/reservations/${reservationId}/payments`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function addInvoiceItem(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const title = this.getNodeParameter('title', index) as string;
	const amount = this.getNodeParameter('amount', index) as number;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		title,
		amount,
	};

	if (additionalFields.quantity) {
		body.quantity = additionalFields.quantity;
	}
	if (additionalFields.type) {
		body.type = additionalFields.type;
	}
	if (additionalFields.currency) {
		body.currency = additionalFields.currency;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/reservations/${reservationId}/invoice-items`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function createPayout(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const ownerId = this.getNodeParameter('ownerId', index) as string;
	const amount = this.getNodeParameter('amount', index) as number;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		ownerId,
		amount,
	};

	if (additionalFields.currency) {
		body.currency = additionalFields.currency;
	}
	if (additionalFields.listingId) {
		body.listingId = additionalFields.listingId;
	}
	if (additionalFields.note) {
		body.note = additionalFields.note;
	}
	if (additionalFields.payoutDate) {
		body.payoutDate = additionalFields.payoutDate;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/owner-payouts',
		body: cleanObject(body),
	});

	return toExecutionData(response);
}
