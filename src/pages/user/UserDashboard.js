import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/dummyData';
import { ShoppingBag, Wrench, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [rentalsRes, servicesRes] = await Promise.all([
      apiService.getUserRentals(user?.id),
      apiService.getUserServiceRequests(user?.id),
    ]);
    
    if (rentalsRes.success) setRentals(rentalsRes.data);
    if (servicesRes.success) setServiceRequests(servicesRes.data);
    
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const activeRentals = rentals.filter(r => r.status === 'Active').length;
  const pendingServices = serviceRequests.filter(s => s.status === 'Pending').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-text-light mb-8">Here's an overview of your activities</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Active Rentals</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{activeRentals}</p>
              </div>
              <ShoppingBag className="w-12 h-12 text-primary-blue" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Pending Services</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{pendingServices}</p>
              </div>
              <Wrench className="w-12 h-12 text-primary-blue" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-light text-sm">Total Requests</p>
                <p className="text-3xl font-bold text-text-dark mt-2">
                  {rentals.length + serviceRequests.length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-primary-blue" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/browse"
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
            >
              Browse ACs
            </Link>
            <Link
              to="/user/service-request"
              className="px-6 py-2 bg-primary-blue-light text-white rounded-lg hover:bg-primary-blue transition"
            >
              Request Service
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rentals */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Rental History</h2>
            {rentals.length > 0 ? (
              <div className="space-y-4">
                {rentals.map((rental) => (
                  <div key={rental.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-text-dark">
                          {rental.acDetails?.brand} {rental.acDetails?.model}
                        </p>
                        <p className="text-sm text-text-light">{rental.vendorName}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(rental.status)}`}>
                        {rental.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-light">
                      Started: {rental.startDate} • Duration: {rental.duration}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-light">No rentals yet. <Link to="/browse" className="text-primary-blue">Browse ACs</Link></p>
            )}
          </div>

          {/* Service Requests */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Service Requests</h2>
            {serviceRequests.length > 0 ? (
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-text-dark">
                          {request.brand} {request.model}
                        </p>
                        <p className="text-sm text-text-light">{request.acType}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-light line-clamp-2">{request.description}</p>
                    <p className="text-xs text-text-light mt-1">Created: {request.createdAt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-light">
                No service requests yet. <Link to="/user/service-request" className="text-primary-blue">Request Service</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

