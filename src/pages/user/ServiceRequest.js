import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Loader2, Wrench, Clock, Shield, Users, Zap } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-2 sm:mb-3">
            AC Repair & Maintenance Services
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Professional AC services with certified technicians. Book now and get service within 1 hour.
          </p>
        </motion.div>

        {/* Quick Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
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

        {/* Services Grid */}
        {services.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900">
                Available Services ({services.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
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
