CREATE TABLE IF NOT EXISTS unfollowers (
    id SERIAL PRIMARY KEY,
    github_id BIGINT NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    unfollowed_at TIMESTAMP DEFAULT NOW(),
    bio TEXT,
    location TEXT,
    name TEXT,
    user_id INT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
);
