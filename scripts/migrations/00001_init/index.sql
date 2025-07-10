-- DROP TABLE IF EXISTS followers CASCADE;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  github_id BIGINT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  fetched_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS followers (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  avatar_url TEXT,
  fetched_at TIMESTAMP DEFAULT NOW()
);
