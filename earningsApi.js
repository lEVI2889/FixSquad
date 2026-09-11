const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

export async function fetchEarningsSummary() {
  const res = await fetch('/api/earnings/summary', { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load earnings');
  return data.data;
}
