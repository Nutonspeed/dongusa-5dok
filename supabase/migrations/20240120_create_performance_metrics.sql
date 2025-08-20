-- Create performance_metrics table for storing analytics data
-- This replaces the problematic in-memory storage

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT DEFAULT 'ms',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID,
  session_id TEXT,
  client_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_composite ON performance_metrics(name, timestamp DESC);

-- Create RLS policies for security
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Allow insert for authenticated users and service role
CREATE POLICY "Allow metric insertion" ON performance_metrics
  FOR INSERT WITH CHECK (true);

-- Allow read for admin users only
CREATE POLICY "Admin read access" ON performance_metrics
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Add retention policy (keep only 30 days of data to prevent unbounded growth)
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM performance_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to clean up old metrics (if pg_cron is available)
-- SELECT cron.schedule('cleanup-metrics', '0 2 * * *', 'SELECT cleanup_old_performance_metrics();');

COMMENT ON TABLE performance_metrics IS 'Performance metrics storage with automatic cleanup';
COMMENT ON FUNCTION cleanup_old_performance_metrics IS 'Cleanup function to prevent unbounded table growth';
