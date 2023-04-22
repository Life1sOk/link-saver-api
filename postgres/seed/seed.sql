BEGIN TRANSACTION;

INSERT INTO users (username, email, created_at) values ('Sally', 'sally@gmail.com', '1997-01-01');
INSERT INTO login (hash, email, created_at) values ('$2a$12$mCIn3UnhIh1sYe7JeUMPyeHW00ZGzR2CFzj0QOJyusjZx.8BZreaS', 'sally@gmail.com', '1997-01-01');

COMMIT;