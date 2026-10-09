-- Custo database schema
-- Product-based complaint intake system

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bot_name TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'in_app',
  text TEXT NOT NULL,
  translated_text TEXT,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  ready BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- AI classification fields
  classification_language TEXT,
  classification_entity TEXT,
  classification_sentiment TEXT,
  classification_amount_ngn NUMERIC,
  classification_channel_hint TEXT,
  classification_is_genuine BOOLEAN,
  
  -- Metadata
  confidence NUMERIC,
  url TEXT,
  username TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversation messages table
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  masked_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  count INTEGER NOT NULL,
  severity NUMERIC NOT NULL,
  baseline NUMERIC NOT NULL,
  ratio NUMERIC NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_confirmed_by_both BOOLEAN NOT NULL DEFAULT false,
  public_count INTEGER NOT NULL DEFAULT 0,
  in_app_count INTEGER NOT NULL DEFAULT 0,
  peak_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('watching', 'flagged', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_product_id ON public.complaints(product_id);
CREATE INDEX IF NOT EXISTS idx_complaints_timestamp ON public.complaints(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_ready ON public.complaints(ready);

CREATE INDEX IF NOT EXISTS idx_conversation_complaint_id ON public.conversation_messages(complaint_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON public.conversation_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_incidents_product_id ON public.incidents(product_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_start_time ON public.incidents(start_time DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER complaints_updated_at BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER incidents_updated_at BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Public read access (adjust based on your auth requirements)
CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to complaints"
  ON public.complaints FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to messages"
  ON public.conversation_messages FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to incidents"
  ON public.incidents FOR SELECT
  USING (true);

-- Server-side insert policies (service role only)
-- These will be enforced by using service role key on server
CREATE POLICY "Allow service role to insert products"
  ON public.products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update complaints"
  ON public.complaints FOR UPDATE
  USING (true);

CREATE POLICY "Allow service role to insert messages"
  ON public.conversation_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (true);
