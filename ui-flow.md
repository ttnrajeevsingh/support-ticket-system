# UI Flow

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Ticket List | Dashboard card with search, filters, paginated table |
| `/tickets/new` | Create Ticket | Form with validation |
| `/tickets/[id]` | Ticket Detail | View/edit fields, status control, comments |

## User Flows

### 1. View and Search Tickets
```
Homepage → See ticket list in card layout
  → Type in search bar (debounced 300ms) → Table updates
  → Select status/priority/assignee filter → Table updates, page resets to 1
  → Click Prev/Next → Paginate through results
  → Click any row → Navigate to ticket detail
```

### 2. Create a Ticket
```
Click "+ New Ticket" button (in toolbar)
  → Fill form: title, description, priority, assignee, created by
  → Submit → Client-side validation runs
  → If invalid: inline field errors shown, no API call
  → If valid: POST /tickets → redirect to home → new ticket in list
```

### 3. View and Edit Ticket
```
Click ticket row → Detail page loads
  → See: title, description, priority, assignee, status, timestamps, comments
  → Click "Edit" → Inline form appears (title, description, priority, assignee)
  → Save → PATCH /tickets/:id → fields update without page reload
  → Cancel → form collapses, no changes
```

### 4. Change Ticket Status
```
On detail page → "Transition Status" section shows current status badge
  → Only valid next-state buttons rendered (e.g., "Start Progress", "Cancel Ticket")
  → Click button → PATCH /tickets/:id/status
  → If valid: status updates in place, new buttons appear
  → If 422 (race condition): error banner shown, dismissed after 5s
  → Terminal states (closed/cancelled): "No further transitions" message, no buttons
```

### 5. Add a Comment
```
On detail page → Comments section at bottom
  → Type message in textarea
  → Select user (dropdown)
  → Click "Post Comment"
  → If empty: inline error "Comment cannot be empty"
  → If valid: POST /tickets/:id/comments → comment appends to list immediately
```

## Component Architecture

```
app/layout.tsx (Header + main container)
├── app/page.tsx
│   └── TicketListView (client component)
│       ├── SearchBar (debounced input)
│       ├── StatusFilter (dropdown)
│       ├── PriorityFilter (dropdown)
│       ├── AssigneeFilter (dropdown, populated from /users)
│       ├── TicketTableSkeleton (loading state)
│       ├── Table with clickable rows (Jira-style hover)
│       └── Pagination (Prev/Next + page info)
├── app/tickets/new/page.tsx
│   └── TicketForm (controlled inputs, validation, submit)
└── app/tickets/[id]/page.tsx
    └── TicketDetailView (client component)
        ├── TicketHeader (title, creator, date)
        ├── TicketFields (grid, inline edit mode)
        ├── StatusControl (valid transition buttons only)
        └── CommentSection
            ├── CommentList → CommentItem (each)
            └── CommentForm (textarea + submit)
```

## State Management

Zustand stores (no Redux):
- `useTicketStore` — tickets list, activeTicket, pagination, CRUD actions
- `useCommentStore` — comments for active ticket, add action
- `useUserStore` — user list for dropdowns (fetched once)

## Loading & Error States

| State | UI |
|-------|-----|
| Initial load | Skeleton shimmer matching table layout |
| Search/filter in progress | Skeleton replaces table |
| Empty results | "No tickets found" + contextual message |
| API error (400/422) | Inline error banner near the action |
| API error (500) | Generic error message |
| Network failure | "Failed to load tickets" in error state |
