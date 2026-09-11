const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

export async function fetchNotifications() {
  const res = await fetch('/api/notifications', { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load notifications');
  return data.data;
}

export async function markNotificationRead(id) {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: 'PUT',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update notification');
  return data;
}
