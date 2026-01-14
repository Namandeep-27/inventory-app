-- Add reversed column to events table for undo functionality
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS reversed BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for performance on reversed queries
CREATE INDEX IF NOT EXISTS idx_events_reversed ON events(reversed);
