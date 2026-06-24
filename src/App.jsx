import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import SubHeader from './components/SubHeader';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Citizen Pages
import CitizenPortal from './pages/CitizenPortal';
import MyReports from './pages/MyReports';
import RiverStatus from './pages/RiverStatus';
import Profile from './pages/Profile';

// Admin Pages
import Dashboard from './pages/Dashboard';
import AIAlerts from './pages/AIAlerts';
import Biodiversity from './pages/Biodiversity';
import DigitalTwin from './pages/DigitalTwin';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import './App.css';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { user } = useAuth();

  // Listen to browser history navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    // Scroll back to top on page transition
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Dynamically update page title based on route
  useEffect(() => {
    const routeTitles = {
      '/': 'Ganga Guardian AI — Home',
      '/about': 'Ganga Guardian AI — About Project',
      '/login': 'Ganga Guardian AI — Portal Login',
      '/citizen': 'Ganga Guardian AI — Citizen Hub',
      '/my-reports': 'Ganga Guardian AI — My Submissions',
      '/river-status': 'Ganga Guardian AI — Water Quality Status',
      '/profile': 'Ganga Guardian AI — Citizen Account',
      '/dashboard': 'Ganga Guardian AI — Government Dashboard',
      '/alerts': 'Ganga Guardian AI — AI Alerts log',
      '/biodiversity': 'Ganga Guardian AI — Species Risk Assessments',
      '/digital-twin': 'Ganga Guardian AI — Policy Twin Simulation',
      '/reports': 'Ganga Guardian AI — Incidents Registry',
      '/settings': 'Ganga Guardian AI — System Settings'
    };
    
    document.title = routeTitles[currentPath] || 'Ganga Guardian AI';
  }, [currentPath]);

  // Route router logic
  const renderActivePage = () => {
    switch (currentPath) {
      // --- Public Paths ---
      case '/':
        return <Home onNavigate={navigate} />;
      case '/about':
        return <About />;
      case '/login':
        return <Login onNavigate={navigate} />;

      // --- Protected Citizen Paths ---
      case '/citizen':
        return (
          <ProtectedRoute allowedRoles={['citizen']} onRedirect={navigate}>
            <CitizenPortal />
          </ProtectedRoute>
        );
      case '/my-reports':
        return (
          <ProtectedRoute allowedRoles={['citizen']} onRedirect={navigate}>
            <MyReports onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/river-status':
        return (
          <ProtectedRoute allowedRoles={['citizen']} onRedirect={navigate}>
            <RiverStatus />
          </ProtectedRoute>
        );
      case '/profile':
        return (
          <ProtectedRoute allowedRoles={['citizen']} onRedirect={navigate}>
            <Profile />
          </ProtectedRoute>
        );

      // --- Protected Government Admin Paths ---
      case '/dashboard':
        return (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={navigate}>
            <Dashboard onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/alerts':
        return (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={navigate}>
            <AIAlerts onNavigate={navigate} />
          </ProtectedRoute>
        );
      case '/biodiversity':
        return (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={navigate}>
            <Biodiversity />
          </ProtectedRoute>
        );
      case '/digital-twin':
        return (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={navigate}>
            <DigitalTwin />
          </ProtectedRoute>
        );
      case '/reports':
        return (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={navigate}>
            <Reports />
          </ProtectedRoute>
        );
      case '/settings':
        return (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={navigate}>
            <Settings />
          </ProtectedRoute>
        );

      // --- Fall-back 404 ---
      default:
        return <NotFound onNavigate={navigate} />;
    }
  };

  // Adjust padding depending on if the SubHeader status bar is visible
  const contentPaddingClass = user ? 'pt-[122px]' : 'pt-[78px]';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Dynamic Headers */}
      <Header currentPath={currentPath} onNavigate={navigate} />
      {user && <SubHeader />}

      {/* Main Page Area */}
      <main className={`flex-grow ${contentPaddingClass}`}>
        {renderActivePage()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
