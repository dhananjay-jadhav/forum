-- Enter migration here

CREATE ROLE IF NOT EXISTS graphiledemo WITH LOGIN PASSWORD 'password' SUPERUSER;

CREATE ROLE if NOT EXISTS graphiledemo_authenticator WITH LOGIN PASSWORD 'auth_password' NOINHERIT;

CREATE ROLE graphiledemo_visitor;

GRANT graphiledemo_visitor TO graphiledemo_authenticator;
