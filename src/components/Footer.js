import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-text-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">CoolRentals & Services</h3>
            <p className="text-gray-300 text-sm">
              Your Comfort, Our Priority - Rent & Repair
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-primary-blue-light transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-blue-light transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-blue-light transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-blue-light transition">
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
                <Link to="/browse" className="hover:text-primary-blue-light transition">Browse ACs</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-blue-light transition">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-blue-light transition">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/browse" className="hover:text-primary-blue-light transition">AC Rentals</Link>
              </li>
              <li>
                <Link to="/user/service-request" className="hover:text-primary-blue-light transition">AC Repair</Link>
              </li>
              <li>
                <Link to="/user/service-request" className="hover:text-primary-blue-light transition">AC Maintenance</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>123 Business Street, City, State 12345</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+91 9876543210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@coolrentals.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} CoolRentals & Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

