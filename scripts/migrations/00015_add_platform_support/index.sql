-- all this shalaye is so i don't lose my mind wheni come back
-- to this file, months from now.

-- default platform should be github
ALTER TABLE users
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'github';

-- because we're now introducing another platform
-- this column has to acommodate any data type(?) for now at least
ALTER TABLE users
ADD COLUMN IF NOT EXISTS platform_id TEXT;

-- copy existing github_id to platform_id for existing users
UPDATE users
SET platform_id = github_id::TEXT
WHERE platform_id IS NULL;

-- should never be null
ALTER TABLE users
ALTER COLUMN platform_id SET NOT NULL;

-- drop old unique constraint on github_id alone if any.
-- the constraint should accomodate the new platform and platform_id (formerly github_id) columuns
-- unique on (platform, platform_id)
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_github_id_key;

ALTER TABLE users
ADD CONSTRAINT users_platform_platform_id_unique UNIQUE (platform, platform_id);

-- add platform column to followers table
ALTER TABLE followers
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'github';

-- since it'll no longer be a tool for GitHub anymore, it is best to just
-- update the naming; need to use user_id instead of github_id
ALTER TABLE followers
ADD COLUMN IF NOT EXISTS user_id INT;

-- populate user_id by matching github_id to users table
-- to make this compatible with existing data make people no
-- dey wonder where their account fly go
UPDATE followers
SET user_id = users.id
FROM users
WHERE followers.github_id = users.github_id
AND followers.user_id IS NULL;

-- user id should never be null laiye laiye
ALTER TABLE followers
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE followers
ADD CONSTRAINT fk_followers_user
FOREIGN KEY (user_id) REFERENCES users(id);

-- Update unique constraint to include platform
ALTER TABLE followers
DROP CONSTRAINT IF EXISTS unique_follower_per_user;

ALTER TABLE followers
ADD CONSTRAINT unique_follower_per_user UNIQUE (username, platform, user_id);

ALTER TABLE unfollowers
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'github';

-- Update unique constraint to include platform (github | tiktok)
ALTER TABLE unfollowers
DROP CONSTRAINT IF EXISTS unique_unfollower_per_user;

ALTER TABLE unfollowers
ADD CONSTRAINT unique_unfollower_per_user UNIQUE (username, platform, user_id);

-- for scaling when this db grows...
-- need the db lookup to be fast af!
CREATE INDEX IF NOT EXISTS idx_users_platform_id ON users(platform, platform_id);
CREATE INDEX IF NOT EXISTS idx_followers_user_platform ON followers(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_unfollowers_user_platform ON unfollowers(user_id, platform);
