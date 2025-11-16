import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Wrench, Plus, List, Users } from 'lucide-react';
import { FaHamburger } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

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
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="text-xl sm:text-2xl font-bold text-primary-blue">CoolRentals</div>
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

          {/* Mobile Menu Button - Properly positioned on the right */}
        
        </div>

        {/* Mobile Navigation - Improved styling */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <nav className="flex flex-col py-2">
              {!user ? (
                <>
                  <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
                  <MobileNavLink to="/browse" onClick={() => setMobileMenuOpen(false)}>Browse ACs</MobileNavLink>
                  <MobileNavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileNavLink>
                  <MobileNavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</MobileNavLink>
                  <MobileNavLink to="/service-request" onClick={() => setMobileMenuOpen(false)}>Service Request</MobileNavLink>
                  <MobileNavLink to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="text-primary-blue font-semibold">
                    Admin Login
                  </MobileNavLink>
                </>
              ) : isAdmin ? (
                <>
                  <MobileNavLink to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} icon={<User className="w-4 h-4" />}>
                    Dashboard
                  </MobileNavLink>
                  <MobileNavLink to="/admin/add-ac" onClick={() => setMobileMenuOpen(false)} icon={<Plus className="w-4 h-4" />}>
                    Add AC
                  </MobileNavLink>
                  <MobileNavLink to="/admin/manage-acs" onClick={() => setMobileMenuOpen(false)} icon={<List className="w-4 h-4" />}>
                    Manage ACs
                  </MobileNavLink>
                  <MobileNavLink to="/admin/leads" onClick={() => setMobileMenuOpen(false)} icon={<Users className="w-4 h-4" />}>
                    Leads
                  </MobileNavLink>
                  <MobileNavLink to="/admin/manage-services" onClick={() => setMobileMenuOpen(false)} icon={<Wrench className="w-4 h-4" />}>
                    Services
                  </MobileNavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Mobile Navigation Link Component for better reusability
const MobileNavLink = ({ to, onClick, children, icon, className = "" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-3 text-text-dark hover:bg-gray-50 transition-colors border-b border-gray-100 ${className}`}
  >
    {icon}
    <span>{children}</span>
  </Link>
);

export default Header;