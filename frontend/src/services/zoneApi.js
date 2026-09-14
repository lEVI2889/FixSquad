const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
  return data;
}

export async function fetchMyZones() {
  const res = await fetch('/api/zones/mine', { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data;
}

export async function addZone(zoneName) {
  const res = await fetch('/api/zones', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ zone_name: zoneName })
  });
  return handleResponse(res);
}

export async function deleteZone(id) {
  const res = await fetch(`/api/zones/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return handleResponse(res);
}

export async function fetchAllZones() {
  const res = await fetch('/api/zones', { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.data;
}
