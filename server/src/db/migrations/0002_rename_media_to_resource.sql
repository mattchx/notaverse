-- Migration to rename media_items to resources and update related references

-- Rename main table
ALTER TABLE media_items RENAME TO resources;

-- Create temporary sections table with new foreign key
CREATE TABLE sections_new (
  id TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  number INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old sections table
INSERT INTO sections_new 
SELECT id, media_id, title, number, created_at, updated_at FROM sections;

-- Drop old table and rename new one
DROP TABLE sections;
ALTER TABLE sections_new RENAME TO sections;

-- Recreate indexes that may have been dropped
CREATE INDEX idx_sections_resource_id ON sections(resource_id);