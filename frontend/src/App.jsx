import React from 'react';
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import WipPage from './pages/WipPage';
import HomePage from './pages/HomePage';

// Client pages/layout lazy-loaded for code splitting
const ClientLoginPage = React.lazy(() => import('./client/ClientLoginPage'));
const ClientShellLayout = React.lazy(() => import('./client/ClientShellLayout.jsx'));
const ClientDashboardPage = React.lazy(() => import('./client/ClientDashboardPage.jsx'));
const ClientCatalogPage = React.lazy(() => import('./client/ClientCatalogPage.jsx'));
const ClientCartPage = React.lazy(() => import('./client/ClientCartPage.jsx'));
const ClientFavoritesPage = React.lazy(() => import('./client/ClientFavoritesPage'));
const ClientMyRentalsPage = React.lazy(() => import('./client/ClientMyRentalsPage.jsx'));
const ClientCheckoutPage = React.lazy(() => import('./client/ClientCheckoutPage.jsx'));
const ClientBookingHistoryPage = React.lazy(() => import('./client/ClientBookingHistoryPage.jsx'));
const ClientReturnsPage = React.lazy(() => import('./client/ClientReturnsPage.jsx'));
const ClientPendingPage = React.lazy(() => import('./client/ClientPendingPage.jsx'));
const ClientProfilePage = React.lazy(() => import('./client/ClientProfilePage.jsx'));
const ClientContactPage = React.lazy(() => import('./client/ClientContactPage.jsx'));
const ClientItemDetailPage = React.lazy(() => import('./client/ClientItemDetailPage.jsx'));

// Admin imports
import { AdminAuthProvider } from './admin/context/AdminAuthContext';

// Lazy-load admin pages/layout so their CSS only loads on admin routes
const AdminLoginPage = React.lazy(() => import('./admin/pages/AdminLoginPage'));
const AdminProtectedRoute = React.lazy(() => import('./admin/components/AdminProtectedRoute'));
const AdminLayout = React.lazy(() => import('./admin/components/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('./admin/pages/AdminDashboardPage'));
const AdminCalendarPage = React.lazy(() => import('./admin/pages/AdminCalendarPage'));
const NewItemPage = React.lazy(() => import('./admin/pages/NewItemPage'));
const ItemsPage = React.lazy(() => import('./admin/pages/ItemsPage'));
const OrdersPage = React.lazy(() => import('./admin/pages/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./admin/pages/OrderDetailPage'));
const DispatchPage = React.lazy(() => import('./admin/pages/DispatchPage'));
const CustomersPage = React.lazy(() => import('./admin/pages/CustomersPage'));
const RepairsPage = React.lazy(() => import('./admin/pages/RepairsPage'));
const LateFeesPage = React.lazy(() => import('./admin/pages/LateFeesPage'));
const HistoryPage = React.lazy(() => import('./admin/pages/HistoryPage'));
const SettingsPage = React.lazy(() => import('./admin/pages/SettingsPage'));

// ===== Theming (client + admin) =====
const THEME_KEY = 'rentit-theme';

function applyTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', value);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
}

function ScrollToTopOnRouteChange() {
  const location = useLocation();
  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}



function App() {
  React.useEffect(() => {
    initTheme();
  }, []);

  return (
    <>
      <ScrollToTopOnRouteChange />

      <Routes>

        <Route path="/" element={<HomePage />} />

        <Route path="/about" element={<AboutPage />} />

        <Route path="/contact" element={<ContactPage />} />

        <Route path="/terms" element={<TermsPage />} />

        <Route path="/wip" element={<WipPage />} />

        <Route path="/login" element={<ClientLoginPage />} />





        <Route

          path="/client/dashboard"

          element={(

            <ClientShellLayout>

              <ClientDashboardPage />

            </ClientShellLayout>

          )}

        />

        <Route

          path="/client/catalog"

          element={(

            <ClientShellLayout>

              <ClientCatalogPage />

            </ClientShellLayout>

          )}

        />



        <Route

          path="/client/cart"

          element={(

            <ClientShellLayout>

              <ClientCartPage />

            </ClientShellLayout>

          )}

        />



        <Route

          path="/client/checkout"

          element={(

            <ClientShellLayout>

              <ClientCheckoutPage />

            </ClientShellLayout>

          )}

        />



        <Route
          path="/client/myrentals"
          element={(
            <ClientShellLayout>
              <ClientMyRentalsPage />
            </ClientShellLayout>
          )}
        />

        <Route
          path="/client/bookinghistory"
          element={(
            <ClientBookingHistoryPage />
          )}
        />
        <Route
          path="/client/returns"
          element={(
            <ClientReturnsPage />
          )}
        />
        <Route
          path="/client/pending"
          element={(
            <ClientShellLayout>
              <ClientPendingPage />
            </ClientShellLayout>
          )}
        />

        <Route
          path="/client/favorites"
          element={(
            <ClientShellLayout>
              <ClientFavoritesPage />
            </ClientShellLayout>
          )}
        />

        <Route
          path="/client/item/:id"
          element={(
            <ClientShellLayout>
              <ClientItemDetailPage />
            </ClientShellLayout>
          )}
        />

        <Route
          path="/client/profile"
          element={(
            <ClientShellLayout>
              <ClientProfilePage />
            </ClientShellLayout>
          )}
        />

        <Route
          path="/client/contact"
          element={(
            <ClientShellLayout>
              <ClientContactPage />
            </ClientShellLayout>
          )}
        />

        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ===== Admin Routes ===== */}
        <Route path="/admin/login" element={
          <AdminAuthProvider>
            <AdminLoginPage />
          </AdminAuthProvider>
        } />

        <Route path="/admin/*" element={
          <AdminAuthProvider>
            <Routes>
                <Route element={<AdminProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="calendar" element={<AdminCalendarPage />} />
                    <Route path="newitem" element={<NewItemPage />} />
                    <Route path="items" element={<ItemsPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/:orderId" element={<OrderDetailPage />} />
                    <Route path="dispatch" element={<DispatchPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="repairs" element={<RepairsPage />} />
                    <Route path="latefees" element={<LateFeesPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    {/* Future admin pages go here */}
                  </Route>
                </Route>
            </Routes>
          </AdminAuthProvider>
        } />

        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;
