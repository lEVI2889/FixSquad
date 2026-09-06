import { useEffect, useState } from 'react';
import { fetchEarningsSummary } from '../api/earningsApi';

export default function ProviderEarningsReport() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchEarningsSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="dashboard-status">Loading earnings...</div>;
  if (error) return <div className="dashboard-status dashboard-status--error">{error}</div>;

  const maxEarnings = Math.max(1, ...summary.monthly.map((m) => Number(m.earnings)));

  return (
    <div className="provider-earnings-report">
      <h1>Earnings Report</h1>

      <div className="earnings-summary">
        <div className="earnings-summary__stat">
          <span className="earnings-summary__value">${Number(summary.total_earnings).toFixed(2)}</span>
          <span className="earnings-summary__label">Total Gross Earnings</span>
        </div>
        <div className="earnings-summary__stat">
          <span className="earnings-summary__value">{summary.completed_jobs}</span>
          <span className="earnings-summary__label">Completed Jobs</span>
        </div>
      </div>

      <h2>Last 12 Months</h2>
      {summary.monthly.length === 0 && <p>No completed jobs yet.</p>}
      <div className="earnings-chart">
        {summary.monthly.map((m) => (
          <div key={m.month} className="earnings-chart__row">
            <span className="earnings-chart__month">{m.month}</span>
            <div className="earnings-chart__bar-track">
              <div
                className="earnings-chart__bar"
                style={{ width: `${(Number(m.earnings) / maxEarnings) * 100}%` }}
              />
            </div>
            <span className="earnings-chart__amount">
              ${Number(m.earnings).toFixed(2)} ({m.jobs})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
