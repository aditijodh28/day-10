CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    cleanliness_score INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO facilities
(name, location, type, cleanliness_score, status)
VALUES
('Central Public Toilet', 'Nagpur Central', 'Public Toilet', 86, 'Active'),
('Railway Facility', 'Nagpur Railway Station', 'Transport', 72, 'Active'),
('City Hospital', 'Civil Lines', 'Hospital', 91, 'Active'),
('Community Center', 'Dharampeth', 'Community', 78, 'Active'),
('Bus Terminal', 'Ganeshpeth', 'Transport', 64, 'Maintenance');