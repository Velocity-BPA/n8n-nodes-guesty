/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import * as listing from './actions/listing';
import * as reservation from './actions/reservation';
import * as quote from './actions/quote';
import * as guest from './actions/guest';
import * as calendar from './actions/calendar';
import * as task from './actions/task';
import * as conversation from './actions/conversation';
import * as owner from './actions/owner';
import * as invoice from './actions/invoice';
import * as webhook from './actions/webhook';

import {
	PROPERTY_TYPES,
	ROOM_TYPES,
	RESERVATION_STATUSES,
	GUEST_STAY_STATUSES,
	CALENDAR_STATUSES,
	BLOCK_REASONS,
	TASK_TYPES,
	TASK_STATUSES,
	PAYMENT_METHODS,
	BOOKING_SOURCES,
	WEBHOOK_EVENTS,
	CURRENCIES,
} from './constants/constants';

// Log licensing notice once
const hasLoggedLicenseNotice = Symbol.for('guesty.license.logged');
if (!(globalThis as Record<symbol, boolean>)[hasLoggedLicenseNotice]) {
	console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
	(globalThis as Record<symbol, boolean>)[hasLoggedLicenseNotice] = true;
}

export class Guesty implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Guesty',
		name: 'guesty',
		icon: 'file:guesty.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Guesty property management platform',
		defaults: {
			name: 'Guesty',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'guestyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Calendar', value: 'calendar' },
					{ name: 'Conversation', value: 'conversation' },
					{ name: 'Guest', value: 'guest' },
					{ name: 'Invoice', value: 'invoice' },
					{ name: 'Listing', value: 'listing' },
					{ name: 'Owner', value: 'owner' },
					{ name: 'Quote', value: 'quote' },
					{ name: 'Reservation', value: 'reservation' },
					{ name: 'Task', value: 'task' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'listing',
			},

			// ==================== LISTING OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['listing'] } },
				options: [
					{ name: 'Add Photo', value: 'addPhoto', action: 'Add photo to listing' },
					{ name: 'Create', value: 'create', action: 'Create a listing' },
					{ name: 'Delete Photo', value: 'deletePhoto', action: 'Delete photo from listing' },
					{ name: 'Get', value: 'get', action: 'Get a listing' },
					{ name: 'Get All', value: 'getAll', action: 'Get all listings' },
					{ name: 'Get Amenities', value: 'getAmenities', action: 'Get listing amenities' },
					{ name: 'Get Calendar', value: 'getCalendar', action: 'Get listing calendar' },
					{ name: 'Get Photos', value: 'getPhotos', action: 'Get listing photos' },
					{ name: 'Update', value: 'update', action: 'Update a listing' },
					{ name: 'Update Amenities', value: 'updateAmenities', action: 'Update listing amenities' },
					{ name: 'Update Calendar', value: 'updateCalendar', action: 'Update listing calendar' },
					{ name: 'Update Photo', value: 'updatePhoto', action: 'Update listing photo' },
				],
				default: 'getAll',
			},

			// Listing: Create
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['listing'], operation: ['create'] } },
				default: '',
				description: 'The title of the listing',
			},
			{
				displayName: 'Property Type',
				name: 'propertyType',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['listing'], operation: ['create'] } },
				options: PROPERTY_TYPES,
				default: 'apartment',
			},
			{
				displayName: 'Room Type',
				name: 'roomType',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['listing'], operation: ['create'] } },
				options: ROOM_TYPES,
				default: 'entire_home',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['listing'], operation: ['create'] } },
				options: [
					{ displayName: 'Accommodates', name: 'accommodates', type: 'number', default: 2, description: 'Maximum number of guests' },
					{ displayName: 'Bathrooms', name: 'bathrooms', type: 'number', default: 1 },
					{ displayName: 'Bedrooms', name: 'bedrooms', type: 'number', default: 1 },
					{ displayName: 'Beds', name: 'beds', type: 'number', default: 1 },
					{ displayName: 'Is Listed', name: 'isListed', type: 'boolean', default: true, description: 'Whether the listing is active' },
					{ displayName: 'Nickname', name: 'nickname', type: 'string', default: '', description: 'Internal name for the listing' },
					{
						displayName: 'Address',
						name: 'address',
						type: 'fixedCollection',
						default: {},
						options: [
							{
								name: 'addressFields',
								displayName: 'Address',
								values: [
									{ displayName: 'Street', name: 'street', type: 'string', default: '' },
									{ displayName: 'City', name: 'city', type: 'string', default: '' },
									{ displayName: 'State', name: 'state', type: 'string', default: '' },
									{ displayName: 'Country', name: 'country', type: 'string', default: '' },
									{ displayName: 'Zipcode', name: 'zipcode', type: 'string', default: '' },
								],
							},
						],
					},
					{
						displayName: 'Prices',
						name: 'prices',
						type: 'fixedCollection',
						default: {},
						options: [
							{
								name: 'priceFields',
								displayName: 'Prices',
								values: [
									{ displayName: 'Base Price', name: 'basePrice', type: 'number', default: 100 },
									{ displayName: 'Currency', name: 'currency', type: 'options', options: CURRENCIES, default: 'USD' },
									{ displayName: 'Cleaning Fee', name: 'cleaningFee', type: 'number', default: 0 },
									{ displayName: 'Extra Person Fee', name: 'extraPersonFee', type: 'number', default: 0 },
								],
							},
						],
					},
				],
			},

			// Listing: Get
			{
				displayName: 'Listing ID',
				name: 'listingId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['listing'], operation: ['get', 'update', 'getCalendar', 'updateCalendar', 'getPhotos', 'addPhoto', 'updatePhoto', 'deletePhoto', 'getAmenities', 'updateAmenities'] } },
				default: '',
				description: 'The ID of the listing',
			},

			// Listing: Get All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { resource: ['listing'], operation: ['getAll'] } },
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { resource: ['listing'], operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['listing'], operation: ['getAll'] } },
				options: [
					{ displayName: 'Active Only', name: 'active', type: 'boolean', default: true, description: 'Whether to only return active listings' },
					{ displayName: 'City', name: 'city', type: 'string', default: '' },
					{ displayName: 'Property Type', name: 'propertyType', type: 'options', options: PROPERTY_TYPES, default: '' },
					{ displayName: 'Search Query', name: 'q', type: 'string', default: '', description: 'Search term to filter listings' },
				],
			},

			// Listing: Update
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['listing'], operation: ['update'] } },
				options: [
					{ displayName: 'Accommodates', name: 'accommodates', type: 'number', default: 2 },
					{ displayName: 'Bathrooms', name: 'bathrooms', type: 'number', default: 1 },
					{ displayName: 'Bedrooms', name: 'bedrooms', type: 'number', default: 1 },
					{ displayName: 'Beds', name: 'beds', type: 'number', default: 1 },
					{ displayName: 'Is Listed', name: 'isListed', type: 'boolean', default: true },
					{ displayName: 'Nickname', name: 'nickname', type: 'string', default: '' },
					{ displayName: 'Property Type', name: 'propertyType', type: 'options', options: PROPERTY_TYPES, default: 'apartment' },
					{ displayName: 'Room Type', name: 'roomType', type: 'options', options: ROOM_TYPES, default: 'entire_home' },
					{ displayName: 'Title', name: 'title', type: 'string', default: '' },
				],
			},

			// Listing: Calendar operations
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { resource: ['listing'], operation: ['getCalendar', 'updateCalendar'] } },
				default: '',
				description: 'Start date for calendar range',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { resource: ['listing'], operation: ['getCalendar', 'updateCalendar'] } },
				default: '',
				description: 'End date for calendar range',
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['listing'], operation: ['updateCalendar'] } },
				options: [
					{ displayName: 'Block Reason', name: 'blockReason', type: 'options', options: BLOCK_REASONS, default: '' },
					{ displayName: 'Min Nights', name: 'minNights', type: 'number', default: 1 },
					{ displayName: 'Note', name: 'note', type: 'string', default: '' },
					{ displayName: 'Price', name: 'price', type: 'number', default: 0, description: 'Override nightly price' },
					{ displayName: 'Status', name: 'status', type: 'options', options: CALENDAR_STATUSES, default: 'available' },
				],
			},

			// Listing: Photo operations
			{
				displayName: 'Photo URL',
				name: 'photoUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['listing'], operation: ['addPhoto'] } },
				default: '',
				description: 'URL of the photo to add',
			},
			{
				displayName: 'Photo ID',
				name: 'photoId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['listing'], operation: ['updatePhoto', 'deletePhoto'] } },
				default: '',
				description: 'The ID of the photo',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['listing'], operation: ['addPhoto'] } },
				options: [
					{ displayName: 'Caption', name: 'caption', type: 'string', default: '' },
					{ displayName: 'Order', name: 'order', type: 'number', default: 0 },
				],
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['listing'], operation: ['updatePhoto'] } },
				options: [
					{ displayName: 'Caption', name: 'caption', type: 'string', default: '' },
					{ displayName: 'Order', name: 'order', type: 'number', default: 0 },
				],
			},

			// Listing: Amenities
			{
				displayName: 'Amenities',
				name: 'amenities',
				type: 'string',
				typeOptions: { multipleValues: true },
				required: true,
				displayOptions: { show: { resource: ['listing'], operation: ['updateAmenities'] } },
				default: [],
				description: 'List of amenities to set',
			},

			// ==================== RESERVATION OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['reservation'] } },
				options: [
					{ name: 'Add Note', value: 'addNote', action: 'Add note to reservation' },
					{ name: 'Alter Dates', value: 'alterDates', action: 'Change reservation dates' },
					{ name: 'Cancel', value: 'cancel', action: 'Cancel a reservation' },
					{ name: 'Create', value: 'create', action: 'Create a reservation' },
					{ name: 'Get', value: 'get', action: 'Get a reservation' },
					{ name: 'Get All', value: 'getAll', action: 'Get all reservations' },
					{ name: 'Update', value: 'update', action: 'Update a reservation' },
					{ name: 'Update Guest Breakdown', value: 'updateGuestBreakdown', action: 'Update guest counts' },
					{ name: 'Update Guest Stay Status', value: 'updateGuestStayStatus', action: 'Update stay status' },
					{ name: 'Update Source', value: 'updateSource', action: 'Update booking source' },
					{ name: 'Update Status', value: 'updateStatus', action: 'Update reservation status' },
				],
				default: 'getAll',
			},

			// Reservation: Create
			{
				displayName: 'Listing ID',
				name: 'listingId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['reservation'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Check-In Date',
				name: 'checkInDate',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { resource: ['reservation'], operation: ['create', 'alterDates'] } },
				default: '',
			},
			{
				displayName: 'Check-Out Date',
				name: 'checkOutDate',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { resource: ['reservation'], operation: ['create', 'alterDates'] } },
				default: '',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['reservation'], operation: ['create', 'updateStatus'] } },
				options: RESERVATION_STATUSES,
				default: 'confirmed',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['reservation'], operation: ['create'] } },
				options: [
					{ displayName: 'Guest ID', name: 'guestId', type: 'string', default: '' },
					{ displayName: 'Source', name: 'source', type: 'options', options: BOOKING_SOURCES, default: 'direct' },
					{
						displayName: 'Guest',
						name: 'guest',
						type: 'fixedCollection',
						default: {},
						options: [
							{
								name: 'guestFields',
								displayName: 'Guest Details',
								values: [
									{ displayName: 'First Name', name: 'firstName', type: 'string', default: '' },
									{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
									{ displayName: 'Email', name: 'email', type: 'string', default: '' },
									{ displayName: 'Phone', name: 'phone', type: 'string', default: '' },
								],
							},
						],
					},
					{
						displayName: 'Guests',
						name: 'guests',
						type: 'fixedCollection',
						default: {},
						options: [
							{
								name: 'guestCounts',
								displayName: 'Guest Counts',
								values: [
									{ displayName: 'Adults', name: 'adults', type: 'number', default: 1 },
									{ displayName: 'Children', name: 'children', type: 'number', default: 0 },
									{ displayName: 'Infants', name: 'infants', type: 'number', default: 0 },
									{ displayName: 'Pets', name: 'pets', type: 'number', default: 0 },
								],
							},
						],
					},
				],
			},

			// Reservation: Get/Update
			{
				displayName: 'Reservation ID',
				name: 'reservationId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['reservation'], operation: ['get', 'update', 'updateStatus', 'updateGuestStayStatus', 'updateSource', 'updateGuestBreakdown', 'alterDates', 'addNote', 'cancel'] } },
				default: '',
			},

			// Reservation: Get All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { resource: ['reservation'], operation: ['getAll'] } },
				default: false,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { resource: ['reservation'], operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['reservation'], operation: ['getAll'] } },
				options: [
					{ displayName: 'Check-In After', name: 'checkInFrom', type: 'dateTime', default: '' },
					{ displayName: 'Check-In Before', name: 'checkInTo', type: 'dateTime', default: '' },
					{ displayName: 'Listing ID', name: 'listingId', type: 'string', default: '' },
					{ displayName: 'Status', name: 'status', type: 'options', options: RESERVATION_STATUSES, default: '' },
				],
			},

			// Reservation: Update
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['reservation'], operation: ['update'] } },
				options: [
					{ displayName: 'Check-In Date', name: 'checkInDate', type: 'dateTime', default: '' },
					{ displayName: 'Check-Out Date', name: 'checkOutDate', type: 'dateTime', default: '' },
					{ displayName: 'Source', name: 'source', type: 'options', options: BOOKING_SOURCES, default: '' },
				],
			},

			// Reservation: Guest Stay Status
			{
				displayName: 'Guest Stay Status',
				name: 'guestStayStatus',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['reservation'], operation: ['updateGuestStayStatus'] } },
				options: GUEST_STAY_STATUSES,
				default: 'scheduled',
			},

			// Reservation: Source
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['reservation'], operation: ['updateSource'] } },
				options: BOOKING_SOURCES,
				default: 'direct',
			},

			// Reservation: Guest Breakdown
			{
				displayName: 'Adults',
				name: 'adults',
				type: 'number',
				required: true,
				displayOptions: { show: { resource: ['reservation'], operation: ['updateGuestBreakdown'] } },
				default: 1,
			},
			{
				displayName: 'Children',
				name: 'children',
				type: 'number',
				displayOptions: { show: { resource: ['reservation'], operation: ['updateGuestBreakdown'] } },
				default: 0,
			},
			{
				displayName: 'Infants',
				name: 'infants',
				type: 'number',
				displayOptions: { show: { resource: ['reservation'], operation: ['updateGuestBreakdown'] } },
				default: 0,
			},
			{
				displayName: 'Pets',
				name: 'pets',
				type: 'number',
				displayOptions: { show: { resource: ['reservation'], operation: ['updateGuestBreakdown'] } },
				default: 0,
			},

			// Reservation: Note
			{
				displayName: 'Note Text',
				name: 'noteText',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['reservation'], operation: ['addNote'] } },
				default: '',
			},

			// Reservation: Cancel
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['reservation'], operation: ['cancel'] } },
				options: [
					{ displayName: 'Cancellation Reason', name: 'cancellationReason', type: 'string', default: '' },
				],
			},

			// ==================== QUOTE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['quote'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a quote' },
					{ name: 'Create Reservation', value: 'createReservation', action: 'Convert quote to reservation' },
				],
				default: 'create',
			},

			// Quote: Create
			{
				displayName: 'Listing ID',
				name: 'listingId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['quote'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Check-In Date',
				name: 'checkInDate',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { resource: ['quote'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Check-Out Date',
				name: 'checkOutDate',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { resource: ['quote'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Guests Count',
				name: 'guestsCount',
				type: 'number',
				required: true,
				displayOptions: { show: { resource: ['quote'], operation: ['create'] } },
				default: 1,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['quote'], operation: ['create'] } },
				options: [
					{ displayName: 'Coupon Code', name: 'couponCode', type: 'string', default: '' },
					{ displayName: 'Ignore Blocks', name: 'ignoreBlocks', type: 'boolean', default: false },
					{ displayName: 'Ignore Calendar', name: 'ignoreCalendar', type: 'boolean', default: false },
					{ displayName: 'Ignore Terms', name: 'ignoreTerms', type: 'boolean', default: false },
				],
			},

			// Quote: Create Reservation
			{
				displayName: 'Quote ID',
				name: 'quoteId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['quote'], operation: ['createReservation'] } },
				default: '',
			},
			{
				displayName: 'Guest Details',
				name: 'guestDetails',
				type: 'fixedCollection',
				required: true,
				displayOptions: { show: { resource: ['quote'], operation: ['createReservation'] } },
				default: {},
				options: [
					{
						name: 'guestFields',
						displayName: 'Guest',
						values: [
							{ displayName: 'First Name', name: 'firstName', type: 'string', default: '', required: true },
							{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '', required: true },
							{ displayName: 'Email', name: 'email', type: 'string', default: '', required: true },
							{ displayName: 'Phone', name: 'phone', type: 'string', default: '' },
						],
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['quote'], operation: ['createReservation'] } },
				options: [
					{ displayName: 'Notes', name: 'notes', type: 'string', default: '' },
					{ displayName: 'Payment Method ID', name: 'paymentMethodId', type: 'string', default: '' },
					{ displayName: 'Source', name: 'source', type: 'options', options: BOOKING_SOURCES, default: 'direct' },
				],
			},

			// ==================== GUEST OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['guest'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a guest' },
					{ name: 'Get', value: 'get', action: 'Get a guest' },
					{ name: 'Get All', value: 'getAll', action: 'Get all guests' },
					{ name: 'Search', value: 'search', action: 'Search guests' },
					{ name: 'Update', value: 'update', action: 'Update a guest' },
				],
				default: 'getAll',
			},

			// Guest: Create
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['guest'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['guest'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['guest'], operation: ['create'] } },
				options: [
					{ displayName: 'Email', name: 'email', type: 'string', default: '' },
					{ displayName: 'Notes', name: 'notes', type: 'string', default: '' },
					{ displayName: 'Phones', name: 'phones', type: 'string', typeOptions: { multipleValues: true }, default: [] },
					{ displayName: 'Tags', name: 'tags', type: 'string', typeOptions: { multipleValues: true }, default: [] },
				],
			},

			// Guest: Get/Update
			{
				displayName: 'Guest ID',
				name: 'guestId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['guest'], operation: ['get', 'update'] } },
				default: '',
			},

			// Guest: Get All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { resource: ['guest'], operation: ['getAll'] } },
				default: false,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { resource: ['guest'], operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['guest'], operation: ['getAll'] } },
				options: [
					{ displayName: 'Email', name: 'email', type: 'string', default: '' },
					{ displayName: 'Search Query', name: 'q', type: 'string', default: '' },
				],
			},

			// Guest: Search
			{
				displayName: 'Search Query',
				name: 'searchQuery',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['guest'], operation: ['search'] } },
				default: '',
				description: 'Search term (name, email, phone)',
			},
			{
				displayName: 'Additional Filters',
				name: 'additionalFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['guest'], operation: ['search'] } },
				options: [
					{ displayName: 'Limit', name: 'limit', type: 'number', default: 25 },
				],
			},

			// Guest: Update
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['guest'], operation: ['update'] } },
				options: [
					{ displayName: 'Email', name: 'email', type: 'string', default: '' },
					{ displayName: 'First Name', name: 'firstName', type: 'string', default: '' },
					{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
					{ displayName: 'Notes', name: 'notes', type: 'string', default: '' },
					{ displayName: 'Phones', name: 'phones', type: 'string', typeOptions: { multipleValues: true }, default: [] },
					{ displayName: 'Tags', name: 'tags', type: 'string', typeOptions: { multipleValues: true }, default: [] },
				],
			},

			// ==================== CALENDAR OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['calendar'] } },
				options: [
					{ name: 'Block', value: 'block', action: 'Block dates' },
					{ name: 'Get', value: 'get', action: 'Get calendar' },
					{ name: 'Unblock', value: 'unblock', action: 'Unblock dates' },
					{ name: 'Update', value: 'update', action: 'Update calendar' },
				],
				default: 'get',
			},

			// Calendar: Common fields
			{
				displayName: 'Listing ID',
				name: 'listingId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['calendar'] } },
				default: '',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { resource: ['calendar'] } },
				default: '',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { resource: ['calendar'] } },
				default: '',
			},

			// Calendar: Update
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['calendar'], operation: ['update'] } },
				options: [
					{ displayName: 'Max Nights', name: 'maxNights', type: 'number', default: 0 },
					{ displayName: 'Min Nights', name: 'minNights', type: 'number', default: 1 },
					{ displayName: 'Note', name: 'note', type: 'string', default: '' },
					{ displayName: 'Price', name: 'price', type: 'number', default: 0 },
					{ displayName: 'Status', name: 'status', type: 'options', options: CALENDAR_STATUSES, default: 'available' },
				],
			},

			// Calendar: Block
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['calendar'], operation: ['block'] } },
				options: [
					{ displayName: 'Block Reason', name: 'blockReason', type: 'options', options: BLOCK_REASONS, default: 'other' },
					{ displayName: 'Note', name: 'note', type: 'string', default: '' },
				],
			},

			// ==================== TASK OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['task'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a task' },
					{ name: 'Delete', value: 'delete', action: 'Delete a task' },
					{ name: 'Get', value: 'get', action: 'Get a task' },
					{ name: 'Get All', value: 'getAll', action: 'Get all tasks' },
					{ name: 'Update', value: 'update', action: 'Update a task' },
				],
				default: 'getAll',
			},

			// Task: Create
			{
				displayName: 'Task Type',
				name: 'taskType',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['task'], operation: ['create'] } },
				options: TASK_TYPES,
				default: 'cleaning',
			},
			{
				displayName: 'Scheduled For',
				name: 'scheduledFor',
				type: 'dateTime',
				required: true,
				displayOptions: { show: { resource: ['task'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['task'], operation: ['create'] } },
				options: [
					{ displayName: 'Assignee ID', name: 'assigneeId', type: 'string', default: '' },
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Listing ID', name: 'listingId', type: 'string', default: '' },
					{ displayName: 'Notes', name: 'notes', type: 'string', default: '' },
					{ displayName: 'Reservation ID', name: 'reservationId', type: 'string', default: '' },
					{ displayName: 'Status', name: 'status', type: 'options', options: TASK_STATUSES, default: 'pending' },
					{ displayName: 'Supervisor ID', name: 'supervisorId', type: 'string', default: '' },
				],
			},

			// Task: Get/Update/Delete
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['task'], operation: ['get', 'update', 'delete'] } },
				default: '',
			},

			// Task: Get All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { resource: ['task'], operation: ['getAll'] } },
				default: false,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { resource: ['task'], operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['task'], operation: ['getAll'] } },
				options: [
					{ displayName: 'Listing ID', name: 'listingId', type: 'string', default: '' },
					{ displayName: 'Reservation ID', name: 'reservationId', type: 'string', default: '' },
					{ displayName: 'Status', name: 'status', type: 'options', options: TASK_STATUSES, default: '' },
					{ displayName: 'Type', name: 'type', type: 'options', options: TASK_TYPES, default: '' },
				],
			},

			// Task: Update
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['task'], operation: ['update'] } },
				options: [
					{ displayName: 'Assignee ID', name: 'assigneeId', type: 'string', default: '' },
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Notes', name: 'notes', type: 'string', default: '' },
					{ displayName: 'Scheduled For', name: 'scheduledFor', type: 'dateTime', default: '' },
					{ displayName: 'Status', name: 'status', type: 'options', options: TASK_STATUSES, default: '' },
					{ displayName: 'Supervisor ID', name: 'supervisorId', type: 'string', default: '' },
					{ displayName: 'Type', name: 'type', type: 'options', options: TASK_TYPES, default: '' },
				],
			},

			// ==================== CONVERSATION OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['conversation'] } },
				options: [
					{ name: 'Get', value: 'get', action: 'Get a conversation' },
					{ name: 'Get All', value: 'getAll', action: 'Get all conversations' },
					{ name: 'Get Messages', value: 'getMessages', action: 'Get conversation messages' },
					{ name: 'Send Message', value: 'sendMessage', action: 'Send a message' },
				],
				default: 'getAll',
			},

			// Conversation: Get
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['conversation'], operation: ['get', 'getMessages'] } },
				default: '',
			},

			// Conversation: Get All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { resource: ['conversation'], operation: ['getAll', 'getMessages'] } },
				default: false,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { resource: ['conversation'], operation: ['getAll', 'getMessages'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['conversation'], operation: ['getAll'] } },
				options: [
					{ displayName: 'Guest ID', name: 'guestId', type: 'string', default: '' },
					{ displayName: 'Reservation ID', name: 'reservationId', type: 'string', default: '' },
				],
			},

			// Conversation: Send Message
			{
				displayName: 'Reservation ID',
				name: 'reservationId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['conversation'], operation: ['sendMessage'] } },
				default: '',
			},
			{
				displayName: 'Message Body',
				name: 'messageBody',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['conversation'], operation: ['sendMessage'] } },
				default: '',
				description: 'The message content to send',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['conversation'], operation: ['sendMessage'] } },
				options: [
					{ displayName: 'Channel ID', name: 'channelId', type: 'string', default: '', description: 'The communication channel to use' },
				],
			},

			// ==================== OWNER OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['owner'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create an owner' },
					{ name: 'Get', value: 'get', action: 'Get an owner' },
					{ name: 'Get All', value: 'getAll', action: 'Get all owners' },
					{ name: 'Update', value: 'update', action: 'Update an owner' },
				],
				default: 'getAll',
			},

			// Owner: Create
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['owner'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['owner'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['owner'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['owner'], operation: ['create'] } },
				options: [
					{ displayName: 'Listing IDs', name: 'listingIds', type: 'string', default: '', description: 'Comma-separated list of listing IDs' },
					{ displayName: 'Phone', name: 'phone', type: 'string', default: '' },
				],
			},

			// Owner: Get/Update
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['owner'], operation: ['get', 'update'] } },
				default: '',
			},

			// Owner: Get All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { resource: ['owner'], operation: ['getAll'] } },
				default: false,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { resource: ['owner'], operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['owner'], operation: ['getAll'] } },
				options: [
					{ displayName: 'Email', name: 'email', type: 'string', default: '' },
					{ displayName: 'Search Query', name: 'q', type: 'string', default: '' },
				],
			},

			// Owner: Update
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['owner'], operation: ['update'] } },
				options: [
					{ displayName: 'Email', name: 'email', type: 'string', default: '' },
					{ displayName: 'First Name', name: 'firstName', type: 'string', default: '' },
					{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
					{ displayName: 'Listing IDs', name: 'listingIds', type: 'string', default: '' },
					{ displayName: 'Phone', name: 'phone', type: 'string', default: '' },
				],
			},

			// ==================== INVOICE OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['invoice'] } },
				options: [
					{ name: 'Add Invoice Item', value: 'addInvoiceItem', action: 'Add invoice item' },
					{ name: 'Add Payment', value: 'addPayment', action: 'Add payment to reservation' },
					{ name: 'Create Payout', value: 'createPayout', action: 'Create owner payout' },
					{ name: 'Get', value: 'get', action: 'Get an invoice' },
					{ name: 'Get All', value: 'getAll', action: 'Get all invoices' },
				],
				default: 'getAll',
			},

			// Invoice: Get
			{
				displayName: 'Invoice ID',
				name: 'invoiceId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['invoice'], operation: ['get'] } },
				default: '',
			},

			// Invoice: Get All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { resource: ['invoice'], operation: ['getAll'] } },
				default: false,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { resource: ['invoice'], operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['invoice'], operation: ['getAll'] } },
				options: [
					{ displayName: 'Reservation ID', name: 'reservationId', type: 'string', default: '' },
					{ displayName: 'Status', name: 'status', type: 'string', default: '' },
				],
			},

			// Invoice: Add Payment
			{
				displayName: 'Reservation ID',
				name: 'reservationId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['invoice'], operation: ['addPayment', 'addInvoiceItem'] } },
				default: '',
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				required: true,
				displayOptions: { show: { resource: ['invoice'], operation: ['addPayment', 'addInvoiceItem', 'createPayout'] } },
				default: 0,
			},
			{
				displayName: 'Payment Method',
				name: 'paymentMethod',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['invoice'], operation: ['addPayment'] } },
				options: PAYMENT_METHODS,
				default: 'credit_card',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['invoice'], operation: ['addPayment'] } },
				options: [
					{ displayName: 'Currency', name: 'currency', type: 'options', options: CURRENCIES, default: 'USD' },
					{ displayName: 'Note', name: 'note', type: 'string', default: '' },
					{ displayName: 'Paid At', name: 'paidAt', type: 'dateTime', default: '' },
				],
			},

			// Invoice: Add Invoice Item
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['invoice'], operation: ['addInvoiceItem'] } },
				default: '',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['invoice'], operation: ['addInvoiceItem'] } },
				options: [
					{ displayName: 'Currency', name: 'currency', type: 'options', options: CURRENCIES, default: 'USD' },
					{ displayName: 'Quantity', name: 'quantity', type: 'number', default: 1 },
					{ displayName: 'Type', name: 'type', type: 'string', default: '' },
				],
			},

			// Invoice: Create Payout
			{
				displayName: 'Owner ID',
				name: 'ownerId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['invoice'], operation: ['createPayout'] } },
				default: '',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['invoice'], operation: ['createPayout'] } },
				options: [
					{ displayName: 'Currency', name: 'currency', type: 'options', options: CURRENCIES, default: 'USD' },
					{ displayName: 'Listing ID', name: 'listingId', type: 'string', default: '' },
					{ displayName: 'Note', name: 'note', type: 'string', default: '' },
					{ displayName: 'Payout Date', name: 'payoutDate', type: 'dateTime', default: '' },
				],
			},

			// ==================== WEBHOOK OPERATIONS ====================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['webhook'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a webhook' },
					{ name: 'Delete', value: 'delete', action: 'Delete a webhook' },
					{ name: 'Get All', value: 'getAll', action: 'Get all webhooks' },
					{ name: 'Update', value: 'update', action: 'Update a webhook' },
				],
				default: 'getAll',
			},

			// Webhook: Create
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['webhook'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				displayOptions: { show: { resource: ['webhook'], operation: ['create'] } },
				options: WEBHOOK_EVENTS,
				default: [],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['webhook'], operation: ['create'] } },
				options: [
					{ displayName: 'Is Active', name: 'isActive', type: 'boolean', default: true },
					{ displayName: 'Secret', name: 'secret', type: 'string', default: '' },
				],
			},

			// Webhook: Get All
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: { show: { resource: ['webhook'], operation: ['getAll'] } },
				default: false,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: { show: { resource: ['webhook'], operation: ['getAll'], returnAll: [false] } },
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
			},

			// Webhook: Update/Delete
			{
				displayName: 'Webhook ID',
				name: 'webhookId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['webhook'], operation: ['update', 'delete'] } },
				default: '',
			},

			// Webhook: Update
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['webhook'], operation: ['update'] } },
				options: [
					{ displayName: 'Events', name: 'events', type: 'multiOptions', options: WEBHOOK_EVENTS, default: [] },
					{ displayName: 'Is Active', name: 'isActive', type: 'boolean', default: true },
					{ displayName: 'Secret', name: 'secret', type: 'string', default: '' },
					{ displayName: 'URL', name: 'url', type: 'string', default: '' },
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: INodeExecutionData[] = [];

				switch (resource) {
					case 'listing':
						switch (operation) {
							case 'create':
								responseData = await listing.create.call(this, i);
								break;
							case 'get':
								responseData = await listing.get.call(this, i);
								break;
							case 'getAll':
								responseData = await listing.getAll.call(this, i);
								break;
							case 'update':
								responseData = await listing.update.call(this, i);
								break;
							case 'getCalendar':
								responseData = await listing.getCalendar.call(this, i);
								break;
							case 'updateCalendar':
								responseData = await listing.updateCalendar.call(this, i);
								break;
							case 'getPhotos':
								responseData = await listing.getPhotos.call(this, i);
								break;
							case 'addPhoto':
								responseData = await listing.addPhoto.call(this, i);
								break;
							case 'updatePhoto':
								responseData = await listing.updatePhoto.call(this, i);
								break;
							case 'deletePhoto':
								responseData = await listing.deletePhoto.call(this, i);
								break;
							case 'getAmenities':
								responseData = await listing.getAmenities.call(this, i);
								break;
							case 'updateAmenities':
								responseData = await listing.updateAmenities.call(this, i);
								break;
						}
						break;

					case 'reservation':
						switch (operation) {
							case 'create':
								responseData = await reservation.create.call(this, i);
								break;
							case 'get':
								responseData = await reservation.get.call(this, i);
								break;
							case 'getAll':
								responseData = await reservation.getAll.call(this, i);
								break;
							case 'update':
								responseData = await reservation.update.call(this, i);
								break;
							case 'updateStatus':
								responseData = await reservation.updateStatus.call(this, i);
								break;
							case 'updateGuestStayStatus':
								responseData = await reservation.updateGuestStayStatus.call(this, i);
								break;
							case 'updateSource':
								responseData = await reservation.updateSource.call(this, i);
								break;
							case 'updateGuestBreakdown':
								responseData = await reservation.updateGuestBreakdown.call(this, i);
								break;
							case 'alterDates':
								responseData = await reservation.alterDates.call(this, i);
								break;
							case 'addNote':
								responseData = await reservation.addNote.call(this, i);
								break;
							case 'cancel':
								responseData = await reservation.cancel.call(this, i);
								break;
						}
						break;

					case 'quote':
						switch (operation) {
							case 'create':
								responseData = await quote.create.call(this, i);
								break;
							case 'createReservation':
								responseData = await quote.createReservation.call(this, i);
								break;
						}
						break;

					case 'guest':
						switch (operation) {
							case 'create':
								responseData = await guest.create.call(this, i);
								break;
							case 'get':
								responseData = await guest.get.call(this, i);
								break;
							case 'getAll':
								responseData = await guest.getAll.call(this, i);
								break;
							case 'update':
								responseData = await guest.update.call(this, i);
								break;
							case 'search':
								responseData = await guest.search.call(this, i);
								break;
						}
						break;

					case 'calendar':
						switch (operation) {
							case 'get':
								responseData = await calendar.get.call(this, i);
								break;
							case 'update':
								responseData = await calendar.update.call(this, i);
								break;
							case 'block':
								responseData = await calendar.block.call(this, i);
								break;
							case 'unblock':
								responseData = await calendar.unblock.call(this, i);
								break;
						}
						break;

					case 'task':
						switch (operation) {
							case 'create':
								responseData = await task.create.call(this, i);
								break;
							case 'get':
								responseData = await task.get.call(this, i);
								break;
							case 'getAll':
								responseData = await task.getAll.call(this, i);
								break;
							case 'update':
								responseData = await task.update.call(this, i);
								break;
							case 'delete':
								responseData = await task.deleteTask.call(this, i);
								break;
						}
						break;

					case 'conversation':
						switch (operation) {
							case 'get':
								responseData = await conversation.get.call(this, i);
								break;
							case 'getAll':
								responseData = await conversation.getAll.call(this, i);
								break;
							case 'sendMessage':
								responseData = await conversation.sendMessage.call(this, i);
								break;
							case 'getMessages':
								responseData = await conversation.getMessages.call(this, i);
								break;
						}
						break;

					case 'owner':
						switch (operation) {
							case 'create':
								responseData = await owner.create.call(this, i);
								break;
							case 'get':
								responseData = await owner.get.call(this, i);
								break;
							case 'getAll':
								responseData = await owner.getAll.call(this, i);
								break;
							case 'update':
								responseData = await owner.update.call(this, i);
								break;
						}
						break;

					case 'invoice':
						switch (operation) {
							case 'get':
								responseData = await invoice.get.call(this, i);
								break;
							case 'getAll':
								responseData = await invoice.getAll.call(this, i);
								break;
							case 'addPayment':
								responseData = await invoice.addPayment.call(this, i);
								break;
							case 'addInvoiceItem':
								responseData = await invoice.addInvoiceItem.call(this, i);
								break;
							case 'createPayout':
								responseData = await invoice.createPayout.call(this, i);
								break;
						}
						break;

					case 'webhook':
						switch (operation) {
							case 'create':
								responseData = await webhook.create.call(this, i);
								break;
							case 'getAll':
								responseData = await webhook.getAll.call(this, i);
								break;
							case 'update':
								responseData = await webhook.update.call(this, i);
								break;
							case 'delete':
								responseData = await webhook.deleteWebhook.call(this, i);
								break;
						}
						break;
				}

				returnData.push(...responseData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
