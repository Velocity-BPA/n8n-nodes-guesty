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
	const title = this.getNodeParameter('title', index) as string;
	const propertyType = this.getNodeParameter('propertyType', index) as string;
	const roomType = this.getNodeParameter('roomType', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		title,
		propertyType,
		roomType,
	};

	// Add optional fields
	if (additionalFields.nickname) {
		body.nickname = additionalFields.nickname;
	}
	if (additionalFields.isListed !== undefined) {
		body.isListed = additionalFields.isListed;
	}
	if (additionalFields.accommodates) {
		body.accommodates = additionalFields.accommodates;
	}
	if (additionalFields.bedrooms) {
		body.bedrooms = additionalFields.bedrooms;
	}
	if (additionalFields.bathrooms) {
		body.bathrooms = additionalFields.bathrooms;
	}
	if (additionalFields.beds) {
		body.beds = additionalFields.beds;
	}

	// Handle address
	if (additionalFields.address) {
		const addressData = additionalFields.address as IDataObject;
		body.address = cleanObject(addressData);
	}

	// Handle prices
	if (additionalFields.prices) {
		const pricesData = additionalFields.prices as IDataObject;
		body.prices = cleanObject(pricesData);
	}

	// Handle terms
	if (additionalFields.terms) {
		const termsData = additionalFields.terms as IDataObject;
		body.terms = cleanObject(termsData);
	}

	// Handle description
	if (additionalFields.publicDescription) {
		const descData = additionalFields.publicDescription as IDataObject;
		body.publicDescription = cleanObject(descData);
	}

	const response = await guestyApiRequest.call(this, {
		method: 'POST',
		endpoint: '/listings',
		body: cleanObject(body),
	});

	return toExecutionData(response);
}
