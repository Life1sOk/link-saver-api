BEGIN TRANSACTION;

CREATE TABLE friends (
    id serial PRIMARY KEY,
    confirmed BOOLEAN NOT NULL DEFAULT 'false',
    user_id_one int NOT NULL,
    user_id_two int NOT NULL,
    created_at TIMESTAMP NOT NULL
);

COMMIT;