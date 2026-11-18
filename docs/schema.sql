-- HelpDesk Pro — PostgreSQL Schema
-- Run: psql -U postgres -d helpdesk_db -f docs/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role      AS ENUM ('admin', 'technician', 'user');
CREATE TYPE ticket_status  AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'user',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status      ticket_status NOT NULL DEFAULT 'open',
  priority    ticket_priority NOT NULL DEFAULT 'medium',
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  closed_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Status audit log
CREATE TABLE IF NOT EXISTS status_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  changed_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_status  ticket_status,
  new_status  ticket_status NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_created_by  ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status      ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_comments_ticket     ON comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_ticket  ON status_logs(ticket_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed categories
INSERT INTO categories (name, description) VALUES
  ('Network',  'Network connectivity, VPN, WiFi issues'),
  ('Software', 'Application errors, installs, licenses'),
  ('Hardware', 'Physical device issues, peripherals, printers'),
  ('General',  'Other IT requests')
ON CONFLICT (name) DO NOTHING;

-- Seed users
-- Passwords below hash to "Admin@123" / "Tech@123" / "User@123"
-- Re-generate with: node -e "const b=require('bcryptjs'); console.log(b.hashSync('Admin@123',10))"
INSERT INTO users (name, email, password_hash, role) VALUES
  ('System Admin',     'admin@helpdesk.com', '$2a$10$rQnlT3Ke3bFMSd3Xb7lMB.6D7kJy9v1P8kXZdCy3Uh1q3EXAMPLE1', 'admin'),
  ('Jane Technician',  'tech@helpdesk.com',  '$2a$10$rQnlT3Ke3bFMSd3Xb7lMB.6D7kJy9v1P8kXZdCy3Uh1q3EXAMPLE2', 'technician'),
  ('John User',        'user@helpdesk.com',  '$2a$10$rQnlT3Ke3bFMSd3Xb7lMB.6D7kJy9v1P8kXZdCy3Uh1q3EXAMPLE3', 'user')
ON CONFLICT (email) DO NOTHING;
-- NOTE: The hashes above are placeholders. Use the register endpoint or
-- regenerate hashes using bcryptjs before using these seed accounts.
