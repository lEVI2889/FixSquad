// Raw MySQL connection pool (no ORM). All queries across the project
// should import this pool and use pool.query(...) with parameterized SQL.
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let livePool = null;
let isConnected = false;

try {
  livePool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'service_portfolio_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} catch (e) {
  console.warn('MySQL pool initialization deferred:', e.message);
}

// In-memory fallback dataset for seamless development when MySQL is offline
const memoryDb = {
  users: [
    { id: 1, name: 'Arif Rahman', email: 'arif.provider@fixsquad.com', password: '', role: 'provider', rating: 4.9, total_reviews: 128 },
    { id: 2, name: 'Rahim Uddin', email: 'rahim.provider@fixsquad.com', password: '', role: 'provider', rating: 4.8, total_reviews: 95 },
    { id: 3, name: 'Wasik Customer', email: 'wasik@fixsquad.com', password: '', role: 'customer', rating: 5.0, total_reviews: 4 },
    { id: 4, name: 'Tanvir Hasan', email: 'tanvir.provider@fixsquad.com', password: '', role: 'provider', rating: 4.7, total_reviews: 62 },
    { id: 5, name: 'Naim Admin', email: 'admin@fixsquad.com', password: '', role: 'admin', rating: 5.0, total_reviews: 0 }
  ],
  categories: [
    { id: 1, name: 'Electrical & Wiring', description: 'Licensed electrical installations, circuit diagnostics, and switch repairs.', icon: '⚡', is_active: 1 },
    { id: 2, name: 'Plumbing & Pipe Repair', 'description': 'Emergency leak fixes, pipe installation, faucet and drain maintenance.', icon: '◉', is_active: 1 },
    { id: 3, name: 'Home Cleaning', description: 'Deep cleaning, sanitization, floor scrubbing, and post-renovation cleanup.', icon: '✦', is_active: 1 },
    { id: 4, name: 'Carpentry & Woodwork', description: 'Custom furniture repair, door alignment, cabinetry, and wooden fixtures.', icon: '⌂', is_active: 1 },
    { id: 5, name: 'Appliance Repair', description: 'AC servicing, refrigerator maintenance, washing machine repairs, and microwave fixes.', icon: '⚙', is_active: 1 },
    { id: 6, name: 'Painting & Wall Decor', description: 'Interior and exterior wall painting, touchups, and waterproofing.', icon: '🎨', is_active: 1 }
  ],
  services: [
    { id: 1, provider_id: 1, category_id: 1, name: 'Switch & Socket Installation and Repair', description: 'Safe and certified replacement of wall sockets, MCB circuit breakers, and short-circuit repair.', base_price: 800.00, created_at: new Date().toISOString() },
    { id: 2, provider_id: 1, category_id: 1, name: 'Ceiling Fan & Light Fixture Setup', description: 'Installation of ceiling fans, chandeliers, recessed spotlights, and smart switches with proper grounding.', base_price: 650.00, created_at: new Date().toISOString() },
    { id: 3, provider_id: 2, category_id: 2, name: 'Emergency Pipe Leak & Tap Repair', description: 'Quick diagnosis and fixing of leaking pipes, sink traps, mixer taps, and pressure pump inspection.', base_price: 500.00, created_at: new Date().toISOString() },
    { id: 4, provider_id: 2, category_id: 2, name: 'Bathroom Sanitaryware & Commode Fitting', description: 'Complete bathroom fittings, commode replacement, shower head installation, and sealant application.', base_price: 1200.00, created_at: new Date().toISOString() },
    { id: 5, provider_id: 1, category_id: 3, name: 'Comprehensive Deep Home Cleaning', description: 'Full house deep scrubbing, kitchen degreasing, bathroom descaling, and high-temperature steam sanitation.', base_price: 2500.00, created_at: new Date().toISOString() },
    { id: 6, provider_id: 4, category_id: 4, name: 'Door Lock & Hinge Alignment Fix', description: 'Fixing jammed doors, installing smart digital locks, wooden window repairs, and sliding door adjustments.', base_price: 750.00, created_at: new Date().toISOString() },
    { id: 7, provider_id: 4, category_id: 5, name: 'Split AC Master Servicing & Gas Top-up', description: 'Indoor and outdoor coil pressure wash, filter chemical cleaning, drain clearing, and refrigerant check.', base_price: 1500.00, created_at: new Date().toISOString() },
    { id: 8, provider_id: 2, category_id: 6, name: 'Interior Room Wall Repainting', description: 'Wall sanding, primer coat, premium plastic emulsion paint application, and protective masking.', base_price: 3500.00, created_at: new Date().toISOString() }
  ],
  provider_availability: [
    { id: 1, provider_id: 1, date: new Date(Date.now() + 86400000).toISOString().split('T')[0], start_time: '10:00:00', end_time: '12:00:00', is_blocked: 1 },
    { id: 2, provider_id: 2, date: new Date(Date.now() + 86400000).toISOString().split('T')[0], start_time: '14:00:00', end_time: '16:00:00', is_blocked: 1 }
  ],
  bookings: [
    {
      id: 1,
      customer_id: 3,
      provider_id: 1,
      service_id: 1,
      status: 'Accepted',
      scheduled_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      scheduled_time: '11:00:00',
      total_price: 800.00,
      notes: 'Please check living room master socket',
      created_at: new Date().toISOString()
    }
  ]
};

