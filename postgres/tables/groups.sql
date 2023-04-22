BEGIN TRANSACTION;

CREATE TABLE groups (
    id serial PRIMARY KEY,
    user_id int NOT NULL,
    topic_id int NOT NULL,
    group_title text NOT NULL,
    created_at TIMESTAMP NOT NULL
);

COMMIT;