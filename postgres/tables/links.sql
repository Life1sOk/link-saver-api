BEGIN TRANSACTION;

CREATE TABLE links (
    id serial PRIMARY KEY,
    status BOOLEAN NOT NULL DEFAULT 'false',
    user_id int NOT NULL,
    group_id int,
    link_title text NOT NULL,
    link_url text NOT NULL,
    created_at TIMESTAMP NOT NULL
);

COMMIT;