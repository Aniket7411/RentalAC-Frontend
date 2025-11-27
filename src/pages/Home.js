import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Snowflake, Wrench, Clock, Loader2, Shield, Zap, Users } from 'lucide-react';
import { apiService } from '../services/api';
import ACCard from '../components/ACCard';
import ServiceCard from '../components/ServiceCard';
import ServiceBookingModal from '../components/ServiceBookingModal';
import SingleScreen from './SingleScreen/SingleScreen';
import InstallCard from '../components/installcard';

const Home = () => {
  const [featuredACs, setFeaturedACs] = useState([]);
  const [featuredRefrigerators, setFeaturedRefrigerators] = useState([]);
  const [featuredWashingMachines, setFeaturedWashingMachines] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

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


  const handleServiceAdd = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      const response = await apiService.createServiceBooking(bookingData);
      if (response.success) {
        setShowBookingModal(false);
        setSelectedService(null);
        // Show success message or navigate
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Banner Section - SingleScreen */}
      <div className="w-full" style={{ minHeight: '100vh' }}>
        <SingleScreen />
      </div>

      {/* Product Category Selection Section */}
      <section className="py-6 md:py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            <Link
              to="/browse?category=AC"
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 relative">
                <img
                  src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80"
                  alt="Air Conditioners"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Air Conditioners</h3>
                  <p className="text-white/90 text-sm md:text-base">Stay cool & comfortable</p>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white mt-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              to="/browse?category=Refrigerator"
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-video bg-gradient-to-br from-cyan-50 to-cyan-100 relative">
                <img
                  src="https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=80"
                  alt="Refrigerators"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Refrigerators</h3>
                  <p className="text-white/90 text-sm md:text-base">Fresh storage solutions</p>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white mt-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Washing Machines</h3>
                  <p className="text-white/90 text-sm md:text-base">Clean clothes effortlessly</p>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white mt-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured ACs */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">Featured Air Conditioners</h2>
              <p className="text-sm sm:text-base text-text-light">Discover our premium collection of air conditioners</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
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
      </section>

      {/* Featured Refrigerators */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">Featured Refrigerators</h2>
              <p className="text-sm sm:text-base text-text-light">Cool your home with our premium refrigerator collection</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
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
      </section>

      {/* Featured Washing Machines */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">Featured Washing Machines</h2>
              <p className="text-sm sm:text-base text-text-light">Clean clothes effortlessly with our washing machine rentals</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
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
      </section>


      <InstallCard />





      {/* Services Section */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">AC Repair & Maintenance Services</h2>
              <p className="text-text-light">Professional AC services at your doorstep</p>
            </div>
            <Link
              to="/service-request"
              className="mt-4 sm:mt-0 text-primary-blue hover:text-primary-blue-light flex items-center space-x-2 font-semibold group transition-all"
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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

      {/* Features Section */}
      <section className="py-6 md:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">Why Choose Us?</h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Experience premium AC rental and service solutions tailored to your needs
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: Shield,
                title: 'Trusted & Reliable',
                description: 'Verified vendors and certified technicians for your peace of mind',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: Zap,
                title: 'Quick Service',
                description: 'Fast installation and repair services at your convenience',
                color: 'from-yellow-500 to-orange-500',
              },
              {
                icon: Users,
                title: '24/7 Support',
                description: 'Round-the-clock customer support whenever you need us',
                color: 'from-green-500 to-emerald-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-dark mb-2">{feature.title}</h3>
                <p className="text-text-light">{feature.description}</p>
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
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* Testimonials */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">What Our Customers Say</h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
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
                className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-text-light mb-6 italic text-base leading-relaxed">"{testimonial.text}"</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-text-dark text-lg">{testimonial.name}</p>
                  <p className="text-sm text-text-light">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

