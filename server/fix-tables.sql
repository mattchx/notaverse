-- Check if media_items table exists
CREATE TABLE IF NOT EXISTS resources (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  author text,
  source_url text,
  description text,
  created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Check if sections table exists and if it has media_id column
CREATE TABLE IF NOT EXISTS sections (
  id text PRIMARY KEY NOT NULL,
  resource_id text NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  title text NOT NULL,
  number integer NOT NULL,
  created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Check if markers table exists
CREATE TABLE IF NOT EXISTS markers (
  id text PRIMARY KEY NOT NULL,
  section_id text NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id),
  position text NOT NULL,
  order_num integer NOT NULL,
  quote text,
  note text NOT NULL,
  type text DEFAULT 'general' NOT NULL,
  created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
); 