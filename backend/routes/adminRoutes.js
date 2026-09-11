const express = require('express');
const router = express.Router();
const {
  getUnverifiedProviders,
  updateProviderVerification,
  toggleUserSuspension,
  // Feature 13: Dispute Resolution Desk — Naim (Week3_Naim_CONTRACT.md)
  getDisputedBookings,
  resolveDispute
} = require('../controllers/adminController');

// NOTE: `protect` + `isAdmin` are applied at the server.js mount level.
// Every route in this file is therefore already admin-gated — no per-route
// middleware is needed here, which mirrors the pattern used in bookingRoutes.js.

// ── Feature 11: Provider Verification ──────────────────────────────────────
// GET  /api/admin/providers/unverified  — list providers awaiting verification
router.get('/providers/unverified', getUnverifiedProviders);

// PUT  /api/admin/providers/:id/verify  — approve or reject a provider
router.put('/providers/:id/verify', updateProviderVerification);

// ── Feature 14: System-Wide Access Control ─────────────────────────────────
// PUT  /api/admin/users/:id/suspend  — suspend or reactivate any user account
router.put('/users/:id/suspend', toggleUserSuspension);

// ── Feature 13: Dispute Resolution Desk ────────────────────────────────────
// GET  /api/admin/disputes           — list all bookings in 'Disputed' status
router.get('/disputes', getDisputedBookings);

// PUT  /api/admin/disputes/:id/resolve — forcefully override a disputed booking's status
router.put('/disputes/:id/resolve', resolveDispute);

module.exports = router;

