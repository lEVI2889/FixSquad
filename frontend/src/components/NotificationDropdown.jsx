import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { API_URL } from '../services/api';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // poll every 15s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 text-gray-500 hover:text-brand-forest transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-sm text-gray-500 p-4 text-center">No new notifications</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notifications.map(n => (
                                    <li key={n.id} className={`p-4 ${!n.is_read ? 'bg-brand-mint/10' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm ${!n.is_read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                {n.message}
                                            </p>
                                            {!n.is_read && (
                                                <button 
                                                    onClick={() => markAsRead(n.id)}
                                                    className="text-xs text-brand-forest hover:underline ml-2 flex-shrink-0"
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(n.created_at).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
