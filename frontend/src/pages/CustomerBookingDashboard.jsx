import { useEffect, useState } from 'react';
import api from '../services/api';
import MessagingModal from '../components/MessagingModal';
import RatingModal from '../components/RatingModal';
import DisputeModal from '../components/DisputeModal';
import { fetchCustomerBookings, cancelCustomerBooking } from '../services/bookingApi';

const COLUMNS = ['Pending', 'Accepted', 'In-Progress', 'Completed'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
}

function BookingCard({ booking, onMessage, onInvoice, onCancel, onRate, onDispute }) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancelClick = async () => {
    setCancelling(true);
    try {
      await onCancel(booking.id);
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-1">
        <div className="font-bold text-lg text-slate-900">{booking.service_name}</div>
        {(booking.status === 'Cancelled' || booking.status === 'Disputed') && (
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            booking.status === 'Cancelled' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'
          }`}>
            {booking.status}
          </span>
        )}
      </div>

      <div className="text-gray-600 text-sm mb-3">Provider: <span className="font-medium text-slate-900">{booking.provider_name}</span></div>
      
      <div className="flex items-center text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded">
        <svg className="w-4 h-4 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        {formatDate(booking.scheduled_date)} at {booking.scheduled_time}
      </div>
      
      {booking.total_price != null && (
        <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="font-bold text-indigo-700 text-lg">${Number(booking.total_price).toFixed(2)}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-gray-50">
        {booking.status === 'Pending' && (
          <button
            onClick={handleCancelClick}
            disabled={cancelling}
            className="w-full py-1.5 bg-red-50 text-red-600 rounded text-xs font-semibold hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Request'}
          </button>
        )}

        {(booking.status === 'Accepted' || booking.status === 'In-Progress') && (
          <button onClick={() => onMessage(booking.id)} className="w-full py-2 bg-indigo-50 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-100 transition-colors">
            Message Provider
          </button>
        )}

        {booking.status === 'Completed' && (
          <div className="grid grid-cols-1 gap-2">
            <div className="flex gap-2">
              <button onClick={() => onRate(booking)} className="flex-1 py-1.5 bg-amber-50 text-amber-700 rounded text-xs font-semibold hover:bg-amber-100 border border-amber-200 transition-colors flex items-center justify-center gap-1">
                <span>⭐ Rate Service</span>
              </button>
              <button onClick={() => onInvoice(booking.id)} className="flex-1 py-1.5 bg-green-50 text-green-700 rounded text-xs font-semibold hover:bg-green-100 border border-green-200 transition-colors">
                📄 Receipt
              </button>
            </div>
            <button onClick={() => onDispute(booking)} className="w-full py-1.5 bg-red-50 text-red-600 rounded text-xs font-semibold hover:bg-red-100 border border-red-200 transition-colors">
              ⚠️ File Dispute
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerBookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMessageBookingId, setActiveMessageBookingId] = useState(null);
  const [ratingTargetBooking, setRatingTargetBooking] = useState(null);
  const [disputeTargetBooking, setDisputeTargetBooking] = useState(null);

  const loadBookings = () => {
    setLoading(true);
    return fetchCustomerBookings()
      .then((data) => setBookings(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelCustomerBooking(bookingId);
    } catch (e) {
      console.warn('Backend warning:', e.message);
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const response = await api.get(`/invoices/${bookingId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Failed to download invoice:', err);
    }
  };

  if (loading) return <div className="container max-w-7xl mx-auto py-12 px-6 text-center text-gray-500">Loading your bookings...</div>;
  if (error) return <div className="container max-w-7xl mx-auto py-12 px-6 text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;

  const byStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = bookings.filter((b) => b.status === status);
    return acc;
  }, {});

  const otherStatuses = bookings.filter((b) => !COLUMNS.includes(b.status));

  return (
    <main className="container max-w-7xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-indigo-700">My Bookings</h1>
        <span className="px-4 py-1 bg-green-100 text-indigo-700 rounded-full text-sm font-semibold">{bookings.length} Total Bookings</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((status) => (
          <div key={status} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="font-bold text-slate-900">{status}</h2>
                <span className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-500 shadow-sm">{byStatus[status].length}</span>
            </div>
            
            <div className="min-h-[200px]">
                {byStatus[status].length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-lg">
                        Nothing here yet.
                    </div>
                )}
                {byStatus[status].map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onMessage={setActiveMessageBookingId}
                    onInvoice={handleDownloadInvoice}
                    onCancel={handleCancelBooking}
                    onRate={setRatingTargetBooking}
                    onDispute={setDisputeTargetBooking}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {otherStatuses.length > 0 && (
        <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 border-b pb-2">Other History</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherStatuses.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onMessage={setActiveMessageBookingId}
                onInvoice={handleDownloadInvoice}
                onCancel={handleCancelBooking}
                onRate={setRatingTargetBooking}
                onDispute={setDisputeTargetBooking}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {activeMessageBookingId && (
        <MessagingModal bookingId={activeMessageBookingId} onClose={() => setActiveMessageBookingId(null)} />
      )}

      {ratingTargetBooking && (
        <RatingModal
          booking={ratingTargetBooking}
          onClose={() => setRatingTargetBooking(null)}
          onReviewSubmitted={loadBookings}
        />
      )}

      {disputeTargetBooking && (
        <DisputeModal
          booking={disputeTargetBooking}
          onClose={() => setDisputeTargetBooking(null)}
          onDisputeSubmitted={() => {
            setBookings((prev) =>
              prev.map((b) => (b.id === disputeTargetBooking.id ? { ...b, status: 'Disputed' } : b))
            );
            loadBookings();
          }}
        />
      )}
    </main>
  );
}
