ALTER TABLE followers ADD CONSTRAINT unique_follower_per_user UNIQUE (username, github_id)
