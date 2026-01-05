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
	const taskType = this.getNodeParameter('taskType', index) as string;
	const scheduledFor = this.getNodeParameter('scheduledFor', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		type: taskType,
		scheduledFor,
	};

	if (additionalFields.listingId) {
		body.listingId = additionalFields.listingId;
	}
	if (additionalFields.reservationId) {
		body.reservationId = additionalFields.reservationId;
	}
	if (additionalFields.assigneeId) {
		body.assigneeId = additionalFields.assigneeId;
	}
	if (additionalFields.supervisorId) {
		body.supervisorId = additionalFields.supervisorId;
	}
	if (additionalFields.description) {
		body.description = additionalFields.description;
	}
	if (additionalFields.status) {
		body.status = additionalFields.status;
	}
	if (additionalFields.notes) {
		body.notes = additionalFields.notes;
	}
	if (additionalFields.checklist) {
		body.checklist = additionalFields.checklist;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/tasks-open-api/tasks',
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function get(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const taskId = this.getNodeParameter('taskId', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/tasks-open-api/tasks/${taskId}`,
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
				endpoint: '/tasks-open-api/tasks',
				qs,
			},
			'results',
		);
	} else {
		const response = await guestyApiRequest.call(this, {
			method: 'GET',
			endpoint: '/tasks-open-api/tasks',
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
	const taskId = this.getNodeParameter('taskId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	const simpleFields = [
		'type',
		'scheduledFor',
		'assigneeId',
		'supervisorId',
		'description',
		'status',
		'notes',
	];

	for (const field of simpleFields) {
		if (updateFields[field] !== undefined) {
			body[field] = updateFields[field];
		}
	}

	if (updateFields.checklist) {
		body.checklist = updateFields.checklist;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/tasks-open-api/tasks/${taskId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function deleteTask(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const taskId = this.getNodeParameter('taskId', index) as string;

	await guestyApiRequest.call(this, {
		method: 'DELETE',
		endpoint: `/tasks-open-api/tasks/${taskId}`,
	});

	return toExecutionData({ success: true, taskId });
}
