/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class GuestyApi implements ICredentialType {
	name = 'guestyApi';

	displayName = 'Guesty API';

	documentationUrl = 'https://open-api.guesty.com/docs/';

	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'The Client ID from your Guesty API integration',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Client Secret from your Guesty API integration',
		},
	];

	async preAuthentication(
		this: IHttpRequestHelper,
		credentials: ICredentialDataDecryptedObject,
	): Promise<ICredentialDataDecryptedObject> {
		const { clientId, clientSecret } = credentials as {
			clientId: string;
			clientSecret: string;
		};

		const response = await this.helpers.httpRequest({
			method: 'POST',
			url: 'https://open-api.guesty.com/oauth2/token',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				grant_type: 'client_credentials',
				client_id: clientId,
				client_secret: clientSecret,
			},
		});

		return {
			accessToken: response.access_token,
		};
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://open-api.guesty.com/v1',
			url: '/listings',
			qs: {
				limit: 1,
			},
		},
	};
}
