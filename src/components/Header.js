import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hamburger, X, LogOut, User, Wrench, Plus, List, Users } from 'lucide-react';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md fixed top-0 z-50 w-full font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="text-2xl font-bold text-primary-blue">CoolRentals</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/" className="text-text-dark hover:text-primary-blue transition">Home</Link>
                <Link to="/browse" className="text-text-dark hover:text-primary-blue transition">Browse ACs</Link>
                <Link to="/about" className="text-text-dark hover:text-primary-blue transition">About</Link>
                <Link to="/contact" className="text-text-dark hover:text-primary-blue transition">Contact</Link>
                <Link to="/admin/login" className="text-primary-blue hover:text-primary-blue-light transition">Admin Login</Link>
              </>
            ) : isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="flex items-center space-x-1 text-text-dark hover:text-primary-blue transition">
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin/add-ac" className="flex items-center space-x-1 text-text-dark hover:text-primary-blue transition">
                  <Plus className="w-4 h-4" />
                  <span>Add AC</span>
                </Link>
                <Link to="/admin/manage-acs" className="flex items-center space-x-1 text-text-dark hover:text-primary-blue transition">
                  <List className="w-4 h-4" />
                  <span>Manage ACs</span>
                </Link>
                <Link to="/admin/leads" className="flex items-center space-x-1 text-text-dark hover:text-primary-blue transition">
                  <Users className="w-4 h-4" />
                  <span>Leads</span>
                </Link>
                <Link to="/admin/manage-services" className="flex items-center space-x-1 text-text-dark hover:text-primary-blue transition">
                  <Wrench className="w-4 h-4" />
                  <span>Services</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : null}
          </nav>

          {/* Mobile Menu Button - Always on the right */}
          <button
            className="md:hidden text-text-dark flex-shrink-0 ml-auto p-2 rounded-md border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Hamburger className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t bg-white">
            <nav className="flex flex-col space-y-2">
              {!user ? (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">Home</Link>
                  <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">Browse ACs</Link>
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">About</Link>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">Contact</Link>
                  <Link to="/service-request" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">Service Request</Link>
                  <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded text-primary-blue">Admin Login</Link>
                </>
              ) : isAdmin ? (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">Dashboard</Link>
                  <Link to="/admin/add-ac" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">Add AC</Link>
                  <Link to="/admin/manage-acs" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">Manage ACs</Link>
                  <Link to="/admin/leads" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">Leads</Link>
                  <Link to="/admin/manage-services" onClick={() => setMobileMenuOpen(false)} className="px-2 py-2 rounded hover:bg-gray-50 text-text-dark">Services</Link>
                  <button onClick={handleLogout} className="text-red-600 text-left">Logout</button>
                </>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
