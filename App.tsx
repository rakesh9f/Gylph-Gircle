
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Home from './components/Home';
import Palmistry from './components/Palmistry';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Footer from './components/Footer';
import Remedy from './components/Remedy';
import FaceReading from './components/FaceReading';
import DreamAnalysis from './components/DreamAnalysis';
import AdminDashboard from './components/AdminDashboard';
import AdminConfig from './components/AdminConfig';
import AdminDB from './components/AdminDB';
import MasterLogin from './components/MasterLogin';
import RevenueDashboard from './components/RevenueDashboard';
import NumerologyAstrology from './components/NumerologyAstrology';
import Tarot from './components/Tarot';
import Store from './components/Store';
import AdminGuard from './components/AdminGuard';
import { useAuth } from './context/AuthContext';
import { dbService } from './services/db';

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
import GamificationHUD from './components/GamificationHUD';

// Protected Route Wrapper for Standard Users
interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // 💥 NUCLEAR RESET ON MOUNT (Optional: disable for persistent dev state)
    // dbService.nuclearReset();
  }, []);

  const isAuthPage = ['/login', '/register', '/master-login'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname === '/master-login';
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
                 {!isAdminPage && <GamificationHUD />}
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
                {/* 
                   LANDING PAGE LOGIC:
                   - If authenticated, go to Home.
                   - If not, show Login (Glpyh Circle entry) directly.
                */}
                <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />

                {/* PUBLIC AUTH ROUTES */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />} />
                
                {/* ADMIN ROUTES - Protected by AdminGuard */}
                <Route path="/master-login" element={<MasterLogin />} />
                <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                <Route path="/admin/config" element={<AdminGuard><AdminConfig /></AdminGuard>} />
                <Route path="/admin/revenue" element={<AdminGuard><RevenueDashboard /></AdminGuard>} />
                <Route path="/admin/db/:table" element={<AdminGuard><AdminDB /></AdminGuard>} />

                {/* USER PROTECTED ROUTES */}
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/palmistry" element={<ProtectedRoute><Palmistry /></ProtectedRoute>} />
                <Route path="/numerology" element={<ProtectedRoute><NumerologyAstrology mode="numerology" /></ProtectedRoute>} />
                <Route path="/astrology" element={<ProtectedRoute><NumerologyAstrology mode="astrology" /></ProtectedRoute>} />
                <Route path="/tarot" element={<ProtectedRoute><Tarot /></ProtectedRoute>} />
                <Route path="/face-reading" element={<ProtectedRoute><FaceReading /></ProtectedRoute>} />
                <Route path="/dream-analysis" element={<ProtectedRoute><DreamAnalysis /></ProtectedRoute>} />
                <Route path="/remedy" element={<ProtectedRoute><Remedy /></ProtectedRoute>} />
                <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
                <Route path="/referrals" element={<ProtectedRoute><ReferralProgram /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                
                {/* CATCH ALL - Fallback to Login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
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
