import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Users, ShoppingBag, Phone, Mail, MapPin, Calendar, AlertCircle, Loader2, Eye, Search, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const { toasts, removeToast, success, error: showError } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiService.getAllUsers();
            if (response.success) {
                setUsers(response.data || []);
            } else {
                setError(response.message || 'Failed to load users');
                showError(response.message || 'Failed to load users');
            }
        } catch (err) {
            const errorMsg = 'An error occurred while loading users';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const loadUserOrders = async (userId) => {
        setLoadingOrders(true);
        try {
            const response = await apiService.getUserOrdersByAdmin(userId);
            if (response.success) {
                setUserOrders(response.data || []);
            } else {
                showError(response.message || 'Failed to load user orders');
                setUserOrders([]);
            }
        } catch (err) {
            showError('An error occurred while loading user orders');
            setUserOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleViewUserDetails = (user) => {
        setSelectedUser(user);
        loadUserOrders(user._id || user.id);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setUserOrders([]);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status) => {
        const statusLower = (status || '').toLowerCase();
        switch (statusLower) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getFilteredUsers = () => {
        if (!searchTerm) return users;

        const term = searchTerm.toLowerCase();
        return users.filter(user => {
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const phone = (user.phone || '').toLowerCase();
            return name.includes(term) || email.includes(term) || phone.includes(term);
        });
    };

    const downloadAsCsv = (rows, sheetName) => {
        if (!rows.length) return;

        const headers = Object.keys(rows[0]);
        const escape = (value) =>
            `"${String(value ?? '')
                .replace(/"/g, '""')
                .replace(/\n/g, ' ')
                .trim()}"`;

        const csvLines = [
            headers.join(','),
            ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
        ];

        const blob = new Blob([csvLines.join('\n')], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${sheetName}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToExcel = () => {
        const filteredUsers = getFilteredUsers();

        const data = filteredUsers.map((user, idx) => ({
            SNo: idx + 1,
            UserID: user._id || user.id || 'N/A',
            Name: user.name || 'N/A',
            Email: user.email || 'N/A',
            Phone: user.phone || 'N/A',
            TotalOrders: user.orderStats?.totalOrders || 0,
            CompletedOrders: user.orderStats?.completedOrders || 0,
            PendingOrders: user.orderStats?.pendingOrders || 0,
            TotalSpent: user.orderStats?.totalSpent || 0,
            MemberSince: formatDate(user.createdAt || user.memberSince),
        }));

        if (!data.length) {
            showError('No users to export.');
            return;
        }

        downloadAsCsv(data, 'Users');
        success('Users exported successfully');
    };

    const containerClasses = 'w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-blue mx-auto mb-4" />
                    <p className="text-text-light">Loading users...</p>
                </div>
            </div>
        );
    }

    const filteredUsers = getFilteredUsers();
    const stats = {
        total: users.length,
        withOrders: users.filter(u => (u.orderStats?.totalOrders || 0) > 0).length,
        withoutOrders: users.filter(u => (u.orderStats?.totalOrders || 0) === 0).length,
        totalOrders: users.reduce((sum, u) => sum + (u.orderStats?.totalOrders || 0), 0),
        totalRevenue: users.reduce((sum, u) => sum + (u.orderStats?.totalSpent || 0), 0),
    };

    return (
        <div className="min-h-screen bg-slate-50 py-4 md:py-6">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className={containerClasses}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">User Management</p>
                        <h1 className="text-3xl font-bold text-text-dark mt-2">All Users</h1>
                        <p className="text-text-light mt-1">View user details and their order history.</p>
                    </div>
                    <button
                        onClick={exportToExcel}
                        className="inline-flex items-center w-auto bg-emerald-500 text-white justify-center px-4 py-2 text-sm font-medium rounded-2xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Excel
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                        <p className="text-xs text-text-light">Total Users</p>
                        <p className="text-2xl font-bold text-text-dark mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                        <p className="text-xs text-text-light">Users with Orders</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{stats.withOrders}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                        <p className="text-xs text-text-light">Users without Orders</p>
                        <p className="text-2xl font-bold text-gray-600 mt-1">{stats.withoutOrders}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                        <p className="text-xs text-text-light">Total Orders</p>
                        <p className="text-2xl font-bold text-primary-blue mt-1">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                        <p className="text-xs text-text-light">Total Revenue</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Users List */}
                {filteredUsers.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-md border border-dashed border-slate-200 text-center">
                        <Users className="w-16 h-16 text-text-light mx-auto mb-4" />
                        <p className="text-text-light text-lg">No users found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredUsers.map((user) => {
                            const userId = user._id || user.id;
                            const orderStats = user.orderStats || {};

                            return (
                                <motion.div
                                    key={userId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                        <div className="flex-1">
                                            {/* User Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-text-dark mb-1">
                                                        {user.name || 'N/A'}
                                                    </h3>
                                                    <p className="text-text-light text-sm">
                                                        Member since: {formatDate(user.createdAt || user.memberSince)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary-blue text-white">
                                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* User Contact Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                                                <div>
                                                    <div className="flex items-center space-x-2 text-text-light mb-2">
                                                        <Mail className="w-4 h-4" />
                                                        <a href={`mailto:${user.email}`} className="text-sm hover:text-primary-blue">
                                                            {user.email || 'N/A'}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-text-light">
                                                        <Phone className="w-4 h-4" />
                                                        <a href={`tel:${user.phone}`} className="text-sm hover:text-primary-blue">
                                                            {user.phone || 'N/A'}
                                                        </a>
                                                    </div>
                                                </div>
                                                {user.address && (
                                                    <div>
                                                        <div className="flex items-start space-x-2 text-text-light">
                                                            <MapPin className="w-4 h-4 mt-1" />
                                                            <p className="text-sm">
                                                                {typeof user.address === 'string'
                                                                    ? user.address
                                                                    : user.address.homeAddress || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Statistics */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-primary-blue/5 to-purple-500/5 rounded-lg">
                                                <div className="text-center">
                                                    <p className="text-xs text-text-light">Total Orders</p>
                                                    <p className="text-2xl font-bold text-text-dark mt-1">
                                                        {orderStats.totalOrders || 0}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-text-light">Completed</p>
                                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                                        {orderStats.completedOrders || 0}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-text-light">Pending</p>
                                                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                                                        {orderStats.pendingOrders || 0}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-text-light">Total Spent</p>
                                                    <p className="text-2xl font-bold text-purple-600 mt-1">
                                                        ₹{(orderStats.totalSpent || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Panel */}
                                        <div className="flex flex-col space-y-2 lg:w-64">
                                            <button
                                                onClick={() => handleViewUserDetails(user)}
                                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View Details</span>
                                            </button>
                                            <a
                                                href={`tel:${user.phone}`}
                                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                            >
                                                <Phone className="w-4 h-4" />
                                                <span>Call User</span>
                                            </a>
                                            <a
                                                href={`mailto:${user.email}`}
                                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                            >
                                                <Mail className="w-4 h-4" />
                                                <span>Send Email</span>
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-text-dark">
                                User Details: {selectedUser.name || 'N/A'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-text-light hover:text-text-dark transition"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* User Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-text-dark mb-4">User Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-text-light mb-1">Name</p>
                                        <p className="text-sm font-medium text-text-dark">{selectedUser.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-text-light mb-1">Email</p>
                                        <p className="text-sm font-medium text-text-dark">{selectedUser.email || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-text-light mb-1">Phone</p>
                                        <p className="text-sm font-medium text-text-dark">{selectedUser.phone || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-text-light mb-1">Member Since</p>
                                        <p className="text-sm font-medium text-text-dark">
                                            {formatDate(selectedUser.createdAt || selectedUser.memberSince)}
                                        </p>
                                    </div>
                                    {selectedUser.address && (
                                        <div className="p-4 bg-slate-50 rounded-lg md:col-span-2">
                                            <p className="text-xs text-text-light mb-1">Address</p>
                                            <p className="text-sm font-medium text-text-dark">
                                                {typeof selectedUser.address === 'string'
                                                    ? selectedUser.address
                                                    : selectedUser.address.homeAddress || 'N/A'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order History */}
                            <div>
                                <h3 className="text-lg font-semibold text-text-dark mb-4">
                                    Order History ({userOrders.length})
                                </h3>
                                {loadingOrders ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
                                    </div>
                                ) : userOrders.length === 0 ? (
                                    <div className="bg-slate-50 p-8 rounded-lg text-center">
                                        <ShoppingBag className="w-12 h-12 text-text-light mx-auto mb-2" />
                                        <p className="text-text-light">No orders found for this user.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userOrders.map((order) => {
                                            const orderId = order._id || order.id;
                                            return (
                                                <div
                                                    key={orderId}
                                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="font-semibold text-text-dark">
                                                                Order #{order.orderId || orderId}
                                                            </p>
                                                            <p className="text-xs text-text-light">
                                                                {formatDate(order.createdAt || order.orderDate)}
                                                            </p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                            {order.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-text-light">Items: {order.items?.length || 0}</p>
                                                            <p className="text-text-light">Payment: {order.paymentStatus || 'N/A'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-text-light">Total Amount</p>
                                                            <p className="text-lg font-bold text-primary-blue">
                                                                ₹{(order.finalTotal || order.total || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/admin/orders/${orderId}`}
                                                        className="mt-3 inline-flex items-center text-sm text-primary-blue hover:underline"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View Order Details
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;

