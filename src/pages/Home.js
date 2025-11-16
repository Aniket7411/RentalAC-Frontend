import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Snowflake, Wrench, Clock, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import ACCard from '../components/ACCard';
import ServiceCard from '../components/ServiceCard';
import ServiceBookingModal from '../components/ServiceBookingModal';
import SingleScreen from './SingleScreen/SingleScreen';

const Home = () => {
  const [featuredACs, setFeaturedACs] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [acsResponse, servicesResponse] = await Promise.all([
        apiService.getACs(),
        apiService.getServices(),
      ]);

      if (acsResponse.success) {
        setFeaturedACs(acsResponse.data.slice(0, 6));
      }

      if (servicesResponse.success) {
        setServices(servicesResponse.data.slice(0, 3) || []);
      }
      setLoadingServices(false);
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
    <div className="min-h-screen">
      {/* Banner Section - SingleScreen */}
      <div className="w-full" style={{ minHeight: '100vh' }}>
        <SingleScreen />
      </div>

      {/* How It Works - Rental */}
      {/* <section className="py-16 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-text-dark mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-text-dark mb-2">{step.title}</h3>
                <p className="text-text-light">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Featured ACs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-text-dark">Featured ACs</h2>
            <Link
              to="/browse"
              className="text-primary-blue hover:text-primary-blue-light flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredACs.map((ac) => (
              <ACCard key={ac.id} ac={ac} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-text-dark mb-2">AC Repair & Maintenance Services</h2>
              <p className="text-text-light">Professional AC services at your doorstep</p>
            </div>
            <Link
              to="/service-request"
              className="text-primary-blue hover:text-primary-blue-light flex items-center space-x-1"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-text-dark mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-text-light mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-text-dark">{testimonial.name}</p>
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

