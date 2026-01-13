
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
import RevenueDashboard from './components/RevenueDashboard';
import NumerologyAstrology from './components/NumerologyAstrology';
import Tarot from './components/Tarot';
import { checkSystemIntegrity } from './services/security';
import { useAuth } from './context/AuthContext';

// Notification System
import { PushNotifications } from './components/PushNotifications';
import DailyReminder from './components/DailyReminder';
import BadgeCounter from './components/BadgeCounter';

// Analytics & Experiments
import { AnalyticsProvider } from './components/Analytics';
import { ABTestStatus } from './components/ABTesting';

// Accessibility
import { AccessibilityProvider } from './context/AccessibilityContext';
import LargeTextMode from './components/LargeTextMode';

// Viral Growth
import ReferralProgram from './components/ReferralProgram';
import Leaderboard from './components/Leaderboard';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null; // Or a loading spinner
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Route Wrapper
interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth();
  // Simple check based on email for demo admin
  const isAdmin = user?.email === 'rocky@glyph.co' || user?.email === 'minti@glyph.co';
  
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
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
            <p className="text-sm mt-2 opacity-70">Rooted device or automation detected.</p>
        </div>
    );
  }

  // Show layout (header/footer) only when authenticated and not on auth pages
  // Also hide layout on Dashboard for immersive view
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboard = location.pathname === '/admin/revenue';
  const showLayout = isAuthenticated && !isAuthPage && !isDashboard;

  return (
    <AccessibilityProvider>
      <AnalyticsProvider>
        <PushNotifications>
          <div className="bg-midnight min-h-screen text-amber-50 flex flex-col font-lora overflow-x-hidden selection:bg-neon-magenta selection:text-white transition-all duration-300">
            {showLayout && <Header onLogout={logout} />}
            
            {/* Background Tasks & Overlays */}
            {isAuthenticated && (
               <>
                 <DailyReminder />
                 <BadgeCounter />
                 <LargeTextMode />
                 {user?.email === 'rocky@glyph.co' && <ABTestStatus />}
                 
                 {/* Viral Growth Floating Button */}
                 {!isDashboard && (
                    <Link to="/referrals" className="fixed bottom-6 left-6 z-40 animate-pulse-glow group">
                       <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center border-2 border-white/20 transform group-hover:scale-110 transition-transform">
                          <span className="text-2xl">🎁</span>
                       </div>
                       <div className="absolute left-16 top-3 bg-black/80 text-green-300 text-xs font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Get ₹10 Free
                       </div>
                    </Link>
                 )}
               </>
            )}

            <main className={`flex-grow ${showLayout ? 'container mx-auto px-4 py-8' : ''}`} role="main">
              <Routes>
                {/* Public/Auth Routes */}
                <Route 
                  path="/login" 
                  element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} 
                />
                <Route 
                  path="/register" 
                  element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />} 
                />

                {/* Protected Routes */}
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/palmistry" element={<ProtectedRoute><Palmistry /></ProtectedRoute>} />
                <Route path="/numerology" element={<ProtectedRoute><NumerologyAstrology mode="numerology" /></ProtectedRoute>} />
                <Route path="/astrology" element={<ProtectedRoute><NumerologyAstrology mode="astrology" /></ProtectedRoute>} />
                <Route path="/tarot" element={<ProtectedRoute><Tarot /></ProtectedRoute>} />
                <Route path="/face-reading" element={<ProtectedRoute><FaceReading /></ProtectedRoute>} />
                <Route path="/remedy" element={<ProtectedRoute><Remedy /></ProtectedRoute>} />
                
                {/* Viral Routes */}
                <Route path="/referrals" element={<ProtectedRoute><ReferralProgram /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

                <Route 
                  path="/admin/config" 
                  element={
                    <ProtectedRoute>
                      <AdminRoute><AdminConfig /></AdminRoute>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/revenue" 
                  element={
                    <ProtectedRoute>
                      <AdminRoute><RevenueDashboard /></AdminRoute>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Root Redirect */}
                <Route 
                  path="/" 
                  element={
                    isAuthenticated 
                      ? <Navigate to="/home" replace />
                      : <Navigate to="/login" replace />
                  } 
                />

                {/* Catch All */}
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
