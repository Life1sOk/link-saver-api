BEGIN TRANSACTION;

CREATE TABLE users (
    id serial PRIMARY KEY,
    username VARCHAR(100),
    email text UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL
);

COMMIT;