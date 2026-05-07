
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  client_name TEXT,
  client_phone TEXT,
  client_org TEXT,
  page_source TEXT,
  manager_id TEXT,
  notified BOOLEAN DEFAULT FALSE
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES chat_sessions(session_id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_sessions_last_active ON chat_sessions(last_active DESC);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);
