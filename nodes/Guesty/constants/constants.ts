/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const GUESTY_API_BASE_URL = 'https://open-api.guesty.com/v1';
export const GUESTY_BOOKING_API_BASE_URL = 'https://booking-api.guesty.com/v1';
export const GUESTY_AUTH_URL = 'https://open-api.guesty.com/oauth2/token';

export const PROPERTY_TYPES = [
	{ name: 'Apartment', value: 'apartment' },
	{ name: 'House', value: 'house' },
	{ name: 'Bed and Breakfast', value: 'bed_and_breakfast' },
	{ name: 'Boutique Hotel', value: 'boutique_hotel' },
	{ name: 'Bungalow', value: 'bungalow' },
	{ name: 'Cabin', value: 'cabin' },
	{ name: 'Chalet', value: 'chalet' },
	{ name: 'Condominium', value: 'condominium' },
	{ name: 'Cottage', value: 'cottage' },
	{ name: 'Dormitory', value: 'dormitory' },
	{ name: 'Guest Suite', value: 'guest_suite' },
	{ name: 'Guesthouse', value: 'guesthouse' },
	{ name: 'Hostel', value: 'hostel' },
	{ name: 'Hotel', value: 'hotel' },
	{ name: 'Loft', value: 'loft' },
	{ name: 'Nature Lodge', value: 'nature_lodge' },
	{ name: 'Resort', value: 'resort' },
	{ name: 'Serviced Apartment', value: 'serviced_apartment' },
	{ name: 'Studio', value: 'studio' },
	{ name: 'Townhouse', value: 'townhouse' },
	{ name: 'Villa', value: 'villa' },
	{ name: 'Other', value: 'other' },
];

export const ROOM_TYPES = [
	{ name: 'Entire Place', value: 'entire_home' },
	{ name: 'Private Room', value: 'private_room' },
	{ name: 'Shared Room', value: 'shared_room' },
];

export const RESERVATION_STATUSES = [
	{ name: 'Inquiry', value: 'inquiry' },
	{ name: 'Reserved', value: 'reserved' },
	{ name: 'Confirmed', value: 'confirmed' },
	{ name: 'Canceled', value: 'canceled' },
	{ name: 'Closed', value: 'closed' },
];

export const GUEST_STAY_STATUSES = [
	{ name: 'Scheduled', value: 'scheduled' },
	{ name: 'Checked In', value: 'checked_in' },
	{ name: 'Checked Out', value: 'checked_out' },
	{ name: 'Canceled', value: 'canceled' },
];

export const CALENDAR_STATUSES = [
	{ name: 'Available', value: 'available' },
	{ name: 'Blocked', value: 'blocked' },
];

export const BLOCK_REASONS = [
	{ name: 'Owner Block', value: 'owner_block' },
	{ name: 'Maintenance', value: 'maintenance' },
	{ name: 'Other', value: 'other' },
];

export const TASK_TYPES = [
	{ name: 'Cleaning', value: 'cleaning' },
	{ name: 'Checkout', value: 'checkout' },
	{ name: 'Checkin', value: 'checkin' },
	{ name: 'Maintenance', value: 'maintenance' },
	{ name: 'Inspection', value: 'inspection' },
	{ name: 'Delivery', value: 'delivery' },
	{ name: 'General', value: 'general' },
];

export const TASK_STATUSES = [
	{ name: 'Pending', value: 'pending' },
	{ name: 'Confirmed', value: 'confirmed' },
	{ name: 'Completed', value: 'completed' },
	{ name: 'Canceled', value: 'canceled' },
];

export const PAYMENT_METHODS = [
	{ name: 'Credit Card', value: 'credit_card' },
	{ name: 'Cash', value: 'cash' },
	{ name: 'Bank Transfer', value: 'bank_transfer' },
	{ name: 'PayPal', value: 'paypal' },
	{ name: 'Stripe', value: 'stripe' },
	{ name: 'Other', value: 'other' },
];

export const BOOKING_SOURCES = [
	{ name: 'Airbnb', value: 'airbnb' },
	{ name: 'Booking.com', value: 'booking.com' },
	{ name: 'Vrbo', value: 'vrbo' },
	{ name: 'Expedia', value: 'expedia' },
	{ name: 'Direct', value: 'direct' },
	{ name: 'Manual', value: 'manual' },
	{ name: 'Website', value: 'website' },
	{ name: 'Other', value: 'other' },
];

export const WEBHOOK_EVENTS = [
	{ name: 'Reservation - New', value: 'reservation.new' },
	{ name: 'Reservation - Updated', value: 'reservation.updated' },
	{ name: 'Reservation - Cancelled', value: 'reservation.cancelled' },
	{ name: 'Listing - Updated', value: 'listing.updated' },
	{ name: 'Task - Created', value: 'task.created' },
	{ name: 'Task - Updated', value: 'task.updated' },
	{ name: 'Payment - Received', value: 'payment.received' },
	{ name: 'Message - Received', value: 'message.received' },
	{ name: 'Calendar - Updated', value: 'calendar.updated' },
];

export const CURRENCIES = [
	{ name: 'USD - US Dollar', value: 'USD' },
	{ name: 'EUR - Euro', value: 'EUR' },
	{ name: 'GBP - British Pound', value: 'GBP' },
	{ name: 'CAD - Canadian Dollar', value: 'CAD' },
	{ name: 'AUD - Australian Dollar', value: 'AUD' },
	{ name: 'JPY - Japanese Yen', value: 'JPY' },
	{ name: 'CHF - Swiss Franc', value: 'CHF' },
	{ name: 'NZD - New Zealand Dollar', value: 'NZD' },
	{ name: 'MXN - Mexican Peso', value: 'MXN' },
	{ name: 'BRL - Brazilian Real', value: 'BRL' },
];

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
