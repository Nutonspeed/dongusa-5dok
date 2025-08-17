-- Create unified tables to eliminate data redundancy

-- Unified conversations table
CREATE TABLE IF NOT EXISTS unified_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('facebook', 'messenger', 'live_chat', 'whatsapp', 'email')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_agent_id UUID REFERENCES profiles(id),
  subject TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(page_id, customer_id, channel)
);

-- Unified messages table
CREATE TABLE IF NOT EXISTS unified_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES unified_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'ai', 'system')),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('facebook', 'messenger', 'live_chat', 'whatsapp', 'email')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'quick_reply', 'template')),
  ai_analysis JSONB,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facebook pages configuration
CREATE TABLE IF NOT EXISTS facebook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT UNIQUE NOT NULL,
  page_name TEXT NOT NULL,
  access_token TEXT,
  webhook_verified BOOLEAN DEFAULT FALSE,
  auto_reply_enabled BOOLEAN DEFAULT TRUE,
  ai_assistance_level TEXT DEFAULT 'suggestions' CHECK (ai_assistance_level IN ('none', 'suggestions', 'auto_respond', 'full_automation')),
  business_hours JSONB DEFAULT '{"enabled": false, "timezone": "Asia/Bangkok", "schedule": {}}',
  response_templates JSONB DEFAULT '{"greeting": "", "away_message": "", "fallback_response": ""}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI performance tracking
CREATE TABLE IF NOT EXISTS ai_chat_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES unified_conversations(id),
  message_id UUID NOT NULL REFERENCES unified_messages(id),
  ai_confidence DECIMAL(5,2),
  response_accuracy DECIMAL(5,2),
  customer_satisfaction DECIMAL(5,2),
  escalation_needed BOOLEAN DEFAULT FALSE,
  human_takeover BOOLEAN DEFAULT FALSE,
  response_time_seconds INTEGER,
  business_value TEXT CHECK (business_value IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_unified_conversations_page_customer ON unified_conversations(page_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_unified_conversations_status ON unified_conversations(status);
CREATE INDEX IF NOT EXISTS idx_unified_conversations_channel ON unified_conversations(channel);
CREATE INDEX IF NOT EXISTS idx_unified_messages_conversation ON unified_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_unified_messages_created_at ON unified_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_performance_conversation ON ai_chat_performance(conversation_id);

-- RLS Policies
ALTER TABLE unified_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_performance ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admin full access to conversations" ON unified_conversations FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin full access to messages" ON unified_messages FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin full access to facebook pages" ON facebook_pages FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin full access to ai performance" ON ai_chat_performance FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
