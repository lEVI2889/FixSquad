import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProviderPortfolio from './pages/ProviderPortfolio';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import GlobalCategoryManager from './pages/GlobalCategoryManager';
import ProviderOperations from './pages/ProviderOperations';
import CustomerBookingDashboard from "./pages/CustomerBookingDashboard";
import ProviderJobWorkflow from "./pages/ProviderJobWorkflow";
// Sprint 4: Customer Text Reviews — Rohan (Week4_Rohan_CONTRACT.md)
import ProviderPublicProfile from './pages/ProviderPublicProfile';


function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="services" element={<ServicesPage />} />
        {/* Sprint 4: Public Provider Profile — Rohan (Week4_Rohan_CONTRACT.md) */}
        <Route path="provider/:providerId/profile" element={<ProviderPublicProfile />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="provider/portfolio" element={<ProviderPortfolio />} />
          <Route path="provider/operations" element={<ProviderOperations />} />
          <Route path="customer/bookings" element={<CustomerBookingDashboard />} />
          <Route path="provider/jobs" element={<ProviderJobWorkflow />} />

          <Route path="admin/categories" element={<GlobalCategoryManager />} />
        </Route>

        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