// Hash default passwords in memory
(async () => {
  const hash = await bcrypt.hash('password123', 10);
  memoryDb.users.forEach(u => u.password = hash);
})();

// Test connection on boot
(async () => {
  if (!livePool) return;
  try {
    const conn = await livePool.getConnection();
    isConnected = true;
    console.log('MySQL Database Connected Successfully to ' + (process.env.DB_NAME || 'service_portfolio_db'));
    conn.release();
  } catch (err) {
    isConnected = false;
    console.log('MySQL Server is offline, using seamless local development memory store');
  }
})();

// Query helper supporting both live MySQL and in-memory execution
const pool = {
  async query(sql, params = []) {
    if (isConnected && livePool) {
      try {
        return await livePool.query(sql, params);
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
          isConnected = false;
        } else {
          throw err;
        }
      }
    }

    // --- In-Memory SQL Simulator for Instant Offline Development ---
    const cleanSql = sql.trim();
    const upperSql = cleanSql.toUpperCase();

    // 1. Users Queries
    if (upperSql.includes('FROM USERS')) {
      if (upperSql.startsWith('SELECT ID, NAME, EMAIL, PASSWORD FROM USERS WHERE EMAIL =') || upperSql.startsWith('SELECT ID FROM USERS WHERE EMAIL =') || upperSql.includes('WHERE EMAIL =')) {
        const email = params[0];
        const match = memoryDb.users.filter(u => u.email.toLowerCase() === (email || '').toLowerCase());
        return [match];
      }
      if (upperSql.includes('WHERE ID =')) {
        const id = Number(params[0]);
        const match = memoryDb.users.filter(u => u.id === id);
        return [match];
      }
      return [memoryDb.users];
    }

    if (upperSql.startsWith('INSERT INTO USERS')) {
      const newId = memoryDb.users.length ? Math.max(...memoryDb.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        name: params[0],
        email: params[1],
        password: params[2],
        role: params[3] || 'customer',
        rating: 5.0,
        total_reviews: 0
      };
      memoryDb.users.push(newUser);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    // 2. Categories Queries
    if (upperSql.includes('FROM CATEGORIES')) {
      let results = [...memoryDb.categories];
      if (params && params.length > 0) {
        if (upperSql.includes('NAME LIKE') || upperSql.includes('DESCRIPTION LIKE')) {
          const searchParam = (params[0] || '').replace(/%/g, '').toLowerCase();
          results = results.filter(c => c.name.toLowerCase().includes(searchParam) || (c.description || '').toLowerCase().includes(searchParam));
        }
        if (upperSql.includes('WHERE ID =')) {
          const id = Number(params[0]);
          results = results.filter(c => c.id === id);
        }
      }
      return [results];
    }

    // 3. Services / Dynamic Search Queries
    if (upperSql.includes('FROM SERVICES')) {
      let results = memoryDb.services.map(s => {
        const cat = memoryDb.categories.find(c => c.id === s.category_id) || {};
        const prov = memoryDb.users.find(u => u.id === s.provider_id) || {};
        return {
          ...s,
          category_name: cat.name || 'General',
          category_icon: cat.icon || '🛠',
          provider_name: prov.name || 'Provider',
          provider_rating: prov.rating || 4.8,
          total_reviews: prov.total_reviews || 10
        };
      });

      // Filter by provider_id if needed
      if (upperSql.includes('S.PROVIDER_ID = ?') || upperSql.includes('PROVIDER_ID = ?')) {
        const pId = Number(params[0]);
        results = results.filter(s => s.provider_id === pId);
      }

      // Filter by service id
      if (upperSql.includes('S.ID = ?') || upperSql.includes('WHERE ID = ?')) {
        const sId = Number(params[0]);
        results = results.filter(s => s.id === sId);
      }

      return [results];
    }

    if (upperSql.startsWith('INSERT INTO SERVICES')) {
      const newId = memoryDb.services.length ? Math.max(...memoryDb.services.map(s => s.id)) + 1 : 1;
      const newService = {
        id: newId,
        provider_id: Number(params[0]),
        category_id: Number(params[1]),
        name: params[2],
        description: params[3],
        base_price: Number(params[4]),
        created_at: new Date().toISOString()
      };
      memoryDb.services.push(newService);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    // 4. Provider Availability Queries
    if (upperSql.includes('FROM PROVIDER_AVAILABILITY')) {
      let results = [...memoryDb.provider_availability];
      if (upperSql.includes('PROVIDER_ID = ?') && upperSql.includes('DATE = ?')) {
        const pId = Number(params[0]);
        const dStr = String(params[1]);
        results = results.filter(a => a.provider_id === pId && (a.date === dStr || a.date.startsWith(dStr)));
      } else if (upperSql.includes('PROVIDER_ID = ?')) {
        const pId = Number(params[0]);
        results = results.filter(a => a.provider_id === pId);
      }
      return [results];
    }

    if (upperSql.startsWith('INSERT INTO PROVIDER_AVAILABILITY')) {
      const newId = memoryDb.provider_availability.length ? Math.max(...memoryDb.provider_availability.map(a => a.id)) + 1 : 1;
      const newAvail = {
        id: newId,
        provider_id: Number(params[0]),
        date: params[1],
        start_time: params[2],
        end_time: params[3],
        is_blocked: 1,
        created_at: new Date().toISOString()
      };
      memoryDb.provider_availability.push(newAvail);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upperSql.startsWith('DELETE FROM PROVIDER_AVAILABILITY')) {
      const id = Number(params[0]);
      memoryDb.provider_availability = memoryDb.provider_availability.filter(a => a.id !== id);
      return [{ affectedRows: 1 }];
    }

    // 5. Bookings Queries
    if (upperSql.includes('FROM BOOKINGS')) {
      let results = memoryDb.bookings.map(b => {
        const s = memoryDb.services.find(serv => serv.id === b.service_id) || {};
        const prov = memoryDb.users.find(u => u.id === b.provider_id) || {};
        const cust = memoryDb.users.find(u => u.id === b.customer_id) || {};
        const cat = memoryDb.categories.find(c => c.id === s.category_id) || {};
        return {
          ...b,
          service_name: s.name || 'General Service',
          category_name: cat.name || 'General',
          provider_name: prov.name || 'Provider',
          customer_name: cust.name || 'Customer'
        };
      });

      if (upperSql.includes('CUSTOMER_ID = ?')) {
        const cId = Number(params[0]);
        results = results.filter(b => b.customer_id === cId);
      } else if (upperSql.includes('PROVIDER_ID = ?') && upperSql.includes('SCHEDULED_DATE = ?') && upperSql.includes('SCHEDULED_TIME = ?')) {
        const pId = Number(params[0]);
        const dStr = String(params[1]);
        const tStr = String(params[2]);
        results = results.filter(b => b.provider_id === pId && (b.scheduled_date === dStr || b.scheduled_date.startsWith(dStr)) && (b.scheduled_time === tStr || b.scheduled_time.startsWith(tStr.substring(0, 5))));
      } else if (upperSql.includes('PROVIDER_ID = ?') && upperSql.includes('SCHEDULED_DATE = ?')) {
        const pId = Number(params[0]);
        const dStr = String(params[1]);
        results = results.filter(b => b.provider_id === pId && (b.scheduled_date === dStr || b.scheduled_date.startsWith(dStr)));
      } else if (upperSql.includes('PROVIDER_ID = ?')) {
        const pId = Number(params[0]);
        results = results.filter(b => b.provider_id === pId);
      }

      if (upperSql.includes("STATUS = 'PENDING'")) {
        results = results.filter(b => b.status === 'Pending');
      }

      return [results];
    }

    if (upperSql.startsWith('INSERT INTO BOOKINGS')) {
      const newId = memoryDb.bookings.length ? Math.max(...memoryDb.bookings.map(b => b.id)) + 1 : 1;
      const newBooking = {
        id: newId,
        customer_id: Number(params[0]),
        provider_id: Number(params[1]),
        service_id: Number(params[2]),
        status: 'Pending',
        scheduled_date: params[3],
        scheduled_time: params[4],
        total_price: Number(params[5]),
        notes: params[6] || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memoryDb.bookings.push(newBooking);
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upperSql.startsWith('UPDATE BOOKINGS')) {
      const newStatus = params[0];
      const bookingId = Number(params[1]);
      const target = memoryDb.bookings.find(b => b.id === bookingId);
      if (target) {
        target.status = newStatus;
        target.updated_at = new Date().toISOString();
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }

    // Generic fallback
    return [[]];
  },

  async execute(sql, params = []) {
    return this.query(sql, params);
  }
};

module.exports = pool;
