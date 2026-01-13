
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Palmistry from './components/Palmistry';
import Login from './components/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import Remedy from './components/Remedy';
import FaceReading from './components/FaceReading';
import AdminLanding from './components/AdminLanding';
import AdminConfig from './components/AdminConfig';
import NumerologyAstrology from './components/NumerologyAstrology';
import Tarot from './components/Tarot';
import { checkSystemIntegrity } from './services/security';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children?: React.ReactNode;
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin Route Wrapper
interface AdminRouteProps {
  children?: React.ReactNode;
  role: 'admin' | 'user' | null;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, role }) => {
  if (role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [isSecure, setIsSecure] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Perform Security Check on Mount
    const secure = checkSystemIntegrity();
    setIsSecure(secure);
  }, []);

  const handleLoginSuccess = useCallback((username: string) => {
    if (username === 'rocky' || username === 'Minti') {
      setUserRole('admin');
    } else {
      setUserRole('user');
    }
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setUserRole(null);
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

  // Show layout (header/footer) only when authenticated and not on login page
  const showLayout = isAuthenticated && location.pathname !== '/login';

  return (
    <div className="bg-midnight min-h-screen text-amber-50 flex flex-col font-lora overflow-x-hidden selection:bg-neon-magenta selection:text-white">
      {showLayout && <Header onLogout={handleLogout} />}
      
      <main className={`flex-grow ${showLayout ? 'container mx-auto px-4 py-8' : ''}`}>
        <Routes>
          {/* Login Route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />

          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Home /></ProtectedRoute>} />
          <Route path="/palmistry" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Palmistry /></ProtectedRoute>} />
          <Route path="/numerology" element={<ProtectedRoute isAuthenticated={isAuthenticated}><NumerologyAstrology mode="numerology" /></ProtectedRoute>} />
          <Route path="/astrology" element={<ProtectedRoute isAuthenticated={isAuthenticated}><NumerologyAstrology mode="astrology" /></ProtectedRoute>} />
          <Route path="/tarot" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Tarot /></ProtectedRoute>} />
          <Route path="/face-reading" element={<ProtectedRoute isAuthenticated={isAuthenticated}><FaceReading /></ProtectedRoute>} />
          <Route path="/remedy" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Remedy /></ProtectedRoute>} />
          
          <Route 
            path="/admin/config" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminRoute role={userRole}><AdminConfig /></AdminRoute>
              </ProtectedRoute>
            } 
          />
          
          {/* Root Redirect */}
          <Route 
            path="/" 
            element={
              isAuthenticated 
                ? (userRole === 'admin' ? <AdminLanding /> : <Navigate to="/home" replace />) 
                : <Navigate to="/login" replace />
            } 
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
        </Routes>
      </main>
      
      {showLayout && <Footer />}
    </div>
  );
}

export default App;
