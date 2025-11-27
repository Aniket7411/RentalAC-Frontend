import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { ShoppingBag, Users, Plus, List, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuth();
        const [stats, setStats] = useState({
        totalACs: 0, // Total products
        rentedACs: 0, // Rented products
        availableACs: 0, // Available products
        newLeads: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        setError('');

        try {
            const [acsRes, serviceRes, rentalRes] = await Promise.all([
                apiService.getAdminACs(),
                apiService.getServiceLeads(),
                apiService.getRentalInquiries(),
            ]);

            if (acsRes.success) {
                const products = acsRes.data || [];
                setStats({
                    totalACs: products.length,
                    rentedACs: products.filter(p => p.status === 'Rented Out').length,
                    availableACs: products.filter(p => p.status === 'Available').length,
                    newLeads: 0,
                });
            } else {
                setError(acsRes.message || 'Failed to load products');
            }

            if (serviceRes.success && rentalRes.success) {
                const thisWeek = new Date();
                thisWeek.setDate(thisWeek.getDate() - 7);
                const serviceLeads = serviceRes.data || [];
                const rentalInquiries = rentalRes.data || [];
                
                const newServiceLeads = serviceLeads.filter(lead => {
                    const leadDate = new Date(lead.createdAt);
                    return leadDate >= thisWeek && lead.status === 'New';
                });
                
                const newRentalInquiries = rentalInquiries.filter(inquiry => {
                    const inquiryDate = new Date(inquiry.createdAt);
                    return inquiryDate >= thisWeek && inquiry.status === 'Pending';
                });
                
                setStats(prev => ({ 
                    ...prev, 
                    newLeads: newServiceLeads.length + newRentalInquiries.length 
                }));
            }
        } catch (err) {
            setError('An error occurred while loading data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
        );
    }

    const containerClasses = 'w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24';

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className={`${containerClasses}`}>
                <div className="mb-10 rounded-3xl bg-gradient-to-r from-primary-blue/90 to-purple-600 text-white px-8 py-8 shadow-xl">
                    <p className="uppercase text-xs tracking-[0.4em] opacity-80">Control Center</p>
                    <h1 className="text-3xl sm:text-4xl font-semibold mt-3">
                        Welcome back, {user?.name || 'Admin'}
                    </h1>
                    <p className="mt-2 text-white/80 text-base max-w-3xl">
                        Stay on top of rentals, services, and leads with richly detailed insights and
                        quick actions tailored for your workflow.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-light text-sm">Total Products</p>
                                <p className="text-3xl font-bold text-text-dark mt-2">{stats.totalACs}</p>
                            </div>
                            <ShoppingBag className="w-12 h-12 text-primary-blue" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-light text-sm">Currently Rented</p>
                                <p className="text-3xl font-bold text-text-dark mt-2">{stats.rentedACs}</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-green-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-light text-sm">Available</p>
                                <p className="text-3xl font-bold text-text-dark mt-2">{stats.availableACs}</p>
                            </div>
                            <ShoppingBag className="w-12 h-12 text-blue-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-light text-sm">New Leads (This Week)</p>
                                <p className="text-3xl font-bold text-text-dark mt-2">{stats.newLeads}</p>
                            </div>
                            <Users className="w-12 h-12 text-yellow-500" />
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-10">
                    <h2 className="text-xl font-semibold text-text-dark mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            to="/admin/add-product"
                            className="flex items-center space-x-3 p-5 border-2 border-dashed border-primary-blue rounded-2xl hover:bg-primary-blue hover:text-white transition group"
                        >
                            <Plus className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Add New Product</p>
                                <p className="text-sm text-text-light group-hover:text-white">List AC, Refrigerator or Washing Machine</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/manage-products"
                            className="flex items-center space-x-3 p-5 border-2 border-dashed border-primary-blue rounded-2xl hover:bg-primary-blue hover:text-white transition group"
                        >
                            <List className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">Manage Products</p>
                                <p className="text-sm text-text-light group-hover:text-white">View and edit all product listings</p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/leads"
                            className="flex items-center space-x-3 p-5 border-2 border-dashed border-primary-blue rounded-2xl hover:bg-primary-blue hover:text-white transition group"
                        >
                            <Users className="w-6 h-6 text-primary-blue group-hover:text-white" />
                            <div>
                                <p className="font-semibold">View All Leads</p>
                                <p className="text-sm text-text-light group-hover:text-white">Manage service requests</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

