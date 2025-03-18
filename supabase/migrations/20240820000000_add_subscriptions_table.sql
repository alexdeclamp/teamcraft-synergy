
-- Create subscriptions table to track user subscription plans
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  trial_ends_at TIMESTAMPTZ,
  current_period_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for the subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on subscriptions table
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
