import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { LogOut, Menu, X, User } from 'lucide-react';

export default function Header({ currentPath, onNavigate }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (path, e) => {
    e.preventDefault();
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    onNavigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return currentPath === path
      ? 'text-accent border-b-2 border-accent font-semibold pb-1'
      : 'text-white/80 hover:text-white transition-colors pb-1';
  };

  // Define menus depending on user role
  const renderNavLinks = () => {
    if (!user) {
      // Guest Links
      return (
        <>
          <a href="/" onClick={(e) => handleLinkClick('/', e)} className={isActive('/')}>Home</a>
          <a href="/about" onClick={(e) => handleLinkClick('/about', e)} className={isActive('/about')}>About</a>
          <a href="/login" onClick={(e) => handleLinkClick('/login', e)} className="text-sm font-semibold text-primary bg-accent hover:bg-accent/90 px-4.5 py-1.5 rounded transition-all shadow-md">Login</a>
        </>
      );
    }

    if (user.role === 'citizen') {
      // Citizen Links
      return (
        <>
          <a href="/" onClick={(e) => handleLinkClick('/', e)} className={isActive('/')}>Home</a>
          <a href="/citizen" onClick={(e) => handleLinkClick('/citizen', e)} className={isActive('/citizen')}>Citizen Portal</a>
          <a href="/my-reports" onClick={(e) => handleLinkClick('/my-reports', e)} className={isActive('/my-reports')}>My Reports</a>
          <a href="/river-status" onClick={(e) => handleLinkClick('/river-status', e)} className={isActive('/river-status')}>River Status</a>
          <a href="/profile" onClick={(e) => handleLinkClick('/profile', e)} className={isActive('/profile')}>Profile</a>
          <button onClick={handleLogoutClick} className="text-sm font-medium text-white/80 hover:text-red-400 flex items-center gap-1 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </>
      );
    }

    if (user.role === 'industry') {
      return (
        <>
          <a href="/industry" onClick={(e) => handleLinkClick('/industry', e)} className={isActive('/industry')}>Industry Portal</a>
          <a href="/profile" onClick={(e) => handleLinkClick('/profile', e)} className={isActive('/profile')}>Profile</a>
          <button onClick={handleLogoutClick} className="text-sm font-medium text-white/80 hover:text-red-400 flex items-center gap-1 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </>
      );
    }

    if (user.role === 'admin' || user.role === 'government_officer') {
      // Admin/Government Links
      return (
        <>
          <a href="/dashboard" onClick={(e) => handleLinkClick('/dashboard', e)} className={isActive('/dashboard')}>Dashboard</a>
          <a href="/alerts" onClick={(e) => handleLinkClick('/alerts', e)} className={isActive('/alerts')}>AI Alerts</a>
          <a href="/biodiversity" onClick={(e) => handleLinkClick('/biodiversity', e)} className={isActive('/biodiversity')}>Biodiversity</a>
          <a href="/digital-twin" onClick={(e) => handleLinkClick('/digital-twin', e)} className={isActive('/digital-twin')}>Digital Twin</a>
          <a href="/reports" onClick={(e) => handleLinkClick('/reports', e)} className={isActive('/reports')}>Reports</a>
          {user.role === 'admin' && (
            <>
              <a href="/settings" onClick={(e) => handleLinkClick('/settings', e)} className={isActive('/settings')}>Settings</a>
              <a href="/admin" onClick={(e) => handleLinkClick('/admin', e)} className={isActive('/admin')}>Admin</a>
            </>
          )}
          <button onClick={handleLogoutClick} className="text-sm font-medium text-white/80 hover:text-red-400 flex items-center gap-1 transition-colors">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </>
      );
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg border-b border-white/5">
      {/* Tricolour Top Band */}
      <div className="flex h-1.5 w-full">
        <div className="flex-1 bg-[#F4C430]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-safe-green"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Agency Info */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col border-r border-white/10 pr-6 text-left">
              <span className="text-white/60 text-[9px] tracking-wider uppercase font-semibold">Government of India</span>
              <span className="text-white text-xs font-semibold tracking-wide">Ministry of Jal Shakti</span>
            </div>
            
            <a href="/" onClick={(e) => handleLinkClick('/', e)} className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="Ganga Guardian AI Logo"
                className="h-10 w-auto object-contain drop-shadow-sm group-hover:opacity-90 transition-opacity"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {renderNavLinks()}
            <div className="h-4 w-px bg-white/10"></div>
            <button className="text-[10px] font-bold text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/15 cursor-pointer uppercase transition-colors">
              EN | हिन्दी
            </button>
            {user && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/15 rounded-full text-xs font-bold text-accent uppercase tracking-wide">
                <User className="h-3 w-3" />
                <span>{user.role}</span>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            {user && (
              <div className="px-2 py-0.5 bg-white/5 border border-white/15 rounded text-[10px] font-bold text-accent uppercase">
                {user.role}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-white/5 rounded transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-primary border-t border-white/5 shadow-2xl transition-all duration-300">
          <div className="flex flex-col px-6 py-6 space-y-4 text-left">
            {user ? (
              <div className="border-b border-white/5 pb-3 mb-1">
                <p className="text-xs text-white/50">Logged in as</p>
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-accent uppercase tracking-wider">{user.email}</p>
              </div>
            ) : null}
            
            {/* Nav links styled for mobile */}
            {!user ? (
              <>
                <a href="/" onClick={(e) => handleLinkClick('/', e)} className="text-white hover:text-accent font-medium py-1">Home</a>
                <a href="/about" onClick={(e) => handleLinkClick('/about', e)} className="text-white hover:text-accent font-medium py-1">About</a>
                <a href="/login" onClick={(e) => handleLinkClick('/login', e)} className="text-center text-primary bg-accent hover:bg-accent/90 font-bold py-2 rounded shadow-md mt-2">Login</a>
              </>
            ) : user.role === 'citizen' ? (
              <>
                <a href="/" onClick={(e) => handleLinkClick('/', e)} className="text-white hover:text-accent font-medium py-1">Home</a>
                <a href="/citizen" onClick={(e) => handleLinkClick('/citizen', e)} className="text-white hover:text-accent font-medium py-1">Citizen Portal</a>
                <a href="/my-reports" onClick={(e) => handleLinkClick('/my-reports', e)} className="text-white hover:text-accent font-medium py-1">My Reports</a>
                <a href="/river-status" onClick={(e) => handleLinkClick('/river-status', e)} className="text-white hover:text-accent font-medium py-1">River Status</a>
                <a href="/profile" onClick={(e) => handleLinkClick('/profile', e)} className="text-white hover:text-accent font-medium py-1">Profile</a>
                <button onClick={handleLogoutClick} className="text-left text-red-400 hover:text-red-300 font-medium py-2 border-t border-white/5 mt-2 flex items-center gap-1.5">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : user.role === 'industry' ? (
              <>
                <a href="/industry" onClick={(e) => handleLinkClick('/industry', e)} className="text-white hover:text-accent font-medium py-1">Industry Portal</a>
                <a href="/profile" onClick={(e) => handleLinkClick('/profile', e)} className="text-white hover:text-accent font-medium py-1">Profile</a>
                <button onClick={handleLogoutClick} className="text-left text-red-400 hover:text-red-300 font-medium py-2 border-t border-white/5 mt-2 flex items-center gap-1.5">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <a href="/dashboard" onClick={(e) => handleLinkClick('/dashboard', e)} className="text-white hover:text-accent font-medium py-1">Dashboard</a>
                <a href="/alerts" onClick={(e) => handleLinkClick('/alerts', e)} className="text-white hover:text-accent font-medium py-1">AI Alerts</a>
                <a href="/biodiversity" onClick={(e) => handleLinkClick('/biodiversity', e)} className="text-white hover:text-accent font-medium py-1">Biodiversity</a>
                <a href="/digital-twin" onClick={(e) => handleLinkClick('/digital-twin', e)} className="text-white hover:text-accent font-medium py-1">Digital Twin</a>
                <a href="/reports" onClick={(e) => handleLinkClick('/reports', e)} className="text-white hover:text-accent font-medium py-1">Reports</a>
                {user.role === 'admin' && (
                  <>
                    <a href="/settings" onClick={(e) => handleLinkClick('/settings', e)} className="text-white hover:text-accent font-medium py-1">Settings</a>
                    <a href="/admin" onClick={(e) => handleLinkClick('/admin', e)} className="text-white hover:text-accent font-medium py-1">Admin Panel</a>
                  </>
                )}
                <button onClick={handleLogoutClick} className="text-left text-red-400 hover:text-red-300 font-medium py-2 border-t border-white/5 mt-2 flex items-center gap-1.5">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
