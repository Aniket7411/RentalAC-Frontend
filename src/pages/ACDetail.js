import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { MapPin, ChevronLeft, ChevronRight, ArrowLeft, Phone, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatPhoneNumber, getFormattedPhone, validatePhoneNumber } from '../utils/phoneFormatter';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const ACDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ac, setAc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadAC();
  }, [id]);

  const loadAC = async () => {
    setLoading(true);
    try {
      const response = await apiService.getACById(id);
      if (response.success) {
        setAc(response.data);
      } else {
        showError(response.message || 'Failed to load AC details');
        setTimeout(() => navigate('/browse'), 2000);
      }
    } catch (err) {
      showError('An error occurred while loading AC details');
      setTimeout(() => navigate('/browse'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (ac?.images && ac.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % ac.images.length);
    }
  };

  const prevImage = () => {
    if (ac?.images && ac.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + ac.images.length) % ac.images.length);
    }
  };

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setInquiryData({ ...inquiryData, phone: formatted });
    } else {
      setInquiryData({ ...inquiryData, [name]: value });
    }
    setInquiryError('');
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryError('');

    if (!inquiryData.name || !inquiryData.phone || !inquiryData.email) {
      setInquiryError('Please fill all required fields');
      return;
    }

    // Validate phone number (must be 10 digits)
    if (!validatePhoneNumber(inquiryData.phone)) {
      setInquiryError('Please enter a valid 10-digit phone number');
      return;
    }

    setSubmittingInquiry(true);

    try {
      // Format phone number with +91 before sending
      // Include AC details in the inquiry for backend reference
      const formattedData = {
        ...inquiryData,
        phone: getFormattedPhone(inquiryData.phone),
        // Include AC details for backend reference
        acDetails: ac ? {
          id: ac._id || ac.id,
          brand: ac.brand,
          model: ac.model,
          capacity: ac.capacity,
          type: ac.type,
          location: ac.location,
          price: ac.price,
        } : undefined,
      };

      const response = await apiService.createRentalInquiry(id, formattedData);
      if (response.success) {
        success('Rental inquiry submitted successfully! We will contact you soon.');
        setInquirySuccess(true);
        setInquiryData({ name: '', phone: '', email: '', message: '' });
        setTimeout(() => {
          setShowInquiryForm(false);
          setInquirySuccess(false);
        }, 2000);
      } else {
        const errorMsg = response.message || 'Failed to submit inquiry. Please try again.';
        setInquiryError(errorMsg);
        showError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.';
      setInquiryError(errorMsg);
      showError(errorMsg);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-blue mx-auto mb-4" />
          <p className="text-text-light">Loading AC details...</p>
        </div>
      </div>
    );
  }

  if (!ac) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-light text-lg mb-4">AC not found</p>
          <Link
            to="/browse"
            className="text-primary-blue hover:text-primary-blue-light"
          >
            Go back to browse
          </Link>
        </div>
      </div>
    );
  }

  const price = ac.price?.[selectedDuration] || 0;
  const hasImages = ac.images && ac.images.length > 0;

  return (
    <div className="min-h-screen bg-background-light py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/browse')}
          className="flex items-center space-x-2 text-text-light hover:text-primary-blue mb-4 w-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className='w-auto'>Back to Browse</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {hasImages ? (
              <div className="relative h-96 bg-gray-200">
                <img
                  src={ac.images[currentImageIndex]}
                  alt={`${ac.brand} ${ac.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=AC+Image';
                  }}
                />
                {ac.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Previous image"
                      className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full text-white bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transition transform hover:bg-white/30 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#000]" />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full text-white bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transition transform hover:bg-white/30 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      <ChevronRight className="w-5 h-5 text-[#000]" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {ac.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition ${index === currentImageIndex
                            ? 'bg-white w-8'
                            : 'bg-white bg-opacity-50'
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-400 bg-gray-100">
                No Image Available
              </div>
            )}
          </div>

          {/* AC Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-text-dark mb-2">
                  {ac.brand} {ac.model}
                </h1>
                <p className="text-text-light text-lg">
                  {ac.capacity} • {ac.type}
                </p>
              </div>
              {ac.status && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${ac.status === 'Available'
                    ? 'bg-green-100 text-green-800'
                    : ac.status === 'Rented Out'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                  {ac.status}
                </span>
              )}
            </div>

            <div className="flex items-center text-text-light mb-6">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{ac.location}</span>
            </div>

            {ac.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-text-dark mb-2">Description</h3>
                <p className="text-text-light">{ac.description}</p>
              </div>
            )}

            {/* Pricing */}
            <div className="mb-6">
              <h3 className="font-semibold text-text-dark mb-4">Rental Pricing</h3>
              <div className="flex space-x-2 mb-4">
                {['monthly', 'quarterly', 'yearly'].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-3 py-1 rounded-lg transition ${selectedDuration === duration
                      ? 'bg-primary-blue text-white'
                      : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                      }`}
                  >
                    {duration.charAt(0).toUpperCase() + duration.slice(1)}
                  </button>
                ))}
              </div>
              <div className="text-4xl font-bold text-primary-blue">
                ₹{price.toLocaleString()}
                <span className="text-lg text-text-light font-normal">
                  /{selectedDuration === 'monthly' ? 'month' : selectedDuration === 'quarterly' ? 'quarter' : 'year'}
                </span>
              </div>
            </div>

            {/* Inquiry Button */}
            {ac.status === 'Available' && (
              <button
                onClick={() => setShowInquiryForm(true)}
                className="w-full bg-primary-blue text-white py-1 rounded-lg hover:bg-primary-blue-light transition font-semibold"
              >
                Inquire About Rental
              </button>
            )}
          </div>
        </div>

        {/* Inquiry Form Modal */}
        {showInquiryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-dark">Rental Inquiry</h2>
                <button
                  onClick={() => {
                    setShowInquiryForm(false);
                    setInquiryError('');
                    setInquirySuccess(false);
                  }}
                  className="text-text-light hover:text-text-dark"
                >
                  ✕
                </button>
              </div>

              {inquirySuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-text-dark mb-2">
                    Thank you for your inquiry!
                  </p>
                  <p className="text-text-light">
                    We'll contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  {inquiryError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {inquiryError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={inquiryData.name}
                      onChange={handleInquiryChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light text-sm font-medium">
                        +91
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={inquiryData.phone}
                        onChange={handleInquiryChange}
                        required
                        maxLength={15}
                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        placeholder="9876543210"
                      />
                    </div>
                    <p className="text-xs text-text-light mt-1">Enter 10-digit phone number</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={inquiryData.email}
                      onChange={handleInquiryChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      value={inquiryData.message}
                      onChange={handleInquiryChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInquiryForm(false);
                        setInquiryError('');
                        setInquirySuccess(false);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingInquiry}
                      className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {submittingInquiry ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        'Submit Inquiry'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ACDetail;

