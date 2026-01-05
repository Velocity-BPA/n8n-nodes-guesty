/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 */

/**
 * Integration tests for n8n-nodes-guesty
 * 
 * These tests validate the structure and exports of the node modules.
 * For full integration testing with the Guesty API, you would need
 * valid API credentials and a test environment.
 */

import { Guesty } from '../../nodes/Guesty/Guesty.node';
import { GuestyTrigger } from '../../nodes/Guesty/GuestyTrigger.node';

describe('Guesty Node Integration', () => {
	describe('Guesty Node', () => {
		let guestyNode: Guesty;

		beforeEach(() => {
			guestyNode = new Guesty();
		});

		it('should have correct node description', () => {
			expect(guestyNode.description.displayName).toBe('Guesty');
			expect(guestyNode.description.name).toBe('guesty');
			expect(guestyNode.description.group).toContain('transform');
			expect(guestyNode.description.version).toBe(1);
		});

		it('should require guestyApi credentials', () => {
			const credentials = guestyNode.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials).toHaveLength(1);
			expect(credentials![0].name).toBe('guestyApi');
			expect(credentials![0].required).toBe(true);
		});

		it('should have main input and output', () => {
			expect(guestyNode.description.inputs).toContain('main');
			expect(guestyNode.description.outputs).toContain('main');
		});

		it('should have all required resources', () => {
			const properties = guestyNode.description.properties;
			const resourceProperty = properties.find((p) => p.name === 'resource');
			
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty!.type).toBe('options');
			
			const options = resourceProperty!.options as Array<{ value: string }>;
			const resourceValues = options.map((o) => o.value);
			
			expect(resourceValues).toContain('listing');
			expect(resourceValues).toContain('reservation');
			expect(resourceValues).toContain('quote');
			expect(resourceValues).toContain('guest');
			expect(resourceValues).toContain('calendar');
			expect(resourceValues).toContain('task');
			expect(resourceValues).toContain('conversation');
			expect(resourceValues).toContain('owner');
			expect(resourceValues).toContain('invoice');
			expect(resourceValues).toContain('webhook');
		});

		it('should have icon file reference', () => {
			expect(guestyNode.description.icon).toBe('file:guesty.svg');
		});

		it('should have subtitle expression', () => {
			expect(guestyNode.description.subtitle).toBeDefined();
			expect(guestyNode.description.subtitle).toContain('$parameter');
		});
	});

	describe('Guesty Trigger Node', () => {
		let triggerNode: GuestyTrigger;

		beforeEach(() => {
			triggerNode = new GuestyTrigger();
		});

		it('should have correct node description', () => {
			expect(triggerNode.description.displayName).toBe('Guesty Trigger');
			expect(triggerNode.description.name).toBe('guestyTrigger');
			expect(triggerNode.description.group).toContain('trigger');
			expect(triggerNode.description.version).toBe(1);
		});

		it('should require guestyApi credentials', () => {
			const credentials = triggerNode.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials).toHaveLength(1);
			expect(credentials![0].name).toBe('guestyApi');
			expect(credentials![0].required).toBe(true);
		});

		it('should have no inputs and one main output', () => {
			expect(triggerNode.description.inputs).toEqual([]);
			expect(triggerNode.description.outputs).toContain('main');
		});

		it('should have webhook configuration', () => {
			const webhooks = triggerNode.description.webhooks;
			expect(webhooks).toBeDefined();
			expect(webhooks).toHaveLength(1);
			expect(webhooks![0].name).toBe('default');
			expect(webhooks![0].httpMethod).toBe('POST');
		});

		it('should have event selection property', () => {
			const properties = triggerNode.description.properties;
			const eventProperty = properties.find((p) => p.name === 'event');
			
			expect(eventProperty).toBeDefined();
			expect(eventProperty!.type).toBe('options');
			expect(eventProperty!.required).toBe(true);
		});

		it('should support webhook events', () => {
			const properties = triggerNode.description.properties;
			const eventProperty = properties.find((p) => p.name === 'event');
			const options = eventProperty!.options as Array<{ value: string }>;
			const eventValues = options.map((o) => o.value);
			
			expect(eventValues).toContain('reservation.new');
			expect(eventValues).toContain('reservation.updated');
			expect(eventValues).toContain('listing.updated');
			expect(eventValues).toContain('task.created');
		});

		it('should have webhook methods', () => {
			expect(triggerNode.webhookMethods).toBeDefined();
			expect(triggerNode.webhookMethods.default).toBeDefined();
			expect(triggerNode.webhookMethods.default.checkExists).toBeDefined();
			expect(triggerNode.webhookMethods.default.create).toBeDefined();
			expect(triggerNode.webhookMethods.default.delete).toBeDefined();
		});

		it('should have webhook handler', () => {
			expect(triggerNode.webhook).toBeDefined();
			expect(typeof triggerNode.webhook).toBe('function');
		});
	});
});

describe('Module Exports', () => {
	it('should export Guesty class', () => {
		expect(Guesty).toBeDefined();
		expect(typeof Guesty).toBe('function');
	});

	it('should export GuestyTrigger class', () => {
		expect(GuestyTrigger).toBeDefined();
		expect(typeof GuestyTrigger).toBe('function');
	});
});

describe('Constants', () => {
	it('should export all required constants', () => {
		const constants = require('../../nodes/Guesty/constants/constants');
		
		expect(constants.GUESTY_API_BASE_URL).toBe('https://open-api.guesty.com/v1');
		expect(constants.GUESTY_BOOKING_API_BASE_URL).toBe('https://booking-api.guesty.com/v1');
		expect(constants.GUESTY_AUTH_URL).toBe('https://open-api.guesty.com/oauth2/token');
		
		expect(Array.isArray(constants.PROPERTY_TYPES)).toBe(true);
		expect(Array.isArray(constants.ROOM_TYPES)).toBe(true);
		expect(Array.isArray(constants.RESERVATION_STATUSES)).toBe(true);
		expect(Array.isArray(constants.TASK_TYPES)).toBe(true);
		expect(Array.isArray(constants.WEBHOOK_EVENTS)).toBe(true);
		
		expect(constants.DEFAULT_PAGE_SIZE).toBe(25);
		expect(constants.MAX_PAGE_SIZE).toBe(100);
	});
});
