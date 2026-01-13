
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import NumerologyAstrology from './components/NumerologyAstrology';
import Tarot from './components/Tarot';
import { checkSystemIntegrity } from './services/security';
import { useAuth } from './context/AuthContext';

// Notification System
import { PushNotifications } from './components/PushNotifications';
import DailyReminder from './components/DailyReminder';
import BadgeCounter from './components/BadgeCounter';

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
  // In real app, check user.role from DB
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
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const showLayout = isAuthenticated && !isAuthPage;

  return (
    <PushNotifications>
      <div className="bg-midnight min-h-screen text-amber-50 flex flex-col font-lora overflow-x-hidden selection:bg-neon-magenta selection:text-white">
        {showLayout && <Header onLogout={logout} />}
        
        {/* Background Tasks & Overlays */}
        {isAuthenticated && (
           <>
             <DailyReminder />
             <BadgeCounter />
           </>
        )}

        <main className={`flex-grow ${showLayout ? 'container mx-auto px-4 py-8' : ''}`}>
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
            
            <Route 
              path="/admin/config" 
              element={
                <ProtectedRoute>
                  <AdminRoute><AdminConfig /></AdminRoute>
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
  );
}

export default App;
