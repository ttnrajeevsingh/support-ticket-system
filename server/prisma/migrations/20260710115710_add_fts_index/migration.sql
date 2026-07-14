-- Add GIN index for full-text search on ticket title and description
-- Used by PATCH /api/v1/tickets?search=<keyword>
CREATE INDEX idx_tickets_fts ON tickets
  USING GIN(to_tsvector('english', title || ' ' || description));
