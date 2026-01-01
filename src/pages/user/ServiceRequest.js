import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Loader2, Wrench, Clock, Shield, Users, Zap, Droplets, Wind, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import ServiceCard from '../../components/ServiceCard';
import ServiceBookingModal from '../../components/ServiceBookingModal';
import ServiceDetailsModal from '../../components/ServiceDetailsModal';

// Service categories
const SERVICE_CATEGORIES = [
  'Water Leakage Repair',
  'AC Gas Refilling',
  'AC Foam Wash',
  'AC Jet Wash Service',
  'AC Repair Inspection',
  'Split AC Installation'
];

const ServiceRequest = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // null means "All Services"
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const tabsScrollRef = useRef(null);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    const response = await apiService.getServices();
    if (response.success) {
      const allServices = response.data || [];
      setServices(allServices);
      // Initialize filteredServices - useEffect will update it when selectedCategory changes
      setFilteredServices(allServices);
    } else {
      showError('Failed to load services');
      setServices([]);
      setFilteredServices([]);
    }
    setLoading(false);
  };

  // Helper function to determine service category (more precise matching)
  // Memoized with useCallback to prevent unnecessary recalculations
  const getServiceCategory = useCallback((service) => {
    // First, check if service has category field set (exact match) - this is the preferred method
    if (service.category && SERVICE_CATEGORIES.includes(service.category)) {
      return service.category;
    }

    // Fallback: intelligent title and description-based matching with keyword mapping
    const title = (service.title || '').toLowerCase().trim();
    const description = (service.description || '').toLowerCase().trim();
    const searchText = `${title} ${description}`.replace(/\s+/g, ' '); // Normalize whitespace

    // Quick exact title match first (more reliable)
    const titleNormalized = title.replace(/\s+/g, ' ');
    const exactMatches = {
      'split ac installation': 'Split AC Installation',
      'split ac install': 'Split AC Installation',
      'water leakage repair': 'Water Leakage Repair',
      'ac gas refilling': 'AC Gas Refilling',
      'ac foam wash': 'AC Foam Wash',
      'ac jet wash service': 'AC Jet Wash Service',
      'ac jet wash': 'AC Jet Wash Service',
      'ac repair inspection': 'AC Repair Inspection',
      'ac inspection': 'AC Repair Inspection'
    };

    // Check for exact title matches first
    for (const [key, category] of Object.entries(exactMatches)) {
      if (titleNormalized.includes(key)) {
        return category;
      }
    }

    // Define keyword patterns for each category (order matters - more specific first)
    // This prevents false matches (e.g., "installation" matching before "split ac installation")
    const categoryPatterns = [
      {
        category: 'Split AC Installation',
        keywords: [
          'split ac installation', 'split ac install', 'split installation',
          'installing split ac', 'split ac setup', 'install split ac',
          'split ac mounting', 'split installation service'
        ]
      },
      {
        category: 'Water Leakage Repair',
        keywords: [
          'water leakage repair', 'water leakage', 'water leak repair',
          'water leak', 'leakage repair', 'leak repair',
          'fix leak', 'leakage service', 'leak service',
          'drainage leak', 'ac leak', 'ac water leak'
        ]
      },
      {
        category: 'AC Gas Refilling',
        keywords: [
          'gas refilling', 'gas refill', 'gas filling',
          'refill gas', 'ac gas refilling', 'ac gas refill',
          'ac gas filling', 'ac gas', 'gas refilling service',
          'refrigerant refill', 'refrigerant filling', 'refrigerant',
          'gas top-up', 'gas top up', 'gas topup'
        ]
      },
      {
        category: 'AC Foam Wash',
        keywords: [
          'foam wash', 'foam cleaning', 'ac foam wash',
          'ac foam cleaning', 'foam service', 'foam cleaning service',
          'deep foam', 'foam deep clean', 'foam wash service'
        ]
      },
      {
        category: 'AC Jet Wash Service',
        keywords: [
          'jet wash', 'jet cleaning', 'ac jet wash',
          'ac jet cleaning', 'jet wash service', 'jet service',
          'pressure wash', 'pressure cleaning', 'pressure wash service',
          'high pressure', 'high pressure cleaning'
        ]
      },
      {
        category: 'AC Repair Inspection',
        keywords: [
          'repair inspection', 'ac repair inspection',
          'ac inspection', 'inspection service', 'service inspection',
          'repair check', 'diagnosis', 'diagnostic',
          'checkup', 'health check', 'ac checkup',
          'ac diagnosis', 'ac diagnostic'
        ]
      }
    ];

    // Check each category pattern (most specific first)
    // Return the first match found (specificity is ensured by order in array)
    for (const { category, keywords } of categoryPatterns) {
      for (const keyword of keywords) {
        const lowerKeyword = keyword.toLowerCase();
        // Check if keyword exists in search text (case-insensitive)
        if (searchText.includes(lowerKeyword)) {
          return category;
        }
      }
    }

    // Default: no category match (will show in "All Services" only)
    return null;
  }, []); // Empty dependency array since this function doesn't depend on any state/props

  // Filter services based on selected category
  useEffect(() => {
    // Don't filter if services haven't loaded yet
    if (!services || services.length === 0) {
      setFilteredServices([]);
      return;
    }

    // If no category selected (null, undefined, or empty string), show all services
    if (selectedCategory === null || selectedCategory === undefined || selectedCategory === '') {
      setFilteredServices([...services]); // Create new array reference to trigger re-render
      return;
    }

    // Filter services by selected category
    // Always filter from the original services array (not filteredServices)
    const filtered = services.filter(service => {
      try {
        const serviceCategory = getServiceCategory(service);
        // Strict comparison to ensure exact match (both strings must match exactly)
        const matches = serviceCategory === selectedCategory;
        return matches;
      } catch (error) {
        console.error('Error getting service category:', error, service);
        return false;
      }
    });

    // Debug logging to help identify issues
    if (filtered.length === 0 && services.length > 0) {
      console.log('No services matched category:', selectedCategory);
      console.log('Available services categories:', services.map(s => getServiceCategory(s)));
    }

    // Debug logging to help identify issues
    if (process.env.NODE_ENV === 'development') {
      console.log('Filtering services:', {
        selectedCategory,
        totalServices: services.length,
        filteredCount: filtered.length,
        filteredServices: filtered.map(s => ({ id: s._id || s.id, title: s.title, category: getServiceCategory(s) }))
      });
    }

    // Always set filteredServices with the filtered result
    // This ensures the UI updates correctly when switching categories
    // Use a new array reference to force re-render
    setFilteredServices([...filtered]);
  }, [selectedCategory, services, getServiceCategory]);

  // Check scroll position for tabs to show/hide arrows
  const checkScrollPosition = useCallback(() => {
    const scrollContainer = tabsScrollRef.current;
    if (!scrollContainer) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll tabs left/right
  const scrollTabs = (direction) => {
    const scrollContainer = tabsScrollRef.current;
    if (!scrollContainer) return;

    const scrollAmount = 200; // pixels to scroll
    const newScrollLeft = scrollContainer.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    scrollContainer.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  // Check scroll position on mount and when window resizes
  useEffect(() => {
    checkScrollPosition();
    const scrollContainer = tabsScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [checkScrollPosition, services]); // Re-check when services load

  const handleAddClick = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Water Leakage Repair': Droplets,
      'AC Gas Refilling': Wind,
      'AC Foam Wash': Sparkles,
      'AC Jet Wash Service': Sparkles,
      'AC Repair Inspection': Wrench,
      'Split AC Installation': Wrench,
    };
    return iconMap[category] || Wrench;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="w-full">
        {/* Top Half-Screen Split: Left (Title & Description) + Right (Video) */}
        <div className="flex flex-col-reverse lg:flex-row h-[35vh] sm:h-[45vh] lg:h-[55vh] min-h-[280px] lg:min-h-[450px]">
          {/* Left Side: Title, Description, and Cards (Large screens) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 lg:py-10 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3 sm:mb-4">
                AC Repair & Maintenance Services
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mb-4 lg:mb-6">
                Professional AC services with certified technicians. Book now and get service within 1 hour.
              </p>

              {/* Quick Info Cards - Visible on Large Screens Only */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden lg:grid grid-cols-2 gap-3 sm:gap-4"
              >
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-100">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-neutral-900">1 Hour Service</p>
                  <p className="text-xs text-slate-500 mt-1">Quick Response</p>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-100">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-neutral-900">Certified Tech</p>
                  <p className="text-xs text-slate-500 mt-1">Expert Service</p>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-100">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-neutral-900">10K+ Customers</p>
                  <p className="text-xs text-slate-500 mt-1">Trusted Service</p>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-100">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-neutral-900">All AC Types</p>
                  <p className="text-xs text-slate-500 mt-1">Universal Service</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side: Video */}
          <div className="w-full lg:w-1/2 h-full overflow-hidden order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="h-full w-full"
            >
              <video
                className="w-full h-full object-cover"
                controls
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/ac.mov" type="video/quicktime" />
                <source src="/ac.mov" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </div>
        </div>

        {/* Remaining Page Content Below */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">

          {/* Service Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 sm:mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 overflow-hidden relative">
              {/* Left Arrow - Show on small/medium screens when scrollable */}
              {showLeftArrow && (
                <button
                  onClick={() => scrollTabs('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-slate-200 hover:bg-gray-50 transition-all lg:hidden"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}

              {/* Right Arrow - Show on small/medium screens when scrollable */}
              {showRightArrow && (
                <button
                  onClick={() => scrollTabs('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-slate-200 hover:bg-gray-50 transition-all lg:hidden"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}

              <div
                ref={tabsScrollRef}
                className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide lg:flex-wrap lg:overflow-x-visible"
              >
                {/* All Services Tab */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all duration-200 flex items-center gap-1.5 sm:gap-2 flex-shrink-0 whitespace-nowrap ${selectedCategory === null
                    ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Wrench className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>All Services ({services.length})</span>
                </button>

                {/* Category Tabs */}
                {SERVICE_CATEGORIES.map((category) => {
                  const Icon = getCategoryIcon(category);
                  // Use the same helper function for consistent counting
                  const categoryServices = services.filter(service => {
                    const serviceCategory = getServiceCategory(service);
                    return serviceCategory === category;
                  });
                  const count = categoryServices.length;

                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all duration-200 flex items-center gap-1.5 sm:gap-2 flex-shrink-0 whitespace-nowrap ${selectedCategory === category
                        ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{category} ({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Services Grid */}
          {filteredServices.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900">
                  {selectedCategory ? `${selectedCategory} Services` : 'Available Services'} ({filteredServices.length})
                </h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
                {filteredServices
                  .filter(service => service != null) // Filter out any null/undefined services
                  .map((service, index) => {
                    const serviceKey = service._id || service.id || `service-${index}`;
                    return (
                      <motion.div
                        key={serviceKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ServiceCard
                          service={service}
                          onAddClick={handleAddClick}
                          onView={handleViewDetails}
                        />
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          ) : services.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-lg border border-slate-200"
            >
              <Wrench className="w-20 h-20 text-slate-400 mx-auto mb-6" />
              <p className="text-slate-600 text-lg font-medium mb-2">
                No services found in "{selectedCategory}"
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-primary-blue hover:text-primary-blue-light font-semibold underline"
              >
                View all services
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-lg border border-slate-200"
            >
              <Wrench className="w-20 h-20 text-slate-400 mx-auto mb-6" />
              <p className="text-slate-600 text-lg font-medium mb-2">No services available at the moment</p>
              <p className="text-slate-500">Please check back later</p>
            </motion.div>
          )}

          {/* Quick Info Cards - At Bottom of Page (Small/Medium screens only) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-10"
          >
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-100">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-neutral-900">1 Hour Service</p>
              <p className="text-xs text-slate-500 mt-1">Quick Response</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-100">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-neutral-900">Certified Tech</p>
              <p className="text-xs text-slate-500 mt-1">Expert Service</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-100">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-neutral-900">10K+ Customers</p>
              <p className="text-xs text-slate-500 mt-1">Trusted Service</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-100">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500 mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-neutral-900">All AC Types</p>
              <p className="text-xs text-slate-500 mt-1">Universal Service</p>
            </div>
          </motion.div>
        </div>

        {/* Details Modal */}
        {selectedService && showDetailsModal && (
          <ServiceDetailsModal
            service={selectedService}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedService(null);
            }}
            onAdd={(svc) => {
              setShowDetailsModal(false);
              setShowBookingModal(true);
            }}
          />
        )}

        {/* Booking Modal */}
        {selectedService && showBookingModal && (
          <ServiceBookingModal
            service={selectedService}
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedService(null);
            }}
          // onSubmit not needed - modal handles adding to cart automatically
          />
        )}
      </div>
    </div>
  );
};

export default ServiceRequest;
