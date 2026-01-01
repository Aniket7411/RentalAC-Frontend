import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isBrowsePage = location.pathname === '/browse';
  
  return (
    <footer className={`bg-gradient-to-b from-text-dark to-gray-900 text-white mt-20 border-t border-gray-700 relative ${isBrowsePage ? 'z-20' : 'z-0'}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 ${isBrowsePage ? 'lg:pl-[22rem]' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
              <img
                src="/ashlogo.png"
                alt="ASH Enterprise logo"
                className="h-10 w-10 md:h-12 md:w-24 object-contain rounded-md mb-2 drop-shadow-sm flex-shrink-0"
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
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Your Comfort, Our Priority - Rent & Repair
            </p>
            <div className="flex space-x-3 mt-6">
              <a href="https://www.facebook.com/AshEnterprisesMumbai?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary-blue transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary-blue transition-all duration-300 hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/AshEnterprisesMumbai?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary-blue transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary-blue transition-all duration-300 hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-primary-blue-light transition">Home</Link>
              </li>
              <li>
                <Link to="/browse?category=AC" className="hover:text-primary-blue-light transition">Rent</Link>
              </li>
              <li>
                <Link to="/service-request" className="hover:text-primary-blue-light transition">Services</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-blue-light transition">About</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-blue-light transition">Contact</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-blue-light transition">Login</Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/terms-conditions" className="hover:text-primary-blue-light transition">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-primary-blue-light transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/cancellation-refund-policy" className="hover:text-primary-blue-light transition">Cancellation & Refund</Link>
              </li>
              <li>
                <Link to="/delivery-service-policy" className="hover:text-primary-blue-light transition">Delivery & Service</Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-primary-blue-light transition">Shipping Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+918169535736" className="hover:text-primary-blue-light transition">
                  +91 8169535736
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@ashenterprises.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Shop No 3 Sai prasad building, hanuman nagar, goregaon west 400104</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-10 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 ASH Enterprises. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

