import { useEffect, useState } from 'react';
import { fetchMyZones, addZone, deleteZone } from '../api/zoneApi';

export default function ProviderZoneManager() {
  const [zones, setZones] = useState([]);
  const [zoneInput, setZoneInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadZones = () => {
    setLoading(true);
    return fetchMyZones()
      .then(setZones)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = zoneInput.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      await addZone(trimmed);
      setZoneInput('');
      await loadZones();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteZone(id);
      setZones((prev) => prev.filter((z) => z.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="dashboard-status">Loading your service zones...</div>;

  return (
    <div className="provider-zone-manager">
      <h1>Service Zones</h1>
      <p>Add the neighborhoods or city zones where you're available to work.</p>

      {error && <div className="dashboard-status dashboard-status--error">{error}</div>}

      <form onSubmit={handleAdd} className="zone-form">
        <input
          type="text"
          value={zoneInput}
          onChange={(e) => setZoneInput(e.target.value)}
          placeholder="e.g. Gulshan, Banani, Dhanmondi"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !zoneInput.trim()}>
          {submitting ? 'Adding...' : 'Add Zone'}
        </button>
      </form>

      {zones.length === 0 && <p className="zone-list__empty">No zones added yet.</p>}

      <ul className="zone-list">
        {zones.map((zone) => (
          <li key={zone.id} className="zone-list__item">
            <span>{zone.zone_name}</span>
            <button type="button" onClick={() => handleDelete(zone.id)} aria-label={`Remove ${zone.zone_name}`}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
