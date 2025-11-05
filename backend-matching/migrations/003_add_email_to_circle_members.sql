-- Add email column to circle_members table (idempotent - safe to run multiple times)
ALTER TABLE circle_members ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL DEFAULT '';

-- Remove default after adding column (for future inserts to require email)
-- Only drop default if column was just added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'circle_members'
    AND column_name = 'email'
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE circle_members ALTER COLUMN email DROP DEFAULT;
  END IF;
END $$;
