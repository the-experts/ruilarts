-- Add score column to circles table
-- Score is a composite metric calculated as:
-- (max_preference_order × 10) + (total_preference_score × 1) + (|size - ideal_size| × 20)
-- Lower score = better match

ALTER TABLE circles ADD COLUMN IF NOT EXISTS score DECIMAL(10, 2);

COMMENT ON COLUMN circles.score IS 'Composite score for circle quality. Lower score indicates better match. Calculated from preference order, total preferences, and size deviation.';
