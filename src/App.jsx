import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DisruptionsPage } from './pages/DisruptionsPage';
import { OrdersAtRiskPage } from './pages/OrdersAtRiskPage';
import { SupplyChainMapPage } from './pages/SupplyChainMapPage';
import { RecoveryPlanningPage } from './pages/RecoveryPlanningPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { OutcomesPage } from './pages/OutcomesPage';
import { FieldReportingPage } from './pages/FieldReportingPage';
import { SettingsPage } from './pages/SettingsPage';
import { InventoryPage } from './pages/InventoryPage';
import { ExcelConverterPage } from './pages/ExcelConverterPage';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('disruption_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [currentCompany, setCurrentCompany] = useState(() => {
    try {
      const c = localStorage.getItem('disruption_company');
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Sync session on mount
  useEffect(() => {
    const token = localStorage.getItem('disruption_token');
    if (token) {
      api.getMe()
        .then((res) => {
          setCurrentUser(res.user);
          setCurrentCompany(res.company);
        })
        .catch(() => {
          // Fall back to login if expired
          api.logout();
          setCurrentUser(null);
          setCurrentCompany(null);
        });
    }
  }, []);

  // Poll notifications periodically
  useEffect(() => {
    if (!currentUser) return;
    const fetchNotifications = async () => {
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
      } catch (err) {
        // Silently tolerate background poll failure
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLoginSuccess = (user, company) => {
    setCurrentUser(user);
    setCurrentCompany(company);
  };

  const handleUserChange = (user, company) => {
    setCurrentUser(user);
    setCurrentCompany(company);
  };

  const handleMarkRead = async (notifId) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <BrowserRouter>
      {!currentUser ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
          <Navbar
            currentUser={currentUser}
            currentCompany={currentCompany}
            onUserChange={handleUserChange}
            onOpenNotifications={() => setNotifDrawerOpen(true)}
            unreadCount={unreadCount}
          />

          <div className="flex-1 flex overflow-hidden">
            <Sidebar userRole={currentUser?.role} />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/disruptions" element={<DisruptionsPage />} />
                <Route path="/orders" element={<OrdersAtRiskPage />} />
                <Route path="/impact-map" element={<SupplyChainMapPage />} />
                <Route path="/recovery" element={<RecoveryPlanningPage currentUser={currentUser} />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/converter" element={<ExcelConverterPage />} />
                <Route path="/approvals" element={<ApprovalsPage currentUser={currentUser} />} />
                <Route path="/outcomes" element={<OutcomesPage />} />
                <Route path="/field-reports" element={<FieldReportingPage currentUser={currentUser} />} />
                <Route path="/settings" element={<SettingsPage currentUser={currentUser} currentCompany={currentCompany} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>

          <NotificationDrawer
            isOpen={notifDrawerOpen}
            onClose={() => setNotifDrawerOpen(false)}
            notifications={notifications}
            onMarkRead={handleMarkRead}
          />
        </div>
      )}
    </BrowserRouter>
  );
}
