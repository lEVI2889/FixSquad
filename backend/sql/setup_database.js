const pool = require('../db');

async function setupDatabase() {
  console.log('Connecting to MySQL and ensuring database and tables exist...');

  try {
    // 1. users table (with role column support if needed)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'provider', 'admin') DEFAULT 'customer',
        rating DECIMAL(3, 2) DEFAULT 4.8,
        total_reviews INT DEFAULT 12,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(100) DEFAULT 'folder',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        base_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. provider_availability table (From Week2_Rohan_CONTRACT.md)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS provider_availability (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        is_blocked BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. bookings table (From Week2_Rohan_CONTRACT.md)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        provider_id INT NOT NULL,
        service_id INT NOT NULL,
        status ENUM('Pending', 'Accepted', 'Rejected', 'In-Progress', 'Completed', 'Cancelled', 'Disputed') DEFAULT 'Pending',
        scheduled_date DATE NOT NULL,
        scheduled_time TIME NOT NULL,
        total_price DECIMAL(10, 2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Tables verified successfully.');

    // Seed sample categories if empty
    const [catRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (catRows[0].count === 0) {
      console.log('Seeding categories...');
      await pool.query(`
        INSERT INTO categories (id, name, description, icon, is_active) VALUES
        (1, 'Electrical & Wiring', 'Licensed electrical installations, circuit diagnostics, and switch repairs.', '⚡', 1),
        (2, 'Plumbing & Pipe Repair', 'Emergency leak fixes, pipe installation, faucet and drain maintenance.', '◉', 1),
        (3, 'Home Cleaning', 'Deep cleaning, sanitization, floor scrubbing, and post-renovation cleanup.', '✦', 1),
        (4, 'Carpentry & Woodwork', 'Custom furniture repair, door alignment, cabinetry, and wooden fixtures.', '⌂', 1),
        (5, 'Appliance Repair', 'AC servicing, refrigerator maintenance, washing machine repairs, and microwave fixes.', '⚙', 1),
        (6, 'Painting & Wall Decor', 'Interior and exterior wall painting, touchups, and waterproofing.', '🎨', 1);
      `);
    }

    // Seed sample users (customer + provider) if empty
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('Seeding users...');
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);
      await pool.query(`
        INSERT INTO users (id, name, email, password, role, rating, total_reviews) VALUES
        (1, 'Arif Rahman', 'arif.provider@fixsquad.com', ?, 'provider', 4.9, 128),
        (2, 'Rahim Uddin', 'rahim.provider@fixsquad.com', ?, 'provider', 4.8, 95),
        (3, 'Wasik Customer', 'wasik@fixsquad.com', ?, 'customer', 5.0, 4),
        (4, 'Tanvir Hasan', 'tanvir.provider@fixsquad.com', ?, 'provider', 4.7, 62);
      `, [hash, hash, hash, hash]);
    }

    // Seed sample services if empty
    const [servRows] = await pool.query('SELECT COUNT(*) as count FROM services');
    if (servRows[0].count === 0) {
      console.log('Seeding services...');
      await pool.query(`
        INSERT INTO services (id, provider_id, category_id, name, description, base_price) VALUES
        (1, 1, 1, 'Switch & Socket Installation and Repair', 'Safe and certified replacement of wall sockets, MCB circuit breakers, and short-circuit repair.', 800.00),
        (2, 1, 1, 'Ceiling Fan & Light Fixture Setup', 'Installation of ceiling fans, chandeliers, recessed spotlights, and smart switches with proper grounding.', 650.00),
        (3, 2, 2, 'Emergency Pipe Leak & Tap Repair', 'Quick diagnosis and fixing of leaking pipes, sink traps, mixer taps, and pressure pump inspection.', 500.00),
        (4, 2, 2, 'Bathroom Sanitaryware & Commode Fitting', 'Complete bathroom fittings, commode replacement, shower head installation, and sealant application.', 1200.00),
        (5, 1, 3, 'Comprehensive Deep Home Cleaning', 'Full house deep scrubbing, kitchen degreasing, bathroom descaling, and high-temperature steam sanitation.', 2500.00),
        (6, 4, 4, 'Door Lock & Hinge Alignment Fix', 'Fixing jammed doors, installing smart digital locks, wooden window repairs, and sliding door adjustments.', 750.00),
        (7, 4, 5, 'Split AC Master Servicing & Gas Top-up', 'Indoor and outdoor coil pressure wash, filter chemical cleaning, drain clearing, and refrigerant check.', 1500.00),
        (8, 2, 6, 'Interior Room Wall Repainting', 'Wall sanding, primer coat, premium plastic emulsion paint application, and protective masking.', 3500.00);
      `);
    }

    // Seed sample blocked provider availability
    const [availRows] = await pool.query('SELECT COUNT(*) as count FROM provider_availability');
    if (availRows[0].count === 0) {
      console.log('Seeding sample provider availability blocks...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      await pool.query(`
        INSERT INTO provider_availability (provider_id, date, start_time, end_time, is_blocked) VALUES
        (1, ?, '10:00:00', '12:00:00', 1),
        (2, ?, '14:00:00', '16:00:00', 1);
      `, [dateStr, dateStr]);
    }

    console.log('Sprint 2 Database Initialization Complete!');
  } catch (err) {
    console.error('Database setup error:', err);
  } finally {
    process.exit(0);
  }
}

setupDatabase();
