/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

// Base types
export interface IGuestyAddress {
	full?: string;
	street?: string;
	city?: string;
	state?: string;
	country?: string;
	zipcode?: string;
	lat?: number;
	lng?: number;
}

export interface IGuestyPrices {
	basePrice?: number;
	currency?: string;
	weeklyPriceFactor?: number;
	monthlyPriceFactor?: number;
	cleaningFee?: number;
	securityDepositFee?: number;
	extraPersonFee?: number;
}

export interface IGuestyTerms {
	minNights?: number;
	maxNights?: number;
	cancellation?: string;
}

// Listing types
export interface IGuestyListing extends IDataObject {
	_id?: string;
	title?: string;
	nickname?: string;
	isListed?: boolean;
	propertyType?: string;
	roomType?: string;
	accommodates?: number;
	bedrooms?: number;
	bathrooms?: number;
	beds?: number;
	address?: IGuestyAddress;
	prices?: IGuestyPrices;
	terms?: IGuestyTerms;
	publicDescription?: {
		summary?: string;
		space?: string;
		access?: string;
		interactionWithGuests?: string;
		neighborhood?: string;
		transit?: string;
		houseRules?: string;
	};
	amenities?: string[];
	pictures?: IGuestyPhoto[];
	createdAt?: string;
	updatedAt?: string;
}

export interface IGuestyPhoto {
	_id?: string;
	original?: string;
	thumbnail?: string;
	caption?: string;
	order?: number;
}

export interface IGuestyCalendarDay {
	date?: string;
	status?: 'available' | 'blocked' | 'booked';
	price?: number;
	currency?: string;
	minNights?: number;
	blockReason?: string;
	note?: string;
	reservation?: {
		_id?: string;
		confirmationCode?: string;
	};
}

// Reservation types
export interface IGuestyGuest extends IDataObject {
	_id?: string;
	firstName?: string;
	lastName?: string;
	fullName?: string;
	email?: string;
	phones?: Array<{
		number?: string;
		type?: string;
	}>;
	address?: IGuestyAddress;
	notes?: string;
	tags?: string[];
	picture?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface IGuestyMoney {
	currency?: string;
	fareAccommodation?: number;
	fareCleaning?: number;
	hostPayout?: number;
	totalPrice?: number;
	totalPaid?: number;
	balanceDue?: number;
	invoiceItems?: Array<{
		title?: string;
		amount?: number;
		quantity?: number;
		type?: string;
	}>;
}

export interface IGuestyReservation extends IDataObject {
	_id?: string;
	confirmationCode?: string;
	listingId?: string;
	listing?: Partial<IGuestyListing>;
	guestId?: string;
	guest?: Partial<IGuestyGuest>;
	checkInDateLocalized?: string;
	checkOutDateLocalized?: string;
	checkIn?: string;
	checkOut?: string;
	nightsCount?: number;
	status?: 'inquiry' | 'reserved' | 'confirmed' | 'canceled' | 'closed';
	guestStayStatus?: 'scheduled' | 'checked_in' | 'checked_out' | 'canceled';
	source?: string;
	money?: IGuestyMoney;
	guests?: {
		adults?: number;
		children?: number;
		infants?: number;
		pets?: number;
	};
	notes?: Array<{
		_id?: string;
		text?: string;
		createdAt?: string;
	}>;
	customFields?: IDataObject;
	createdAt?: string;
	updatedAt?: string;
}

// Quote types
export interface IGuestyQuote extends IDataObject {
	_id?: string;
	listingId?: string;
	checkInDateLocalized?: string;
	checkOutDateLocalized?: string;
	nightsCount?: number;
	guestsCount?: number;
	money?: IGuestyMoney;
	rates?: Array<{
		date?: string;
		rate?: number;
	}>;
	expiresAt?: string;
}

// Task types
export interface IGuestyTask extends IDataObject {
	_id?: string;
	type?: string;
	listingId?: string;
	reservationId?: string;
	assigneeId?: string;
	supervisorId?: string;
	scheduledFor?: string;
	status?: 'pending' | 'confirmed' | 'completed' | 'canceled';
	description?: string;
	checklist?: Array<{
		title?: string;
		completed?: boolean;
	}>;
	notes?: string;
	createdAt?: string;
	updatedAt?: string;
}

// Conversation types
export interface IGuestyMessage {
	_id?: string;
	body?: string;
	sentAt?: string;
	module?: string;
	sentBy?: 'guest' | 'host' | 'system';
	isRead?: boolean;
}

export interface IGuestyConversation extends IDataObject {
	_id?: string;
	reservationId?: string;
	guestId?: string;
	guest?: Partial<IGuestyGuest>;
	lastMessage?: IGuestyMessage;
	unreadCount?: number;
	createdAt?: string;
	updatedAt?: string;
}

// Owner types
export interface IGuestyOwner extends IDataObject {
	_id?: string;
	firstName?: string;
	lastName?: string;
	fullName?: string;
	email?: string;
	phone?: string;
	address?: IGuestyAddress;
	listingIds?: string[];
	createdAt?: string;
	updatedAt?: string;
}

// Invoice types
export interface IGuestyInvoice extends IDataObject {
	_id?: string;
	reservationId?: string;
	type?: string;
	amount?: number;
	currency?: string;
	status?: 'pending' | 'confirmed' | 'canceled';
	items?: Array<{
		title?: string;
		amount?: number;
		quantity?: number;
	}>;
	payments?: Array<{
		_id?: string;
		amount?: number;
		method?: string;
		paidAt?: string;
	}>;
	createdAt?: string;
	updatedAt?: string;
}

// Webhook types
export interface IGuestyWebhook extends IDataObject {
	_id?: string;
	url?: string;
	events?: string[];
	secret?: string;
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

// API Response types
export interface IGuestyPaginatedResponse<T> {
	results: T[];
	count: number;
	limit: number;
	skip: number;
}

// Webhook event types
export type GuestyWebhookEvent =
	| 'reservation.new'
	| 'reservation.updated'
	| 'reservation.cancelled'
	| 'listing.updated'
	| 'task.created'
	| 'task.updated'
	| 'payment.received'
	| 'message.received'
	| 'calendar.updated';

export interface IGuestyWebhookPayload {
	event: GuestyWebhookEvent;
	data: IDataObject;
	timestamp: string;
	webhookId: string;
}
