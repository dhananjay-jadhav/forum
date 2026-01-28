-- Enter migration here

-- Subscription Triggers for LISTEN/NOTIFY
--
-- This migration adds triggers that notify on INSERT/UPDATE/DELETE operations
-- for users, forums, topics, and posts tables.

-- Create a function to notify on table changes
CREATE OR REPLACE FUNCTION app_private.tg__notify_subscription()
RETURNS trigger AS $$
DECLARE
    channel text;
    all_channel text := 'app:all';
    payload jsonb;
    record_data jsonb;
    old_data jsonb;
BEGIN
    -- Determine channel based on table name
    channel := 'app:' || TG_TABLE_NAME;

    -- Build the payload
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        payload := jsonb_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA,
            'timestamp', now(),
            'old', old_data
        );
    ELSIF TG_OP = 'UPDATE' THEN
        record_data := to_jsonb(NEW);
        old_data := to_jsonb(OLD);
        payload := jsonb_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA,
            'timestamp', now(),
            'new', record_data,
            'old', old_data
        );
    ELSE -- INSERT
        record_data := to_jsonb(NEW);
        payload := jsonb_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA,
            'timestamp', now(),
            'new', record_data
        );
    END IF;

    -- Notify on table-specific channel
    PERFORM pg_notify(channel, payload::text);

    -- Also notify on 'all' channel
    PERFORM pg_notify(all_channel, payload::text);

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

COMMENT ON FUNCTION app_private.tg__notify_subscription()
IS 'Trigger function to notify subscribers via PostgreSQL LISTEN/NOTIFY on table changes.';

-- Add subscription triggers to users table
CREATE TRIGGER _500_notify_subscription
    AFTER INSERT OR UPDATE OR DELETE ON app_public.users
    FOR EACH ROW
    EXECUTE FUNCTION app_private.tg__notify_subscription();

COMMENT ON TRIGGER _500_notify_subscription ON app_public.users
IS 'Notifies subscribers when users are created, updated, or deleted.';

-- Add subscription triggers to forums table
CREATE TRIGGER _500_notify_subscription
    AFTER INSERT OR UPDATE OR DELETE ON app_public.forums
    FOR EACH ROW
    EXECUTE FUNCTION app_private.tg__notify_subscription();

COMMENT ON TRIGGER _500_notify_subscription ON app_public.forums
IS 'Notifies subscribers when forums are created, updated, or deleted.';

-- Add subscription triggers to topics table
CREATE TRIGGER _500_notify_subscription
    AFTER INSERT OR UPDATE OR DELETE ON app_public.topics
    FOR EACH ROW
    EXECUTE FUNCTION app_private.tg__notify_subscription();

COMMENT ON TRIGGER _500_notify_subscription ON app_public.topics
IS 'Notifies subscribers when topics are created, updated, or deleted.';

-- Add subscription triggers to posts table
CREATE TRIGGER _500_notify_subscription
    AFTER INSERT OR UPDATE OR DELETE ON app_public.posts
    FOR EACH ROW
    EXECUTE FUNCTION app_private.tg__notify_subscription();

COMMENT ON TRIGGER _500_notify_subscription ON app_public.posts
IS 'Notifies subscribers when posts are created, updated, or deleted.';
