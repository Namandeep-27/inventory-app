-- Seed RECEIVING location (system location)
INSERT INTO locations (location_code, zone, aisle, rack, shelf, is_system_location)
VALUES ('RECEIVING', 'RECEIVING', 'N/A', 'N/A', 'N/A', TRUE)
ON CONFLICT (location_code) DO NOTHING;
