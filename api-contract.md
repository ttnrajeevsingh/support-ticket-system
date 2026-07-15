# API Contract

Base URL: `http://localhost:3001/api/v1`

---

## Endpoint: List Tickets
**Method:** GET  
**Path:** `/tickets`  
**Purpose:** Retrieve paginated, searchable, filterable ticket list

### Request
Query parameters:
```
?search=dark&status=open&priority=high&assignedTo=uuid&page=1&limit=10
```

### Response (200)
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Login page crashes",
      "description": "...",
      "priority": "high",
      "status": "open",
      "assignedTo": "uuid",
      "createdBy": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "creator": { "id": "uuid", "name": "Alice", "email": "...", "role": "admin" },
      "assignee": { "id": "uuid", "name": "Bob", "email": "...", "role": "agent" }
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

### Validation Rules
- `status`: must be one of open, in_progress, resolved, closed, cancelled
- `priority`: must be one of low, medium, high, critical
- `assignedTo`: must be valid UUID
- `page`: positive integer
- `limit`: 1–100

### Error Responses
- 400 `VALIDATION_ERROR` — invalid query parameter values

---

## Endpoint: Create Ticket
**Method:** POST  
**Path:** `/tickets`  
**Purpose:** Create a new ticket

### Request
```json
{
  "title": "Bug in login page",
  "description": "Users report blank screen after tapping login on iOS",
  "priority": "high",
  "assignedTo": "uuid (optional)",
  "createdBy": "uuid"
}
```

### Response (201)
```json
{ "id": "uuid", "title": "...", "status": "open", ... }
```

### Validation Rules
- `title`: required, 3–200 characters
- `description`: required, minimum 10 characters
- `priority`: required, one of low/medium/high/critical
- `createdBy`: required, valid UUID
- `assignedTo`: optional, valid UUID

### Error Responses
- 400 `VALIDATION_ERROR` — missing or invalid fields

---

## Endpoint: Get Ticket
**Method:** GET  
**Path:** `/tickets/:id`  
**Purpose:** Get ticket with all comments

### Response (200)
```json
{
  "id": "uuid", "title": "...", "status": "open",
  "comments": [
    { "id": "uuid", "message": "...", "author": {...}, "createdAt": "..." }
  ]
}
```

### Error Responses
- 404 `TICKET_NOT_FOUND` — ticket doesn't exist

---

## Endpoint: Update Ticket
**Method:** PATCH  
**Path:** `/tickets/:id`  
**Purpose:** Update ticket fields (partial update)

### Request
```json
{ "title": "Updated title", "priority": "critical", "assignedTo": "uuid" }
```

### Validation Rules
- All fields optional, but at least one required
- Same constraints as create (if field provided)

### Error Responses
- 400 `VALIDATION_ERROR` — invalid field values
- 404 `TICKET_NOT_FOUND` — ticket doesn't exist

---

## Endpoint: Change Status
**Method:** PATCH  
**Path:** `/tickets/:id/status`  
**Purpose:** Transition ticket status (enforces state machine)

### Request
```json
{ "status": "in_progress", "userId": "uuid" }
```

### Response (200)
Updated ticket object

### Validation Rules
- `status`: required, valid enum value
- `userId`: required, valid UUID
- Transition must be valid per state machine

### Error Responses
- 400 `VALIDATION_ERROR` — missing/invalid fields
- 404 `TICKET_NOT_FOUND` — ticket doesn't exist
- 422 `INVALID_TRANSITION` — state machine violation

---

## Endpoint: Add Comment
**Method:** POST  
**Path:** `/tickets/:id/comments`  
**Purpose:** Add a comment to a ticket

### Request
```json
{ "message": "Investigating the issue", "createdBy": "uuid" }
```

### Response (201)
```json
{ "id": "uuid", "ticketId": "uuid", "message": "...", "author": {...}, "createdAt": "..." }
```

### Validation Rules
- `message`: required, non-empty
- `createdBy`: required, valid UUID

### Error Responses
- 400 `VALIDATION_ERROR` — empty message or invalid UUID
- 404 `TICKET_NOT_FOUND` — ticket doesn't exist

---

## Endpoint: List Comments
**Method:** GET  
**Path:** `/tickets/:id/comments`  
**Purpose:** List comments for a ticket (chronological)

### Response (200)
Array of comment objects ordered by createdAt ascending

### Error Responses
- 404 `TICKET_NOT_FOUND` — ticket doesn't exist

---

## Endpoint: List Users
**Method:** GET  
**Path:** `/users`  
**Purpose:** List all users (for assignee dropdown)

### Response (200)
```json
[{ "id": "uuid", "name": "Alice Admin", "email": "...", "role": "admin", "createdAt": "..." }]
```
