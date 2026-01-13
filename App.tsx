
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Home from './components/Home';
import Palmistry from './components/Palmistry';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Footer from './components/Footer';
import Remedy from './components/Remedy';
import FaceReading from './components/FaceReading';
import AdminDashboard from './components/AdminDashboard';
import AdminConfig from './components/AdminConfig';
import AdminDB from './components/AdminDB';
import MasterLogin from './components/MasterLogin';
import RevenueDashboard from './components/RevenueDashboard';
import NumerologyAstrology from './components/NumerologyAstrology';
import Tarot from './components/Tarot';
import { checkSystemIntegrity } from './services/security';
import { useAuth } from './context/AuthContext';

import { PushNotifications } from './components/PushNotifications';
import DailyReminder from './components/DailyReminder';
import BadgeCounter from './components/BadgeCounter';
import { AnalyticsProvider } from './components/Analytics';
import { ABTestStatus } from './components/ABTesting';
import { AccessibilityProvider } from './context/AccessibilityContext';
import LargeTextMode from './components/LargeTextMode';
import ReferralProgram from './components/ReferralProgram';
import Leaderboard from './components/Leaderboard';
import LanguageSwitcher from './components/LanguageSwitcher';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Simple Admin Route Check
const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = localStorage.getItem('glyph_admin_session');
  if (!session) return <Navigate to="/master-login" replace />;
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isSecure, setIsSecure] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsSecure(checkSystemIntegrity());
  }, []);

  if (!isSecure) {
    return <div className="text-red-500 p-10 text-center">Security Alert: Environment Unsafe</div>;
  }

  const isAuthPage = ['/login', '/register', '/master-login'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const showLayout = isAuthenticated && !isAuthPage && !isAdminPage;

  return (
    <AccessibilityProvider>
      <AnalyticsProvider>
        <PushNotifications>
          <div className="bg-midnight min-h-screen text-amber-50 flex flex-col font-lora overflow-x-hidden selection:bg-neon-magenta selection:text-white transition-all duration-300">
            {showLayout && <Header onLogout={logout} />}
            
            <div className="fixed top-20 right-4 z-50 md:top-4 md:right-32">
                <LanguageSwitcher />
            </div>

            {isAuthenticated && (
               <>
                 <DailyReminder />
                 <BadgeCounter />
                 <LargeTextMode />
                 {user?.email === 'rocky@glyph.co' && <ABTestStatus />}
                 
                 {!isAdminPage && (
                    <Link to="/referrals" className="fixed bottom-6 left-6 z-40 animate-pulse-glow group">
                       <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center border-2 border-white/20 transform group-hover:scale-110 transition-transform">
                          <span className="text-2xl">🎁</span>
                       </div>
                    </Link>
                 )}
               </>
            )}

            <main className={`flex-grow ${showLayout ? 'container mx-auto px-4 py-8' : ''}`} role="main">
              <Routes>
                {/* PUBLIC */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />} />
                
                {/* ADMIN - DIRECT ROUTES */}
                <Route path="/master-login" element={<MasterLogin />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/config" element={<AdminRoute><AdminConfig /></AdminRoute>} />
                <Route path="/admin/revenue" element={<AdminRoute><RevenueDashboard /></AdminRoute>} />
                <Route path="/admin/db/:table" element={<AdminRoute><AdminDB /></AdminRoute>} />

                {/* USER - PROTECTED */}
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/palmistry" element={<ProtectedRoute><Palmistry /></ProtectedRoute>} />
                <Route path="/numerology" element={<ProtectedRoute><NumerologyAstrology mode="numerology" /></ProtectedRoute>} />
                <Route path="/astrology" element={<ProtectedRoute><NumerologyAstrology mode="astrology" /></ProtectedRoute>} />
                <Route path="/tarot" element={<ProtectedRoute><Tarot /></ProtectedRoute>} />
                <Route path="/face-reading" element={<ProtectedRoute><FaceReading /></ProtectedRoute>} />
                <Route path="/remedy" element={<ProtectedRoute><Remedy /></ProtectedRoute>} />
                <Route path="/referrals" element={<ProtectedRoute><ReferralProgram /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                
                <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
              </Routes>
            </main>
            
            {showLayout && <Footer />}
          </div>
        </PushNotifications>
      </AnalyticsProvider>
    </AccessibilityProvider>
  );
}

export default App;
