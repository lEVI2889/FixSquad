-- Quote Negotiation
ALTER TABLE bookings ADD COLUMN quoted_price DECIMAL(10, 2) DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN quote_status ENUM('None', 'Proposed', 'Accepted', 'Rejected') DEFAULT 'None';

-- Notification Feed
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
