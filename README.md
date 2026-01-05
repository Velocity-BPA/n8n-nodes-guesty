# n8n-nodes-guesty

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Guesty property management platform providing 10 resources and 56+ operations for listings, reservations, guest communication, calendar management, tasks, and automation workflows. Enables seamless integration between Guesty and 400+ other services in n8n.

![npm](https://img.shields.io/npm/v/n8n-nodes-guesty)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![n8n](https://img.shields.io/badge/n8n-community%20node-orange)

## Features

- **Complete Listings Management**: Create, update, and manage property listings with full support for photos, amenities, and calendar settings
- **Reservation Workflows**: Handle the complete booking lifecycle from inquiry to checkout with status tracking
- **Quote Generation**: Create quotes and convert them to confirmed reservations via the Booking API
- **Guest Database**: Maintain comprehensive guest profiles with contact information and stay history
- **Calendar Control**: Block dates, update availability, and manage pricing across your portfolio
- **Task Automation**: Create and assign tasks for cleaning, maintenance, check-in/out, and inspections
- **Guest Communication**: Access conversation threads and send messages through connected channels
- **Owner Management**: Track property owners and their listing assignments
- **Financial Operations**: Record payments, add invoice items, and create owner payouts
- **Webhook Triggers**: Automate workflows based on real-time Guesty events

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Search for `n8n-nodes-guesty`
4. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-guesty
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-guesty.zip
cd n8n-nodes-guesty

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-guesty

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-guesty %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

The Guesty node uses OAuth 2.0 Client Credentials authentication.

| Field | Description |
|-------|-------------|
| **Client ID** | Your Guesty API Client ID |
| **Client Secret** | Your Guesty API Client Secret |

To obtain API credentials:

1. Log in to your Guesty account
2. Navigate to **Marketplace** > **Open API**
3. Create a new API application
4. Copy the Client ID and Client Secret

## Resources & Operations

### Listings (12 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a new listing |
| Get | Retrieve a single listing |
| Get All | List all listings with filters |
| Update | Update listing details |
| Get Calendar | Retrieve availability calendar |
| Update Calendar | Modify calendar dates |
| Get Photos | List listing photos |
| Add Photo | Upload a new photo |
| Update Photo | Modify photo details |
| Delete Photo | Remove a photo |
| Get Amenities | List listing amenities |
| Update Amenities | Modify amenities |

### Reservations (11 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a new reservation |
| Get | Retrieve a single reservation |
| Get All | List reservations with filters |
| Update | Update reservation details |
| Update Status | Change booking status |
| Update Guest Stay Status | Update check-in/out status |
| Update Source | Change booking source |
| Update Guest Breakdown | Modify guest counts |
| Alter Dates | Change stay dates |
| Add Note | Add a reservation note |
| Cancel | Cancel a reservation |

### Quotes (2 operations)
| Operation | Description |
|-----------|-------------|
| Create | Generate a price quote |
| Create Reservation | Convert quote to booking |

### Guests (5 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a guest profile |
| Get | Retrieve a guest |
| Get All | List all guests |
| Update | Update guest information |
| Search | Search guests by query |

### Calendar (4 operations)
| Operation | Description |
|-----------|-------------|
| Get | Retrieve calendar for listing |
| Update | Update calendar dates |
| Block | Block date range |
| Unblock | Unblock date range |

### Tasks (5 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a new task |
| Get | Retrieve a task |
| Get All | List all tasks |
| Update | Update task details |
| Delete | Remove a task |

### Conversations (4 operations)
| Operation | Description |
|-----------|-------------|
| Get All | List conversations |
| Get | Retrieve a conversation |
| Send Message | Send a message |
| Get Messages | Retrieve messages |

### Owners (4 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create an owner profile |
| Get | Retrieve an owner |
| Get All | List all owners |
| Update | Update owner details |

### Invoices (5 operations)
| Operation | Description |
|-----------|-------------|
| Get All | List invoices |
| Get | Retrieve an invoice |
| Add Payment | Record a payment |
| Add Invoice Item | Add a line item |
| Create Payout | Create owner payout |

### Webhooks (4 operations)
| Operation | Description |
|-----------|-------------|
| Create | Register a webhook |
| Get All | List webhooks |
| Update | Modify a webhook |
| Delete | Remove a webhook |

## Trigger Node

The **Guesty Trigger** node starts workflows when events occur in Guesty.

### Supported Events

| Event | Description |
|-------|-------------|
| `reservation.new` | New reservation created |
| `reservation.updated` | Reservation modified |
| `reservation.cancelled` | Reservation cancelled |
| `listing.updated` | Listing details changed |
| `task.created` | New task created |
| `task.updated` | Task modified |
| `payment.received` | Payment recorded |
| `message.received` | New message received |
| `calendar.updated` | Calendar changed |

## Usage Examples

### Create a Listing

```javascript
{
  "resource": "listing",
  "operation": "create",
  "title": "Beautiful Beach House",
  "propertyType": "house",
  "roomType": "entire_home",
  "accommodates": 6,
  "bedrooms": 3,
  "bathrooms": 2,
  "address": {
    "street": "123 Ocean Drive",
    "city": "Miami Beach",
    "state": "FL",
    "country": "USA",
    "zipcode": "33139"
  }
}
```

### Create a Reservation

```javascript
{
  "resource": "reservation",
  "operation": "create",
  "listingId": "{{$node.Guesty.json._id}}",
  "checkInDateLocalized": "2024-06-15",
  "checkOutDateLocalized": "2024-06-20",
  "guest": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  },
  "source": "direct"
}
```

### Block Calendar Dates

```javascript
{
  "resource": "calendar",
  "operation": "block",
  "listingId": "{{$node.Guesty.json._id}}",
  "startDate": "2024-07-01",
  "endDate": "2024-07-15",
  "blockReason": "maintenance",
  "note": "Scheduled renovations"
}
```

## Guesty API Concepts

### Property Types
- Apartment, House, Villa, Condo
- Hotel, Hostel, B&B, Resort
- Cabin, Cottage, Bungalow, Chalet

### Room Types
- **Entire Place**: Guests have the whole property
- **Private Room**: Guests have their own room
- **Shared Room**: Guests share a room with others

### Reservation Statuses
| Status | Description |
|--------|-------------|
| inquiry | Initial guest inquiry |
| reserved | Tentatively booked |
| confirmed | Booking confirmed |
| canceled | Booking cancelled |
| closed | Stay completed |

### Guest Stay Statuses
| Status | Description |
|--------|-------------|
| scheduled | Future check-in |
| checked_in | Guest has arrived |
| checked_out | Guest has departed |
| canceled | Stay cancelled |

## Error Handling

The node implements comprehensive error handling:

- **Rate Limiting**: Automatic exponential backoff for API rate limits
- **Token Management**: OAuth tokens are cached and refreshed automatically
- **Validation**: Required fields are validated before API calls
- **Pagination**: Large result sets are automatically paginated

## Security Best Practices

1. **Secure Credentials**: Store API credentials securely in n8n's credential manager
2. **Webhook Secrets**: Use webhook secrets to verify incoming payloads
3. **Access Control**: Limit API access to required scopes only
4. **Audit Logging**: Enable audit logs for compliance requirements

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please read the contribution guidelines before submitting pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (`npm test`)
5. Submit a pull request

## Support

- **Documentation**: [Guesty API Docs](https://open-api.guesty.com/docs)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-guesty/issues)
- **Community**: [n8n Community Forum](https://community.n8n.io)

## Acknowledgments

- [n8n](https://n8n.io) - The workflow automation platform
- [Guesty](https://guesty.com) - Property management platform
- The n8n community for their contributions and feedback
