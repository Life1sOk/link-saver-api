BEGIN TRANSACTION;

CREATE TABLE login (
    id serial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    hash VARCHAR(100) NOT NULL,
    confirmed BOOLEAN NOT NULL DEFAULT 'false',
    created_at TIMESTAMP NOT NULL
);

COMMIT;