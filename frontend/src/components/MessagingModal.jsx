import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

export default function MessagingModal({ bookingId, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${bookingId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 3 seconds for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const outgoing = inputText.trim();
    setInputText('');
    try {
      const res = await api.post(`/messages/${bookingId}`, { message_text: outgoing });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        {/* Chat Header */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>💬</span>
            <div>
              <h3>Booking #{bookingId} Discussion</h3>
              <p style={{ margin: 0, fontSize: '0.74rem', opacity: 0.85 }}>Direct, secure booking communication</p>
            </div>
          </div>
          <button 
            type="button" 
            className="chat-close-btn" 
            onClick={onClose} 
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="chat-body">
          {loading && messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="spinner" style={{ width: '30px', height: '30px' }} />
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', margin: '8px 0 0' }}>Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto 0', padding: '30px 20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👋</div>
              <p style={{ fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', fontSize: '0.95rem' }}>No messages yet</p>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.82rem', margin: 0 }}>
                Say hello or confirm details regarding arrival time and tools.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className={`chat-bubble ${isMine ? 'chat-bubble--mine' : 'chat-bubble--theirs'}`}>
                    {msg.message_text}
                  </div>
                  <div className={`chat-meta ${isMine ? 'chat-meta--mine' : ''}`}>
                    {msg.sender_name} ({msg.sender_role})
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSend} className="chat-form">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
