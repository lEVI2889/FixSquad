-- Sprint 4 addition (Feature 20: Service Zone Mapping). New table,
-- doesn't touch services/categories/bookings/etc.

CREATE TABLE IF NOT EXISTS provider_service_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    zone_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_zone (provider_id, zone_name)
);
