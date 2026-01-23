--! Previous: sha1:a0cad2a62400135facabc94e4745acd38e199f11
--! Hash: sha1:e5ffceccd41a7feb2703c546fd3127930a34f6a0

-- Enter migration here
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'graphiledemo') THEN
      CREATE ROLE graphiledemo WITH LOGIN PASSWORD 'password' SUPERUSER;
   END IF;
END $$;

-- 2. Create Authenticator (The entry point for PostGraphile)
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'graphiledemo_authenticator') THEN
      CREATE ROLE graphiledemo_authenticator WITH LOGIN PASSWORD 'auth_password' NOINHERIT;
   END IF;
END $$;

-- 3. Create Visitor (The role PostGraphile switches to)
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'graphiledemo_visitor') THEN
      CREATE ROLE graphiledemo_visitor;
   END IF;
   -- Ensure the membership is granted even if roles already existed
   GRANT graphiledemo_visitor TO graphiledemo_authenticator;
END $$;

-- 4. Schemas
CREATE SCHEMA IF NOT EXISTS app_jobs;
CREATE SCHEMA IF NOT EXISTS app_public;
CREATE SCHEMA IF NOT EXISTS app_private;

-- 5. Permissions
GRANT USAGE ON SCHEMA app_public TO graphiledemo_visitor;

-- 6. Default Privileges (Ensure sequences work for ID generation)
ALTER DEFAULT PRIVILEGES FOR ROLE graphiledemo IN SCHEMA app_public 
GRANT USAGE, SELECT ON SEQUENCES TO graphiledemo_visitor;
