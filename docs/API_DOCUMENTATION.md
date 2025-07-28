# API Documentation

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication
Currently using mock authentication. In production, use JWT tokens:

\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

## Error Responses

All API endpoints return standardized error responses:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
\`\`\`

## Rate Limiting

- **General API**: 100 requests per minute per IP
- **Sensitive Operations**: 10 requests per minute per IP
- **Headers Returned**:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `Retry-After`: Seconds to wait (when rate limited)

## Bills API

### GET /api/bills
Retrieve all bills with optional filtering.

**Query Parameters:**
- `status` (string): Filter by bill status
- `customerId` (string): Filter by customer ID
- `search` (string): Search in bill number, customer name
- `limit` (number): Number of results (default: 50, max: 100)
- `offset` (number): Pagination offset

**Response:**
\`\`\`json
{
  "bills": [
    {
      "id": "bill-123",
      "billNumber": "INV-2024-001",
      "customer": {
        "id": "customer-456",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "total": 1500.00,
      "status": "sent",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
\`\`\`

### GET /api/bills/[id]
Retrieve a specific bill by ID.

**Response:**
\`\`\`json
{
  "id": "bill-123",
  "billNumber": "INV-2024-001",
  "customer": {
    "id": "customer-456",
    "name": "John Doe",
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    }
  },
  "items": [
    {
      "id": "item-789",
      "name": "3-Seater Sofa Cover",
      "quantity": 2,
      "unitPrice": 750.00,
      "total": 1500.00
    }
  ],
  "subtotal": 1500.00,
  "tax": 105.00,
  "discount": 0.00,
  "total": 1605.00,
  "paidAmount": 0.00,
  "remainingBalance": 1605.00,
  "status": "sent",
  "priority": "medium",
  "tags": ["standard", "retail"],
  "dueDate": "2024-02-15T00:00:00Z",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
\`\`\`

### POST /api/bills
Create a new bill.

**Request Body:**
\`\`\`json
{
  "customerId": "customer-456",
  "items": [
    {
      "productId": "product-123",
      "quantity": 2,
      "unitPrice": 750.00
    }
  ],
  "dueDate": "2024-02-15T00:00:00Z",
  "notes": "Rush order for special event",
  "tags": ["rush", "vip"]
}
\`\`\`

### PUT /api/bills/[id]
Update an existing bill.

**Request Body:**
\`\`\`json
{
  "status": "paid",
  "paidAmount": 1605.00,
  "notes": "Payment received via bank transfer"
}
\`\`\`

### POST /api/bills/[id]/notify-payment
Send payment notification for a bill.

**Request Body:**
\`\`\`json
{
  "message": "Payment made via bank transfer on 2024-01-20"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "notificationId": "notif-789"
}
\`\`\`

## Customers API

### GET /api/customers
Retrieve all customers.

### GET /api/customers/[id]
Retrieve a specific customer.

### POST /api/customers
Create a new customer.

### PUT /api/customers/[id]
Update customer information.

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak Street",
    "city": "New City",
    "state": "NY",
    "zipCode": "54321",
    "country": "USA"
  }
}
\`\`\`

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `SERVICE_UNAVAILABLE` | External service unavailable |

## Webhooks (Future Implementation)

### Bill Status Updates
\`\`\`json
{
  "event": "bill.status_changed",
  "data": {
    "billId": "bill-123",
    "oldStatus": "sent",
    "newStatus": "paid",
    "timestamp": "2024-01-20T15:30:00Z"
  }
}
\`\`\`

### Payment Notifications
\`\`\`json
{
  "event": "payment.received",
  "data": {
    "billId": "bill-123",
    "amount": 1605.00,
    "method": "bank_transfer",
    "timestamp": "2024-01-20T15:30:00Z"
  }
}
