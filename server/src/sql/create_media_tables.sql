-- Media items table
CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('book', 'podcast')),
  author TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL,
  title TEXT NOT NULL,
  number INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (media_id) REFERENCES media_items(id) ON DELETE CASCADE
);

-- Create index for sections
CREATE INDEX IF NOT EXISTS idx_sections_media_id ON sections(media_id);

-- Markers table
CREATE TABLE IF NOT EXISTS markers (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL,
  position TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  quote TEXT,
  note TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- Create index for markers
CREATE INDEX IF NOT EXISTS idx_markers_section_id ON markers(section_id);