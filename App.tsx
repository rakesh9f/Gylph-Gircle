
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
import AdminLanding from './components/AdminLanding';
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

// GLOBAL: Language Switcher
import LanguageSwitcher from './components/LanguageSwitcher';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const masterSession = localStorage.getItem('glyph_admin_session');
  const isMaster = !!masterSession;
  const isNormalAdmin = user?.email === 'rocky@glyph.co' || user?.email === 'minti@glyph.co';
  
  if (!isMaster && !isNormalAdmin) {
    return <Navigate to="/master-login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isSecure, setIsSecure] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const secure = checkSystemIntegrity();
    setIsSecure(secure);
  }, []);

  if (!isSecure) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500 p-8 text-center font-mono">
            <h1 className="text-3xl font-bold mb-4">SECURITY ALERT</h1>
            <p>This device or browser environment is not secure.</p>
        </div>
    );
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/master-login';
  const isDashboard = location.pathname.startsWith('/admin');
  const showLayout = isAuthenticated && !isAuthPage && !isDashboard;

  return (
    <AccessibilityProvider>
      <AnalyticsProvider>
        <PushNotifications>
          <div className="bg-midnight min-h-screen text-amber-50 flex flex-col font-lora overflow-x-hidden selection:bg-neon-magenta selection:text-white transition-all duration-300">
            {showLayout && <Header onLogout={logout} />}
            
            {/* Global Language Switcher - Floating on Mobile, in Header usually but here for visibility */}
            <div className="fixed top-20 right-4 z-50 md:top-4 md:right-32">
                <LanguageSwitcher />
            </div>

            {isAuthenticated && (
               <>
                 <DailyReminder />
                 <BadgeCounter />
                 <LargeTextMode />
                 {user?.email === 'rocky@glyph.co' && <ABTestStatus />}
                 
                 {!isDashboard && (
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
                <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />} />
                <Route path="/master-login" element={<MasterLogin />} />

                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/palmistry" element={<ProtectedRoute><Palmistry /></ProtectedRoute>} />
                <Route path="/numerology" element={<ProtectedRoute><NumerologyAstrology mode="numerology" /></ProtectedRoute>} />
                <Route path="/astrology" element={<ProtectedRoute><NumerologyAstrology mode="astrology" /></ProtectedRoute>} />
                <Route path="/tarot" element={<ProtectedRoute><Tarot /></ProtectedRoute>} />
                <Route path="/face-reading" element={<ProtectedRoute><FaceReading /></ProtectedRoute>} />
                <Route path="/remedy" element={<ProtectedRoute><Remedy /></ProtectedRoute>} />
                
                <Route path="/referrals" element={<ProtectedRoute><ReferralProgram /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

                <Route path="/admin/config" element={<AdminRoute><AdminConfig /></AdminRoute>} />
                <Route path="/admin/revenue" element={<AdminRoute><RevenueDashboard /></AdminRoute>} />
                <Route path="/admin/db/:table" element={<AdminRoute><AdminDB /></AdminRoute>} />
                
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
