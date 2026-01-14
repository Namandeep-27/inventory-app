-- Phone-Based Inventory + Location Tracking MVP
-- Initial Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: products
CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    size VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_brand_name ON products(brand, name);

-- Table: boxes
CREATE TABLE boxes (
    box_id VARCHAR PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    lot_code VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR
);

CREATE INDEX idx_boxes_product_id ON boxes(product_id);
CREATE INDEX idx_boxes_created_at ON boxes(created_at);

-- Table: locations
CREATE TABLE locations (
    location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_code VARCHAR UNIQUE NOT NULL,
    zone VARCHAR,
    aisle VARCHAR,
    rack VARCHAR,
    shelf VARCHAR,
    is_system_location BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_locations_location_code ON locations(location_code);

-- Table: box_id_counters (for race-free sequence generation)
CREATE TABLE box_id_counters (
    date DATE PRIMARY KEY,
    last_seq INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Function to atomically increment box_id counter
CREATE OR REPLACE FUNCTION increment_box_id_counter(target_date DATE)
RETURNS INTEGER AS $$
DECLARE
    new_seq INTEGER;
BEGIN
    INSERT INTO box_id_counters (date, last_seq, updated_at)
    VALUES (target_date, 1, NOW())
    ON CONFLICT (date) DO UPDATE
    SET last_seq = box_id_counters.last_seq + 1,
        updated_at = NOW()
    RETURNING last_seq INTO new_seq;
    
    RETURN new_seq;
END;
$$ LANGUAGE plpgsql;

-- Table: events
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_event_id UUID UNIQUE NOT NULL,
    event_type VARCHAR NOT NULL CHECK (event_type IN ('IN', 'OUT', 'MOVE')),
    box_id VARCHAR NOT NULL REFERENCES boxes(box_id) ON DELETE RESTRICT,
    location_id UUID REFERENCES locations(location_id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id VARCHAR,
    mode VARCHAR NOT NULL CHECK (mode IN ('INBOUND', 'OUTBOUND', 'MOVE')),
    source_type VARCHAR DEFAULT 'PHONE' CHECK (source_type IN ('PHONE', 'INBOUND_STATION', 'OUTBOUND_STATION', 'API')),
    source_id VARCHAR,
    raw_qr_value TEXT,
    warning TEXT,
    exception_type VARCHAR CHECK (exception_type IN ('OUT_WITHOUT_IN', 'MOVE_WHEN_OUT', 'DUPLICATE_SCAN'))
);

CREATE INDEX idx_events_box_id ON events(box_id);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_client_event_id ON events(client_event_id);
CREATE INDEX idx_events_exception_type ON events(exception_type);

-- Table: inventory_state (current snapshot)
CREATE TABLE inventory_state (
    box_id VARCHAR PRIMARY KEY REFERENCES boxes(box_id) ON DELETE CASCADE,
    status VARCHAR NOT NULL CHECK (status IN ('IN_STOCK', 'OUT_OF_WAREHOUSE')),
    current_location_id UUID REFERENCES locations(location_id) ON DELETE SET NULL,
    last_event_time TIMESTAMP,
    last_event_type VARCHAR
);

CREATE INDEX idx_inventory_state_status ON inventory_state(status);
CREATE INDEX idx_inventory_state_location ON inventory_state(current_location_id);
