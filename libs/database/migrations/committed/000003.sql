--! Previous: sha1:e5ffceccd41a7feb2703c546fd3127930a34f6a0
--! Hash: sha1:609dd97328e395e47d640d9808a5df11eaf4fbc6

-- Enter migration here
CREATE TABLE IF NOT EXISTS app_jobs.job_queues (
  queue_name varchar NOT NULL PRIMARY KEY,
  job_count int DEFAULT 0 NOT NULL,
  locked_at timestamp with time zone,
  locked_by varchar
);
ALTER TABLE app_jobs.job_queues ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS app_jobs.jobs (
  id serial PRIMARY KEY,
  queue_name varchar DEFAULT (public.gen_random_uuid())::varchar NOT NULL,
  task_identifier varchar NOT NULL,
  payload json DEFAULT '{}'::json NOT NULL,
  priority int DEFAULT 0 NOT NULL,
  run_at timestamp with time zone DEFAULT now() NOT NULL,
  attempts int DEFAULT 0 NOT NULL,
  last_error varchar,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);
ALTER TABLE app_jobs.job_queues ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION app_jobs.do_notify() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(TG_ARGV[0], '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app_jobs.update_timestamps() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = NOW();
    NEW.updated_at = NOW();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.created_at = OLD.created_at;
    NEW.updated_at = GREATEST(NOW(), OLD.updated_at + INTERVAL '1 millisecond');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app_jobs.jobs__decrease_job_queue_count() RETURNS trigger AS $$
BEGIN
  UPDATE app_jobs.job_queues
    SET job_count = job_queues.job_count - 1
    WHERE queue_name = OLD.queue_name
    AND job_queues.job_count > 1;

  IF NOT FOUND THEN
    DELETE FROM app_jobs.job_queues WHERE queue_name = OLD.queue_name;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app_jobs.jobs__increase_job_queue_count() RETURNS trigger AS $$
BEGIN
  INSERT INTO app_jobs.job_queues(queue_name, job_count)
    VALUES(NEW.queue_name, 1)
    ON CONFLICT (queue_name) DO UPDATE SET job_count = job_queues.job_count + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS _100_timestamps ON app_jobs.jobs;
CREATE TRIGGER _100_timestamps BEFORE INSERT OR UPDATE ON app_jobs.jobs FOR EACH ROW EXECUTE PROCEDURE app_jobs.update_timestamps();

DROP TRIGGER IF EXISTS _500_increase_job_queue_count ON app_jobs.jobs;  
CREATE TRIGGER _500_increase_job_queue_count AFTER INSERT ON app_jobs.jobs FOR EACH ROW EXECUTE PROCEDURE app_jobs.jobs__increase_job_queue_count();

DROP TRIGGER IF EXISTS _500_decrease_job_queue_count ON app_jobs.jobs;  
CREATE TRIGGER _500_decrease_job_queue_count BEFORE DELETE ON app_jobs.jobs FOR EACH ROW EXECUTE PROCEDURE app_jobs.jobs__decrease_job_queue_count();

DROP TRIGGER IF EXISTS _900_notify_worker ON app_jobs.jobs;  
CREATE TRIGGER _900_notify_worker AFTER INSERT ON app_jobs.jobs FOR EACH STATEMENT EXECUTE PROCEDURE app_jobs.do_notify('jobs:insert');

CREATE OR REPLACE FUNCTION app_jobs.add_job(identifier varchar, payload json) RETURNS app_jobs.jobs AS $$
  INSERT INTO app_jobs.jobs(task_identifier, payload) VALUES(identifier, payload) RETURNING *;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION app_jobs.add_job(identifier varchar, queue_name varchar, payload json) RETURNS app_jobs.jobs AS $$
  INSERT INTO app_jobs.jobs(task_identifier, queue_name, payload) VALUES(identifier, queue_name, payload) RETURNING *;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION app_jobs.schedule_job(identifier varchar, queue_name varchar, payload json, run_at timestamptz) RETURNS app_jobs.jobs AS $$
  INSERT INTO app_jobs.jobs(task_identifier, queue_name, payload, run_at) VALUES(identifier, queue_name, payload, run_at) RETURNING *;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION app_jobs.complete_job(worker_id varchar, job_id int) RETURNS app_jobs.jobs AS $$
DECLARE
  v_row app_jobs.jobs;
BEGIN
  DELETE FROM app_jobs.jobs
    WHERE id = job_id
    RETURNING * INTO v_row;

  UPDATE app_jobs.job_queues
    SET locked_by = null, locked_at = null
    WHERE queue_name = v_row.queue_name AND locked_by = worker_id;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app_jobs.fail_job(worker_id varchar, job_id int, error_message varchar) RETURNS app_jobs.jobs AS $$
DECLARE
  v_row app_jobs.jobs;
BEGIN
  UPDATE app_jobs.jobs
    SET
      last_error = error_message,
      run_at = greatest(now(), run_at) + (exp(least(attempts, 10))::text || ' seconds')::interval
    WHERE id = job_id
    RETURNING * INTO v_row;

  UPDATE app_jobs.job_queues
    SET locked_by = null, locked_at = null
    WHERE queue_name = v_row.queue_name AND locked_by = worker_id;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app_jobs.get_job(worker_id varchar, identifiers varchar[]) RETURNS app_jobs.jobs AS $$
DECLARE
  v_job_id int;
  v_queue_name varchar;
  v_default_job_expiry text = (4 * 60 * 60)::text;
  v_default_job_maximum_attempts text = '25';
  v_row app_jobs.jobs;
BEGIN
  IF worker_id IS NULL OR length(worker_id) < 10 THEN
    RAISE EXCEPTION 'Invalid worker ID';
  END IF;

  SELECT job_queues.queue_name, jobs.id INTO v_queue_name, v_job_id
    FROM app_jobs.job_queues
    INNER JOIN app_jobs.jobs USING (queue_name)
    WHERE (locked_at IS NULL OR locked_at < (now() - (COALESCE(current_setting('jobs.expiry', true), v_default_job_expiry) || ' seconds')::interval))
    AND run_at <= now()
    AND attempts < COALESCE(current_setting('jobs.maximum_attempts', true), v_default_job_maximum_attempts)::int
    AND (identifiers IS NULL OR task_identifier = any(identifiers))
    ORDER BY priority ASC, run_at ASC, id ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

  IF v_queue_name IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE app_jobs.job_queues
    SET
      locked_by = worker_id,
      locked_at = now()
    WHERE job_queues.queue_name = v_queue_name;

  UPDATE app_jobs.jobs
    SET attempts = attempts + 1
    WHERE id = v_job_id
    RETURNING * INTO v_row;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql;
