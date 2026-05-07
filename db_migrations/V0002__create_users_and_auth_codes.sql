
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  org TEXT,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  tg_username TEXT UNIQUE,
  tg_chat_id TEXT,
  vk_id TEXT UNIQUE,
  max_id TEXT UNIQUE,
  method TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE TABLE auth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact TEXT NOT NULL,
  method TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_codes_contact ON auth_codes(contact, used);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
