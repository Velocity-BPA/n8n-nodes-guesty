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
				endpoint: '/communication/conversations',
				qs,
			},
			'results',
		);
	} else {
		const response = await guestyApiRequest.call(this, {
			method: 'GET',
			endpoint: '/communication/conversations',
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
	const conversationId = this.getNodeParameter('conversationId', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/communication/conversations/${conversationId}`,
	});

	return toExecutionData(response);
}

export async function sendMessage(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const reservationId = this.getNodeParameter('reservationId', index) as string;
	const messageBody = this.getNodeParameter('messageBody', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		reservationId,
		body: messageBody,
	};

	if (additionalFields.channelId) {
		body.channelId = additionalFields.channelId;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/communication/conversations/messages',
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function getMessages(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const conversationId = this.getNodeParameter('conversationId', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;

	const qs: IDataObject = {};

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
				endpoint: `/communication/conversations/${conversationId}/messages`,
				qs,
			},
			'results',
		);
	} else {
		const response = await guestyApiRequest.call(this, {
			method: 'GET',
			endpoint: `/communication/conversations/${conversationId}/messages`,
			qs,
		});
		responseData = (response.results as IDataObject[]) || [response];
	}

	return toExecutionData(responseData);
}
