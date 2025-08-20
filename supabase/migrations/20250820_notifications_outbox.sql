-- Notifications Outbox and Attempt Logs
-- Created: 2025-08-20

-- Extensions (for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$ BEGIN
  CREATE TYPE notification_channel_enum AS ENUM ('email', 'sms');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_status_enum AS ENUM ('pending', 'sent', 'failed', 'skipped');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Outbox table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text,
  channel notification_channel_enum NOT NULL,
  to_address text NOT NULL,
  template text,
  payload jsonb,
  status notification_status_enum NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  provider text,
  response jsonb,
  dedupe_key text,
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure updated_at auto-update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notifications_updated_at ON notifications;
CREATE TRIGGER trg_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Unique/Indexes
CREATE UNIQUE INDEX IF NOT EXISTS notifications_dedupe_key_unique ON notifications(dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS notifications_status_created_at_idx ON notifications(status, created_at);
CREATE INDEX IF NOT EXISTS notifications_channel_status_idx ON notifications(channel, status);
CREATE INDEX IF NOT EXISTS notifications_to_address_idx ON notifications(to_address);

-- Attempt logs
CREATE TABLE IF NOT EXISTS notification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  attempt_no integer NOT NULL,
  success boolean NOT NULL,
  provider text,
  error text,
  response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_attempts_notification_idx ON notification_attempts(notification_id);
CREATE INDEX IF NOT EXISTS notification_attempts_created_at_idx ON notification_attempts(created_at);

-- Helper function to enqueue notification (optional convenience)
CREATE OR REPLACE FUNCTION enqueue_notification(
  p_event_type text,
  p_channel notification_channel_enum,
  p_to text,
  p_template text,
  p_payload jsonb,
  p_dedupe_key text DEFAULT NULL,
  p_scheduled_at timestamptz DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO notifications(
    event_type, channel, to_address, template, payload, status, dedupe_key, scheduled_at
  ) VALUES (
    p_event_type, p_channel, p_to, p_template, p_payload, 'pending', p_dedupe_key, p_scheduled_at
  ) RETURNING id INTO v_id;
  RETURN v_id;
END; $$ LANGUAGE plpgsql;

-- Notes:
-- - This outbox will be used to persist notifications for audit and retries.
-- - Application code can INSERT into notifications, process delivery, then INSERT into notification_attempts and UPDATE notifications.status/attempts.
-- - Consider adding RLS policies later (admin/service only) and a dead-letter handling strategy.
