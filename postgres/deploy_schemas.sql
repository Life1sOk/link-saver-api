-- Deploy fresh database tables
\i '/docker-entrypoint-initdb.d/table/users.sql'
\i '/docker-entrypoint-initdb.d/table/login.sql'
\i '/docker-entrypoint-initdb.d/table/topics.sql'
\i '/docker-entrypoint-initdb.d/table/groups.sql'
\i '/docker-entrypoint-initdb.d/table/links.sql'
\i '/docker-entrypoint-initdb.d/table/friends.sql'
\i '/docker-entrypoint-initdb.d/table/transition.sql'

\i '/docker-entrypoint-initdb.d/seed/seed.sql'