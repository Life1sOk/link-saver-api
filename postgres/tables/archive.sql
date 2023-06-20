BEGIN TRANSACTION;

CREATE TABLE archive (
    id serial PRIMARY KEY,
    user_id int NOT NULL,
    data_id int NOT NULL,
    data_type text NOT NULL
);

COMMIT;