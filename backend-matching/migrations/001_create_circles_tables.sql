-- Create tables for storing matched circles

-- Store matched circles with metadata
CREATE TABLE IF NOT EXISTS circles (
    id UUID PRIMARY KEY,
    size INTEGER NOT NULL,
    max_preference_order INTEGER NOT NULL,
    total_preference_score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active'
);

-- Store people in matched circles
CREATE TABLE IF NOT EXISTS circle_members (
    id SERIAL PRIMARY KEY,
    circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    person_id UUID NOT NULL,
    person_name VARCHAR(255) NOT NULL,
    current_practice_id INTEGER NOT NULL,
    desired_practice_id INTEGER NOT NULL,
    preference_order INTEGER NOT NULL,
    gets_spot_from VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_person_id ON circle_members(person_id);
CREATE INDEX IF NOT EXISTS idx_circles_created_at ON circles(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE circles IS 'Stores matched circles of people exchanging huisarts practices';
COMMENT ON TABLE circle_members IS 'Stores individual members within each circle with their practice preferences';
COMMENT ON COLUMN circles.status IS 'Status of the circle: active, completed, cancelled';
COMMENT ON COLUMN circle_members.preference_order IS 'Which preference choice was used (0=first choice, 1=second choice, etc)';
