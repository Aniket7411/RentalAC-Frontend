import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Snowflake, Wrench, Clock, Loader2, Shield, Zap, Users, ShieldCheck, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import ACCard from '../components/ACCard';
import ServiceCard from '../components/ServiceCard';
import ServiceBookingModal from '../components/ServiceBookingModal';
// import SingleScreen from './SingleScreen/SingleScreen';
import InstallCard from '../components/installcard';
import CouponModal from '../components/CouponModal';

const Home = () => {
  const [featuredACs, setFeaturedACs] = useState([]);
  const [featuredRefrigerators, setFeaturedRefrigerators] = useState([]);
  const [featuredWashingMachines, setFeaturedWashingMachines] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [hoveredPanel, setHoveredPanel] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [hasCoupons, setHasCoupons] = useState(false);

  useEffect(() => {
    // Custom cursor effect
    const updateCursor = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over interactive elements
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        const isInteractive =
          (element.closest && element.closest('.price-card')) ||
          (element.closest && element.closest('button')) ||
          (element.closest && element.closest('a[href]')) ||
          (element.closest && element.closest('.cursor-hover')) ||
          element.classList?.contains('price-card') ||
          element.classList?.contains('cursor-hover') ||
          element.tagName === 'BUTTON' ||
          element.tagName === 'A';

        setIsHovering(!!isInteractive);
      } else {
        setIsHovering(false);
      }
    };

    if (isDesktop) {
      document.addEventListener('mousemove', updateCursor);
      document.body.style.cursor = 'none'; // Hide default cursor
    }

    return () => {
      if (isDesktop) {
        document.removeEventListener('mousemove', updateCursor);
        document.body.style.cursor = 'auto'; // Restore default cursor
      }
    };
  }, [isDesktop]);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingServices(true);
        const [acsResponse, refrigeratorsResponse, washingMachinesResponse, servicesResponse] = await Promise.all([
          apiService.getACs({ category: 'AC' }),
          apiService.getACs({ category: 'Refrigerator' }),
          apiService.getACs({ category: 'Washing Machine' }),
          apiService.getServices(),
        ]);

        if (acsResponse.success) {
          const acs = Array.isArray(acsResponse.data) ? acsResponse.data : (Array.isArray(acsResponse.data?.data) ? acsResponse.data.data : []);
          setFeaturedACs(acs.slice(0, 6));
        }

        if (refrigeratorsResponse.success) {
          const fridges = Array.isArray(refrigeratorsResponse.data) ? refrigeratorsResponse.data : (Array.isArray(refrigeratorsResponse.data?.data) ? refrigeratorsResponse.data.data : []);
          setFeaturedRefrigerators(fridges.slice(0, 6));
        }

        if (washingMachinesResponse.success) {
          const wms = Array.isArray(washingMachinesResponse.data) ? washingMachinesResponse.data : (Array.isArray(washingMachinesResponse.data?.data) ? washingMachinesResponse.data.data : []);
          setFeaturedWashingMachines(wms.slice(0, 6));
        }

        if (servicesResponse.success) {
          const svcs = Array.isArray(servicesResponse.data) ? servicesResponse.data : (Array.isArray(servicesResponse.data?.data) ? servicesResponse.data.data : []);
          setServices(svcs.slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoadingServices(false);
      }
    };
    loadData();
  }, []);

  // Check for available coupons and show modal if coupons exist
  useEffect(() => {
    let timer;
    
    const checkAndShowCoupons = async () => {
      const hasSeenCoupons = localStorage.getItem('hasSeenCoupons');
      if (!hasSeenCoupons) {
        try {
          // Check if there are any available coupons
          const response = await apiService.getAvailableCoupons();
          if (response.success && response.data && response.data.length > 0) {
            setHasCoupons(true);
            // Show modal after a short delay for better UX
            timer = setTimeout(() => {
              setShowCouponModal(true);
            }, 2000); // 2 seconds delay
          } else {
            setHasCoupons(false);
          }
        } catch (error) {
          console.error('Error checking coupons:', error);
          setHasCoupons(false);
        }
      }
    };
    
    checkAndShowCoupons();
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  const handleCloseCouponModal = () => {
    setShowCouponModal(false);
    localStorage.setItem('hasSeenCoupons', 'true');
  };

  const handleServiceAdd = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  // Note: ServiceBookingModal handles adding to cart automatically
  // No need for handleBookingSubmit - service goes through cart → checkout → order flow

  const steps = [
    { icon: '🔍', title: 'Browse', description: 'Search through our wide selection of ACs' },
    { icon: '✅', title: 'Select & Inquire', description: 'Choose your preferred AC and contact the vendor' },
    { icon: '🏠', title: 'Get Installed', description: 'Get your AC installed and enjoy cool comfort' },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      location: 'Mumbai',
      rating: 5,
      text: 'Great service! Found the perfect AC for my home. The rental process was smooth and hassle-free.',
    },
    {
      name: 'Priya Sharma',
      location: 'Delhi',
      rating: 5,
      text: 'Excellent repair service. The technician was professional and fixed my AC quickly.',
    },
    {
      name: 'Amit Patel',
      location: 'Bangalore',
      rating: 5,
      text: 'Best AC rental platform. Affordable prices and reliable vendors. Highly recommended!',
    },
  ];

  return (
    <div className="min-h-screen bg-background-light overflow-x-hidden" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
      {/* Custom Cursor - Desktop Only */}
      {isDesktop && (
        <div
          className={`custom-cursor ${isHovering ? 'hover' : ''}`}
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
          }}
        />
      )}

      {/* Sticky Mobile Book Now Button - Positioned above chat icon with proper spacing */}
      <Link
        to="/service-request"
        className="fixed right-4 md:hidden z-50 px-4 py-2.5 bg-primary-blue text-white rounded-full font-semibold text-xs shadow-2xl hover:bg-primary-blue-light transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ bottom: '80px' }}
      >
        Book Now
      </Link>
      {/* OLD Hero Banner Section - COMMENTED OUT */}
      {/* <section className="relative w-full h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-gradient-to-br from-primary-blue via-blue-600 to-primary-blue-light">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1920&q=80"
            alt="Air Conditioner"
            className="w-full h-full object-cover opacity-20"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-blue/90 via-primary-blue/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white w-full"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight">
              Premium AC Rental & <br className="hidden sm:block" />
              <span className="text-blue-200">Service Solutions</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-7 md:mb-8 text-blue-100 leading-relaxed">
              Stay cool with our wide selection of premium air conditioners.
              Fast installation, reliable service, and flexible rental options.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/browse?categories=AC%2CRefrigerator%2CWashing+Machine"
                className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-white text-primary-blue rounded-lg sm:rounded-xl font-semibold sm:font-bold text-sm sm:text-base md:text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 hover:bg-blue-50"
              >
                Rent Now
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                to="/service-request"
                className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-lg sm:rounded-xl font-semibold sm:font-bold text-sm sm:text-base md:text-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300"
              >
                Book Service
                <Wrench className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section> */}

      {/* NEW Hero Section - Split Screen */}
      <section
        className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onMouseMove={(e) => {
          if (!isDesktop) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const percentage = (mouseX / rect.width) * 100;
          // Only expand when mouse is in outer zones (<25% or >75%)
          if (percentage < 25) {
            setHoveredPanel('left');
          } else if (percentage > 75) {
            setHoveredPanel('right');
          } else {
            setHoveredPanel(null);
          }
        }}
        onMouseLeave={() => isDesktop && setHoveredPanel(null)}
      >
        {/* Left Panel: Rental */}
        <motion.div
          className="relative w-full md:w-1/2 h-[50vh] md:h-full overflow-hidden cursor-pointer group"
          animate={isDesktop ? {
            width: hoveredPanel === 'left' ? '65%' : hoveredPanel === 'right' ? '35%' : '50%',
          } : {}}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/bannerleftimage.png"
              alt="Premium AC Rental"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {/* Darker overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-black/30"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-start px-4 sm:px-6 md:px-8 lg:px-12 text-white">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-lg"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-5 leading-tight">
                Don't Buy. Just Rent.
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90 leading-relaxed">
                Premium Split & Window ACs starting at flexible monthly plans. Free relocation included.
              </p>
              <Link
                to="/browse?category=AC"
                className="cursor-hover inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-white/10 transition-all duration-300"
              >
                Explore Rentals
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel: Services */}
        <motion.div
          className="relative w-full md:w-1/2 h-[50vh] md:h-full overflow-hidden cursor-pointer group"
          animate={isDesktop ? {
            width: hoveredPanel === 'right' ? '65%' : hoveredPanel === 'left' ? '35%' : '50%',
          } : {}}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/bannerright.png"
              alt="AC Repair & Service"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {/* Darker overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/40 to-black/30"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-start md:items-end px-4 sm:px-6 md:px-8 lg:px-12 text-white text-left md:text-right">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-lg"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-5 leading-tight">
                Expert AC Care & Repair.
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90 leading-relaxed">
                From Foam Wash to Gas Charging. Mumbai's most trusted technicians.
              </p>
              <Link
                to="/service-request"
                className="cursor-hover inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-primary-blue text-white rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-primary-blue-light transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Book Service
                <Wrench className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Brands We Work With - Logo Scroller */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8 md:mb-10"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-dark mb-2">
              Brands We Work With
            </h2>
          </motion.div>

          {/* Logo Scroller */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll" style={{ width: 'max-content' }}>
              {/* First set of logos */}
              {[
                { name: 'Voltas', src: '/voltaslogo.png' },
                { name: 'Carrier', src: '/carrierlogo.png' },
                { name: 'Blue Star', src: '/blustarlogo.png' },
                { name: 'Daikin', src: '/daikinlogo.png' },
                { name: 'Samsung', src: '/samsung.png' },
                { name: 'Hitachi', src: '/hitachilogo.png' },
                { name: 'Whirlpool', src: '/whirlphoollogo.png' },
              ].map((brand, index) => (
                <div
                  key={`brand-1-${index}`}
                  className="flex-shrink-0 flex items-center justify-center w-32 sm:w-40 md:w-48 h-20 sm:h-24 md:h-28 px-4 md:px-6 transition-all duration-300"
                >
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
              {/* Duplicate set for seamless infinite loop */}
              {[
                { name: 'Voltas', src: '/voltaslogo.png' },
                { name: 'Carrier', src: '/carrierlogo.png' },
                { name: 'Blue Star', src: '/blustarlogo.png' },
                { name: 'Daikin', src: '/daikinlogo.png' },
                { name: 'Samsung', src: '/samsung.png' },
                { name: 'Hitachi', src: '/hitachilogo.png' },
                { name: 'Whirlpool', src: '/whirlphoollogo.png' },
              ].map((brand, index) => (
                <div
                  key={`brand-2-${index}`}
                  className="flex-shrink-0 flex items-center justify-center w-32 sm:w-40 md:w-48 h-20 sm:h-24 md:h-28 px-4 md:px-6 transition-all duration-300"
                >
                  <img
                    src={brand.src}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Product Category Selection Section */}
      <section className="py-4 sm:py-6 md:py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8 md:mb-10"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-dark mb-2 sm:mb-3">
              Appliances on rent
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-light">
              Checkout our huge collection of appliances on rent
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {/* AC Category */}
            <div className="flex flex-col gap-3 md:gap-4">
              <Link
                to="/browse?category=AC"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 relative">
                  <img
                    src="/acimage.jpg"
                    alt="Air Conditioners"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">Air Conditioners</h3>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base">Stay cool & comfortable</p>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white mt-1 sm:mt-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
              {/* AC Subcategories */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <Link
                  to="/browse?category=AC&type=Split"
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 relative">
                    <img
                      src="/splitac.jpg"
                      alt="Split AC"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-3">
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-white">Split AC</h4>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/browse?category=AC&type=Window"
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 relative">
                    <img
                      src="/windowac.jfif"
                      alt="Window AC"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-3">
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-white">Window AC</h4>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Refrigerator Category */}
            <div className="flex flex-col gap-3 md:gap-4">
              <Link
                to="/browse?category=Refrigerator"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="aspect-video bg-gradient-to-br from-cyan-50 to-cyan-100 relative">
                  <img
                    src="/refrigrator.jpg"
                    alt="Refrigerators"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">Refrigerators</h3>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base">Fresh storage solutions</p>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white mt-1 sm:mt-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
              {/* Refrigerator Subcategories */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <Link
                  to="/browse?category=Refrigerator&type=Single Door"
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-cyan-100 to-cyan-200 relative">
                    <img
                      src="/singledoor.jfif"
                      alt="Single Door Refrigerator"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-3">
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-white">Single Door</h4>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/browse?category=Refrigerator&type=Double Door"
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-cyan-100 to-cyan-200 relative">
                    <img
                      src="/doubldoor.jfif"
                      alt="Double Door Refrigerator"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-3">
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-white">Double Door</h4>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Washing Machine Category */}
            <div className="flex flex-col gap-3 md:gap-4">
              <Link
                to="/browse?category=Washing Machine"
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="aspect-video bg-gradient-to-br from-purple-50 to-purple-100 relative">
                  <img
                    src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80"
                    alt="Washing Machines"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">Washing Machines</h3>
                    <p className="text-white/90 text-xs sm:text-sm md:text-base">Clean clothes effortlessly</p>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white mt-1 sm:mt-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
              {/* Washing Machine Subcategories */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <Link
                  to="/browse?category=Washing Machine&type=Automatic"
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-200 relative">
                    <img
                      src="/fullyautomaticwashingmachine.jfif"
                      alt="Fully Automatic Washing Machine"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-3">
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-white">Fully Automatic</h4>
                    </div>
                  </div>
                </Link>
                <Link
                  to="/browse?category=Washing Machine&type=Semi-Automatic"
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-200 relative">
                    <img
                      src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80"
                      alt="Semi-Automatic Washing Machine"
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-3">
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-white">Semi-Automatic</h4>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>






      {/* Services Section */}
      <section className="py-4 sm:py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8 md:mb-10"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-dark mb-2 sm:mb-3">
              AC Repair & Maintenance Services
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-light mb-4 sm:mb-6">
              Professional AC services at your doorstep
            </p>
            <Link
              to="/service-request"
              className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-blue-light font-semibold group transition-all"
            >
              <span>View All Services</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service._id || service.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                  className="price-card"
                >
                  <ServiceCard service={service} onAddClick={handleServiceAdd} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No services available at the moment</p>
              <Link
                to="/service-request"
                className="inline-block mt-4 text-primary-blue hover:text-primary-blue-light"
              >
                View All Services
              </Link>
            </div>
          )}
        </div>
      </section>


      {/* Value Proposition - Why Choose Us Section */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark mb-3 sm:mb-4">
              Why Mumbai Trusts ASH Enterprises
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {[
              {
                icon: ShieldCheck,
                title: 'Zero Hidden Costs',
                description: 'Fixed prices. You pay exactly what you see. ₹149 for visits, ₹449 for service. No surprises.',
                color: 'from-primary-blue to-primary-blue-light',
                bgColor: 'bg-blue-50',
              },
              {
                icon: Snowflake,
                title: 'Free Maintenance on Rentals',
                description: 'Renting? If it stops cooling, we fix or replace it within 24 hours for free.',
                color: 'from-cyan-500 to-blue-500',
                bgColor: 'bg-cyan-50',
              },
              {
                icon: Sparkles,
                title: 'Lab-Grade Hygiene',
                description: 'We use industrial Foam Wash technology to remove 99.9% of hidden dust and mold.',
                color: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Same-Day Service',
                description: 'We prioritize breakdowns. Our tech-enabled dispatch gets an expert to you fast.',
                color: 'from-yellow-500 to-orange-500',
                bgColor: 'bg-yellow-50',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${feature.bgColor} p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group`}
              >
                {/* <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div> */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-text-dark mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-text-light leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Service Booking Modal */}
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
      {/* Featured ACs */}
      {/* <section className="py-4 sm:py-6 md:py-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 md:mb-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-dark mb-2">Featured Air Conditioners</h2>
              <p className="text-xs sm:text-sm md:text-base text-text-light">Discover our premium collection of air conditioners</p>
            </div>
            <Link
              to="/browse?category=AC"
              className="mt-4 sm:mt-0 text-primary-blue hover:text-primary-blue-light flex items-center space-x-2 font-semibold group transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          {loadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
            </div>
          ) : featuredACs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {featuredACs.map((ac) => (
                <ACCard key={ac.id || ac._id} ac={ac} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Snowflake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No ACs available at the moment</p>
            </div>
          )}
        </div>
      </section> */}

      {/* Featured Refrigerators */}
      {/* <section className="py-4 sm:py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 md:mb-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-dark mb-2">Featured Refrigerators</h2>
              <p className="text-xs sm:text-sm md:text-base text-text-light">Cool your home with our premium refrigerator collection</p>
            </div>
            <Link
              to="/browse?category=Refrigerator"
              className="mt-4 sm:mt-0 text-primary-blue hover:text-primary-blue-light flex items-center space-x-2 font-semibold group transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          {loadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
            </div>
          ) : featuredRefrigerators.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {featuredRefrigerators.map((item) => (
                <ACCard key={item.id || item._id} ac={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Snowflake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No Refrigerators available at the moment</p>
            </div>
          )}
        </div>
      </section> */}

      {/* Featured Washing Machines */}
      {/* <section className="py-4 sm:py-6 md:py-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 md:mb-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text-dark mb-2">Featured Washing Machines</h2>
              <p className="text-xs sm:text-sm md:text-base text-text-light">Clean clothes effortlessly with our washing machine rentals</p>
            </div>
            <Link
              to="/browse?category=Washing Machine"
              className="mt-4 sm:mt-0 text-primary-blue hover:text-primary-blue-light flex items-center space-x-2 font-semibold group transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          {loadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
            </div>
          ) : featuredWashingMachines.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {featuredWashingMachines.map((item) => (
                <ACCard key={item.id || item._id} ac={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No Washing Machines available at the moment</p>
            </div>
          )}
        </div>
      </section> */}


      {/* <InstallCard /> */}







      {/* Testimonials */}
      <section className="py-4 sm:py-6 md:py-8 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-3 sm:mb-4">What Our Customers Say</h2>
            <p className="text-sm sm:text-base md:text-lg text-text-light max-w-2xl mx-auto px-4">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-text-light mb-4 sm:mb-6 italic text-sm sm:text-base leading-relaxed">"{testimonial.text}"</p>
                <div className="border-t border-gray-100 pt-3 sm:pt-4">
                  <p className="font-semibold text-text-dark text-base sm:text-lg">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-text-light">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coupon Modal */}
      <CouponModal isOpen={showCouponModal} onClose={handleCloseCouponModal} />
    </div>
  );
};

export default Home;

