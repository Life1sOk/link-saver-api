BEGIN TRANSACTION;

CREATE TABLE transition (
    id serial PRIMARY KEY,
    from_user_id int NOT NULL,
    to_user_id int NOT NULL,
    group_id int NOT NULL,
    created_at TIMESTAMP NOT NULL
);

COMMIT;