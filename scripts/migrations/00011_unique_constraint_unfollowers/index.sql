ALTER TABLE unfollowers
ADD CONSTRAINT unique_unfollower_per_user
UNIQUE (github_id, user_id);
