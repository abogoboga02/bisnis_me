ALTER TABLE bisnis_me.users
ADD COLUMN IF NOT EXISTS ai_credits_tenths INTEGER;

ALTER TABLE bisnis_me.users
ALTER COLUMN ai_credits_tenths SET DEFAULT 30;

UPDATE bisnis_me.users
SET ai_credits_tenths = CASE
  WHEN role = 'owner' THEN NULL
  ELSE 30
END
WHERE ai_credits_tenths IS NULL;
