import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Loader2, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import ServiceCard from '../../components/ServiceCard';
import ServiceBookingModal from '../../components/ServiceBookingModal';
import ServiceDetailsModal from '../../components/ServiceDetailsModal';

const ServiceRequest = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    const response = await apiService.getServices();
    if (response.success) {
      setServices(response.data || []);
    } else {
      showError('Failed to load services');
    }
    setLoading(false);
  };

  const handleAddClick = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      const response = await apiService.createServiceBooking(bookingData);
      if (response.success) {
        showSuccess('Service booking submitted successfully!');
        setShowBookingModal(false);
        setSelectedService(null);
        // Optionally reload services or navigate
      } else {
        showError(response.message || 'Failed to submit booking');
        throw new Error(response.message);
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          {/* <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-full mb-4"
          >
            <Wrench className="w-8 h-8 text-white" />
          </motion.div> */}
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">AC Repair & Maintenance Services</h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
            Choose from our premium service packages. Book your preferred service and get professional AC repair and maintenance.
          </p>
        </div>

        {/* Video section for small/medium screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12 lg:hidden"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-sky-500 to-sky-600">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_40%),radial-gradient(circle_at_80%_0,rgba(255,255,255,0.35),transparent_35%)]" />
            <video
              src="/ac.mov"
              className="w-full h-[280px] sm:h-[360px] md:h-[420px] object-cover "
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center px-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow">Get visit within 1 hour</h3>
                <p className="mt-2 text-base sm:text-lg text-white">Certified technicians at your doorstep</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Video for large screens */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-sky-500 to-sky-600">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_40%),radial-gradient(circle_at_80%_0,rgba(255,255,255,0.35),transparent_35%)]" />
              <video
                src="/ac.mov"
                className="w-full h-[520px] object-cover "
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center px-6">
                  <h3 className="text-3xl font-extrabold text-white drop-shadow">Get visit within 1 hour</h3>
                  <p className="mt-2 text-white">Certified technicians at your doorstep</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services list */}
          <div className="lg:col-span-7">
            {services.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 md:gap-8 mb-12">
                {services.map((service, index) => (
                  <motion.div
                    key={service._id || service.id}
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
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No services available at the moment</p>
                <p className="text-slate-500 mt-2">Please check back later</p>
              </div>
            )}
          </div>
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
            onSubmit={handleBookingSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceRequest;
