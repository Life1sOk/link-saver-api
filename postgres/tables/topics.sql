BEGIN TRANSACTION;

CREATE TABLE topics (
    id serial PRIMARY KEY,
    user_id int,
    topic_title text NOT NULL,
    created_at TIMESTAMP NOT NULL
);

COMMIT;