/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { guestyApiRequest } from './transport/GuestyApi';
import { WEBHOOK_EVENTS } from './constants/constants';

// Runtime licensing notice - logged once per node load
const LICENSING_LOGGED = Symbol.for('guesty.trigger.licensing.logged');
const globalRegistry = globalThis as unknown as { [key: symbol]: boolean };

if (!globalRegistry[LICENSING_LOGGED]) {
	console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
	globalRegistry[LICENSING_LOGGED] = true;
}

export class GuestyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Guesty Trigger',
		name: 'guestyTrigger',
		icon: 'file:guesty.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when Guesty events occur',
		defaults: {
			name: 'Guesty Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'guestyApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				required: true,
				default: 'reservation.new',
				options: WEBHOOK_EVENTS,
				description: 'The event to listen for',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Secret',
						name: 'secret',
						type: 'string',
						typeOptions: {
							password: true,
						},
						default: '',
						description: 'A secret key used to sign webhook payloads for verification',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;

				try {
					const webhooks = await guestyApiRequest.call(this, {
						method: 'GET',
						endpoint: '/webhooks',
					});

					const results = (webhooks.results as IDataObject[]) || [];
					
					for (const webhook of results) {
						if (webhook.url === webhookUrl) {
							const events = webhook.events as string[];
							if (events && events.includes(event)) {
								const webhookData = this.getWorkflowStaticData('node');
								webhookData.webhookId = webhook._id;
								return true;
							}
						}
					}
					
					return false;
				} catch (error) {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const options = this.getNodeParameter('options') as IDataObject;

				const body: IDataObject = {
					url: webhookUrl,
					events: [event],
				};

				if (options.secret) {
					body.secret = options.secret;
				}

				try {
					const response = await guestyApiRequest.call(this, {
						method: 'POST',
						endpoint: '/webhooks',
						body,
					});

					const webhookData = this.getWorkflowStaticData('node');
					webhookData.webhookId = response._id;

					return true;
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: 'Failed to create Guesty webhook',
					});
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId as string;

				if (!webhookId) {
					return true;
				}

				try {
					await guestyApiRequest.call(this, {
						method: 'DELETE',
						endpoint: `/webhooks/${webhookId}`,
					});

					delete webhookData.webhookId;
					return true;
				} catch (error) {
					// Webhook may have already been deleted
					delete webhookData.webhookId;
					return true;
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData() as IDataObject;
		const headerData = this.getHeaderData() as IDataObject;
		const event = this.getNodeParameter('event') as string;

		// Verify the event type matches what we're listening for
		const receivedEvent = bodyData.event as string || headerData['x-guesty-event'] as string;
		
		if (receivedEvent && receivedEvent !== event) {
			// Event doesn't match, ignore this webhook
			return {
				workflowData: [],
			};
		}

		// Build return data with metadata
		const returnData: IDataObject = {
			event: receivedEvent || event,
			timestamp: bodyData.timestamp || new Date().toISOString(),
			data: bodyData.data || bodyData,
		};

		// Include specific fields based on event type
		if (bodyData.reservationId) {
			returnData.reservationId = bodyData.reservationId;
		}
		if (bodyData.listingId) {
			returnData.listingId = bodyData.listingId;
		}
		if (bodyData.guestId) {
			returnData.guestId = bodyData.guestId;
		}
		if (bodyData.taskId) {
			returnData.taskId = bodyData.taskId;
		}
		if (bodyData.paymentId) {
			returnData.paymentId = bodyData.paymentId;
		}
		if (bodyData.messageId) {
			returnData.messageId = bodyData.messageId;
		}

		return {
			workflowData: [this.helpers.returnJsonArray([returnData])],
		};
	}
}
