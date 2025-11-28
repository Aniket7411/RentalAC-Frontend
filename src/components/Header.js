import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Wrench, Plus, List, Users, LayoutDashboard, Ticket } from 'lucide-react';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const { user, logout, isAdmin, isUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    // Load cart and wishlist counts from localStorage
    const updateCounts = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setCartCount(cart.length);
        setWishlistCount(wishlist.length);
      } catch (error) {
        console.error('Error loading cart/wishlist:', error);
      }
    };

    updateCounts();
    // Update counts when storage changes
    window.addEventListener('storage', updateCounts);
    // Custom event for same-tab updates
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg fixed top-0 z-50 w-full border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <img
              src="/ashlogo.png"
              alt="ASH Enterprise logo"
              className="h-16 w-20 md:h-14 rounded-md md:w-24 object-contain  flex-shrink-0"
              style={{ maxWidth: '100%', height: 'auto' }}
              onError={(e) => {
                console.error('Logo image not found at /ashlogo.png');
                e.target.style.display = 'none';
              }}
            />
            {/* <div className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 group-hover:text-sky-500 transition-colors whitespace-nowrap">
              ASH Enterprise
            </div> */}
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {!user ? (
              <>
                {/* <Link to="/" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Home</Link> */}
                <Link to="/browse" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Browse Products</Link>
                <Link to="/about" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">About</Link>
                <Link to="/contact" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Contact</Link>
                <Link to="/service-request" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Services</Link>
                <Link to="/login" className="ml-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition-all font-semibold shadow-md hover:shadow-lg">Login</Link>
              </>
            ) : isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin/add-product" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </Link>
                <Link to="/admin/manage-products" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <List className="w-4 h-4" />
                  <span>Manage Products</span>
                </Link>
                <Link to="/admin/leads" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <Users className="w-4 h-4" />
                  <span>Leads</span>
                </Link>
                <Link to="/admin/manage-services" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <Wrench className="w-4 h-4" />
                  <span>Services</span>
                </Link>
                <Link to="/admin/tickets" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <Ticket className="w-4 h-4" />
                  <span>Tickets</span>
                </Link>
                <button onClick={handleLogout} className="ml-2 flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all rounded-lg font-medium">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : isUser ? (
              <>
                {/* <Link to="/" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Home</Link> */}
                <Link to="/browse" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Browse</Link>
                <Link to="/user/dashboard" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/user/cart" className="relative flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <FiShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/user/wishlist" className="relative flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <FiHeart className="w-5 h-5" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/user/orders" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Orders</Link>
                <Link to="/service-request" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Services</Link>
                <div className="flex items-center space-x-2 ml-2 px-4 py-2">
                  <FiUser className="w-4 h-4 text-neutral-900" />
                  <span className="text-sm font-medium text-neutral-900">{user?.name || 'User'}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all rounded-lg font-medium">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : null}
          </nav>

          {/* Mobile Menu Button - Always on the right */}

          {/* User Actions for Mobile - Show cart/wishlist even when menu is closed */}
          {isUser && (
            <div className="md:hidden flex items-center space-x-2 mr-2">
              <Link to="/user/cart" className="relative p-2 text-neutral-900 hover:text-sky-500 transition-all">
                <FiShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <Link to="/user/wishlist" className="relative p-2 text-neutral-900 hover:text-sky-500 transition-all">
                <FiHeart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-neutral-900 hover:text-sky-500 hover:border-sky-500 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>

        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-1">
              {!user ? (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Home</Link>
                  <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Browse Products</Link>
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">About</Link>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Contact</Link>
                  <Link to="/service-request" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Services</Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Login</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg bg-sky-500 text-white font-semibold text-center hover:bg-sky-700 transition-all">Sign Up</Link>
                </>
              ) : isAdmin ? (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Dashboard</Link>
                  <Link to="/admin/add-product" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Add Product</Link>
                  <Link to="/admin/manage-products" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Manage Products</Link>
                  <Link to="/admin/leads" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Leads</Link>
                  <Link to="/admin/manage-services" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Services</Link>
                  <button onClick={handleLogout} className="px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 text-left font-medium transition-all">Logout</button>
                </>
              ) : isUser ? (
                <>
                  {/* <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Home</Link> */}
                  <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Browse Products</Link>
                  <Link to="/user/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all flex items-center space-x-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/user/cart" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all flex items-center space-x-2">
                    <FiShoppingCart className="w-4 h-4" />
                    <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                  </Link>
                  <Link to="/user/wishlist" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all flex items-center space-x-2">
                    <FiHeart className="w-4 h-4" />
                    <span>Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</span>
                  </Link>
                  <Link to="/user/orders" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Orders</Link>
                  <Link to="/service-request" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Services</Link>
                  <div className="px-4 py-3 border-t border-gray-200 mt-2 pt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiUser className="w-4 h-4 text-neutral-900" />
                      <span className="text-sm font-medium text-neutral-900">{user?.name || 'User'}</span>
                    </div>
                    <button onClick={handleLogout} className="w-full px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 text-left font-medium transition-all">Logout</button>
                  </div>
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
