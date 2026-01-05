/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { guestyApiRequest } from '../../transport/GuestyApi';
import { cleanObject, toExecutionData } from '../../utils/utils';

export async function getCalendar(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/listings/${listingId}/calendar`,
		qs: {
			from: startDate,
			to: endDate,
		},
	});

	return toExecutionData(response);
}

export async function updateCalendar(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const startDate = this.getNodeParameter('startDate', index) as string;
	const endDate = this.getNodeParameter('endDate', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {
		from: startDate,
		to: endDate,
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
	if (updateFields.note) {
		body.note = updateFields.note;
	}
	if (updateFields.blockReason) {
		body.blockReason = updateFields.blockReason;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/listings/${listingId}/calendar`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function getPhotos(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/listings/${listingId}/pictures`,
	});

	return toExecutionData(response);
}

export async function addPhoto(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const photoUrl = this.getNodeParameter('photoUrl', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		original: photoUrl,
	};

	if (additionalFields.caption) {
		body.caption = additionalFields.caption;
	}
	if (additionalFields.order !== undefined) {
		body.order = additionalFields.order;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: `/listings/${listingId}/pictures`,
		body,
	});

	return toExecutionData(response);
}

export async function updatePhoto(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const photoId = this.getNodeParameter('photoId', index) as string;
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.caption) {
		body.caption = updateFields.caption;
	}
	if (updateFields.order !== undefined) {
		body.order = updateFields.order;
	}

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/listings/${listingId}/pictures/${photoId}`,
		body: cleanObject(body),
	});

	return toExecutionData(response);
}

export async function deletePhoto(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const photoId = this.getNodeParameter('photoId', index) as string;

	await guestyApiRequest.call(this, {
		method: 'DELETE',
		endpoint: `/listings/${listingId}/pictures/${photoId}`,
	});

	return toExecutionData({ success: true, photoId });
}

export async function getAmenities(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;

	const response = await guestyApiRequest.call(this, {
		method: 'GET',
		endpoint: `/listings/${listingId}`,
		qs: {
			fields: 'amenities',
		},
	});

	return toExecutionData(response);
}

export async function updateAmenities(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	const amenities = this.getNodeParameter('amenities', index) as string[];

	const response = await guestyApiRequest.call(this, {
		method: 'PUT',
		endpoint: `/listings/${listingId}`,
		body: {
			amenities,
		},
	});

	return toExecutionData(response);
}
