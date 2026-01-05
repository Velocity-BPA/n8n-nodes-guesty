/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { guestyApiRequest, guestyApiRequestAllItems } from '../../transport/GuestyApi';
import { cleanObject, toExecutionData } from '../../utils/utils';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const webhookUrl = this.getNodeParameter('webhookUrl', index) as string;
	const events = this.getNodeParameter('events', index) as string[];
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		url: webhookUrl,
		events,
	};

	if (additionalFields.secret) {
		body.secret = additionalFields.secret;
	}
	if (additionalFields.isActive !== undefined) {
		body.isActive = additionalFields.isActive;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/webhooks',
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function getAll(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
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
				endpoint: '/webhooks',
				qs,
			},
			'results',
		);
	} else {
		const response = await guestyApiRequest.call(this, {
			method: 'GET',
			endpoint: '/webhooks',
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
	const webhookId = this.getNodeParameter('webhookId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.url) {
		body.url = updateFields.url;
	}
	if (updateFields.events) {
		body.events = updateFields.events;
	}
	if (updateFields.secret) {
		body.secret = updateFields.secret;
	}
	if (updateFields.isActive !== undefined) {
		body.isActive = updateFields.isActive;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/webhooks/${webhookId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function deleteWebhook(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const webhookId = this.getNodeParameter('webhookId', index) as string;

	await guestyApiRequest.call(this, {
		method: 'DELETE',
		endpoint: `/webhooks/${webhookId}`,
	});

	return toExecutionData({ success: true, webhookId });
}
