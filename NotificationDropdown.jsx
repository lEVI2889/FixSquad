import { useEffect, useRef, useState } from 'react';
import { fetchNotifications, markNotificationRead } from '../api/notificationApi';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const load = () => {
    fetchNotifications()
      .then(setNotifications)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleOpenNotification = async (notification) => {
    if (notification.is_read) return;
    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="notification-dropdown" ref={containerRef}>
      <button type="button" className="notification-dropdown__bell" onClick={() => setOpen((o) => !o)}>
        🔔
        {unreadCount > 0 && <span className="notification-dropdown__badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown__panel">
          {error && <div className="notification-dropdown__error">{error}</div>}
          {notifications.length === 0 && (
            <div className="notification-dropdown__empty">No notifications</div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-dropdown__item${n.is_read ? '' : ' notification-dropdown__item--unread'}`}
              onClick={() => handleOpenNotification(n)}
            >
              <div className="notification-dropdown__message">{n.message}</div>
              <div className="notification-dropdown__time">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
