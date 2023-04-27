BEGIN TRANSACTION;

INSERT INTO users (username, email, created_at) values ('Sally', 'sally@gmail.com', '1997-01-01');
INSERT INTO login (hash, email, created_at) values ('$2a$12$WtjiDMaqDqEcPuzzQoLeQ.nlJFKHVQFKSHcuDTl9PZ60EBkqBPFKC', 'sally@gmail.com', '1997-01-01');

COMMIT;