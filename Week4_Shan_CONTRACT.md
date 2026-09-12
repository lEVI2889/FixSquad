# Sprint 4: Provider Operations — Feature 20 (Service Zone Mapping)

**AUTHOR:** Shan
**BRANCH:** `feature/service-zone-mapping` (off `sprint-4-staging`)

> Not for Git — see `.gitignore`. Raw SQL via the `mysql2` pool throughout, no ORM.

Fully additive: one new table, no changes to `services`, `categories`, or any existing controller.

---

## 1. Database

```sql
CREATE TABLE provider_service_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    zone_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_zone (provider_id, zone_name)
);
```

Free-text zone names (e.g. "Gulshan", "Banani"), unique per provider. MySQL's default collation does case-insensitive comparison, so `"gulshan"` and `"Gulshan"` are treated as the same zone at the database level.

## 2. Endpoints

All under `/api/zones`, all require auth.

| Method | Path | Description |
|---|---|---|
| POST | `/api/zones` | Add a zone for the authenticated provider. Body: `{ "zone_name": "Gulshan" }`. `409` if already added. |
| GET | `/api/zones/mine` | List the authenticated provider's own zones. |
| DELETE | `/api/zones/:id` | Remove one of the authenticated provider's zones. `404` if it isn't theirs. |
| GET | `/api/zones` | Distinct list of every zone name any provider has tagged — powers the search filter dropdown. |

## 3. Frontend

- `frontend/src/pages/ProviderZoneManager.jsx` — provider-facing page: add a zone, see the list, remove one. No props.
- `frontend/src/components/ZoneFilterSelect.jsx` — a `<select>` populated from `GET /api/zones`, meant to be dropped into Wasik's search page. Props: `value`, `onChange(zoneName)`.
- `frontend/src/api/zoneApi.js` — shared fetch helper for both.

**Integration (for Naim):**
```jsx
import ProviderZoneManager from './pages/ProviderZoneManager';
<Route path="/provider/zones" element={<ProviderZoneManager />} />
```

## 4. `server.js` — one line
```javascript
const zoneRoutes = require('./routes/zoneRoutes');
app.use('/api/zones', protect, zoneRoutes);
```

---

## 5. Integration Notes for Wasik's Search Engine (Feature 1)

I don't have Wasik's actual search controller, so this is a description
of the change to make, not a file to drop in. Wherever his search query
lives, it needs:

1. **A new optional query param**, e.g. `?zone=Gulshan`.
2. **A conditional JOIN** against `provider_service_zones` only when that param is present:

```javascript
const { zone } = req.query;

let query = `
  SELECT DISTINCT s.*, u.name AS provider_name
  FROM services s
  JOIN users u ON u.id = s.provider_id
`;
const params = [];

if (zone) {
  query += ` JOIN provider_service_zones pz
             ON pz.provider_id = s.provider_id AND pz.zone_name = ? `;
  params.push(zone);
}

query += ' WHERE 1=1 '; // then AND-append his existing filters/params as before
```

3. Use `DISTINCT` on the outer select — a provider could theoretically match on a zone join more than once if they have overlapping data, and this keeps duplicate rows out of results.
4. On the frontend, drop `<ZoneFilterSelect />` into the search form and pass its value as the `zone` query param on whatever fetch call already runs the search.

This is written against the contract's own logic, not against code I've read — Wasik (or whoever merges this) should confirm his actual query's parameter order still lines up after the new param is added.

---

## 6. Still Open

- Not merged into or tested against Wasik's actual search endpoint — I don't have that file.
- No live database test — same limitation as previous sprints, no access to the real DB or repo from this environment.
