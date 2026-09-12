import { useEffect, useState } from 'react';
import { fetchAllZones } from '../api/zoneApi';

// Drop this into the existing search page (Feature 1) so customers can
// filter by zone. Calls onChange(zoneNameOrEmptyString) whenever the
// selection changes — wire that into whatever state drives the search
// query there.
export default function ZoneFilterSelect({ value, onChange }) {
  const [zones, setZones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllZones()
      .then(setZones)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return null; // fail quietly — zone filter is an enhancement, not core search

  return (
    <select
      className="zone-filter-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All zones</option>
      {zones.map((zoneName) => (
        <option key={zoneName} value={zoneName}>
          {zoneName}
        </option>
      ))}
    </select>
  );
}
