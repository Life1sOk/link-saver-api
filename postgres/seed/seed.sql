BEGIN TRANSACTION;

INSERT INTO users (username, email, created_at) values ('Sally', 'sally@gmail.com', '1997-01-01');
INSERT INTO login (hash, email, created_at) values ('$2a$12$WtjiDMaqDqEcPuzzQoLeQ.nlJFKHVQFKSHcuDTl9PZ60EBkqBPFKC', 'sally@gmail.com', '1997-01-01');

INSERT INTO users (username, email, created_at) values ('Molly', 'molly@gmail.com', '1997-01-01');
INSERT INTO login (hash, email, created_at) values ('$2a$12$WtjiDMaqDqEcPuzzQoLeQ.nlJFKHVQFKSHcuDTl9PZ60EBkqBPFKC', 'molly@gmail.com', '1997-01-01');

INSERT INTO users (username, email, created_at) values ('Polly', 'polly@gmail.com', '1997-01-01');
INSERT INTO login (hash, email, created_at) values ('$2a$12$WtjiDMaqDqEcPuzzQoLeQ.nlJFKHVQFKSHcuDTl9PZ60EBkqBPFKC', 'polly@gmail.com', '1997-01-01');

INSERT INTO users (username, email, created_at) values ('Molly2', 'molly2@gmail.com', '1997-01-01');
INSERT INTO login (hash, email, created_at) values ('$2a$12$WtjiDMaqDqEcPuzzQoLeQ.nlJFKHVQFKSHcuDTl9PZ60EBkqBPFKC', 'molly2@gmail.com', '1997-01-01');

INSERT INTO users (username, email, created_at) values ('Molly3', 'molly3@gmail.com', '1997-01-01');
INSERT INTO login (hash, email, created_at) values ('$2a$12$WtjiDMaqDqEcPuzzQoLeQ.nlJFKHVQFKSHcuDTl9PZ60EBkqBPFKC', 'molly3@gmail.com', '1997-01-01');

INSERT INTO users (username, email, created_at) values ('Sally2', 'sally2@gmail.com', '1997-01-01');
INSERT INTO login (hash, email, created_at) values ('$2a$12$WtjiDMaqDqEcPuzzQoLeQ.nlJFKHVQFKSHcuDTl9PZ60EBkqBPFKC', 'sally2@gmail.com', '1997-01-01');

INSERT INTO users (username, email, created_at) values ('Sally3', 'sally3@gmail.com', '1997-01-01');
INSERT INTO login (hash, email, created_at) values ('$2a$12$WtjiDMaqDqEcPuzzQoLeQ.nlJFKHVQFKSHcuDTl9PZ60EBkqBPFKC', 'sally3@gmail.com', '1997-01-01');

COMMIT;