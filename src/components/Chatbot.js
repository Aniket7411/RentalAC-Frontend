import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Search, Send, Phone } from 'lucide-react';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);

  // WhatsApp number - should be configurable
  const whatsappNumber = '919876543210'; // Replace with actual admin WhatsApp number
  const whatsappMessage = encodeURIComponent('Hello, I have a question about your services.');

  useEffect(() => {
    if (isOpen) {
      loadFAQs();
      // Focus search input when chatbot opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchFAQs(searchQuery);
    } else {
      setFilteredFaqs(faqs);
      setNoResults(false);
    }
  }, [searchQuery, faqs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredFaqs]);

  const loadFAQs = async () => {
    setLoading(true);
    const response = await apiService.getFAQs();
    if (response.success) {
      const allFaqs = response.data || [];
      setFaqs(allFaqs);
      setFilteredFaqs(allFaqs);
      setNoResults(false);
    } else {
      setFaqs([]);
      setFilteredFaqs([]);
    }
    setLoading(false);
  };

  const searchFAQs = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
      setFilteredFaqs(faqs);
      setNoResults(false);
      return;
    }

    const filtered = faqs.filter(faq => {
      const question = (faq.question || '').toLowerCase();
      const answer = (faq.answer || '').toLowerCase();
      return question.includes(lowerQuery) || answer.includes(lowerQuery);
    });

    setFilteredFaqs(filtered);
    setNoResults(filtered.length === 0 && faqs.length > 0);
  };

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Chatbot Toggle Button - Fixed bottom right, positioned below Book Now on mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-primary-blue hover:bg-primary-blue-light'
        }`}
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        )}
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-[55] w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-7rem)] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-blue to-primary-blue-light text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-lg">Help Center</h3>
                  <p className="text-xs text-white/90">Ask us anything</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for questions..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue text-sm"
                />
              </div>
            </div>

            {/* FAQ List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading FAQs...</p>
                  </div>
                </div>
              ) : noResults ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">No FAQs found</h4>
                  <p className="text-sm text-gray-600 mb-6">Can't find what you're looking for?</p>
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-md"
                  >
                    <Phone className="w-5 h-5" />
                    Contact on WhatsApp
                  </button>
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">No FAQs available</h4>
                  <p className="text-sm text-gray-600 mb-6">Contact us directly for assistance</p>
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-md"
                  >
                    <Phone className="w-5 h-5" />
                    Contact on WhatsApp
                  </button>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq._id || faq.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-blue/50 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      {faq.question}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                    {faq.category && (
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        faq.category === 'rental' ? 'bg-blue-100 text-blue-800' :
                        faq.category === 'service' ? 'bg-green-100 text-green-800' :
                        faq.category === 'payment' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {faq.category}
                      </span>
                    )}
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer - WhatsApp Button (shown when no results or empty) */}
            {(noResults || filteredFaqs.length === 0) && !loading && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-md"
                >
                  <Phone className="w-5 h-5" />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;

