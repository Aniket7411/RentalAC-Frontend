import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, Tag, X, Calendar, Percent, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    type: 'percentage', // 'percentage' or 'fixed'
    value: 0,
    minAmount: 0,
    maxDiscount: null,
    validFrom: '',
    validUntil: '',
    usageLimit: null,
    userLimit: null,
    applicableCategories: [],
    applicableDurations: [],
    isActive: true,
  });
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  const categories = ['AC', 'Refrigerator', 'Washing Machine'];
  const durations = [3, 6, 9, 11, 12, 24];

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getAdminCoupons();
      if (response.success) {
        setCoupons(response.data || []);
      } else {
        showError('Failed to load coupons');
      }
    } catch (error) {
      showError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleAdd = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      type: 'percentage',
      value: 0,
      minAmount: 0,
      maxDiscount: null,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      usageLimit: null,
      userLimit: null,
      applicableCategories: [],
      applicableDurations: [],
      isActive: true,
    });
    setSelectedCoupon(null);
    setShowAddModal(true);
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      type: coupon.type || 'percentage',
      value: coupon.value || 0,
      minAmount: coupon.minAmount || 0,
      maxDiscount: coupon.maxDiscount || null,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || null,
      userLimit: coupon.userLimit || null,
      applicableCategories: coupon.applicableCategories || [],
      applicableDurations: coupon.applicableDurations || [],
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const response = await apiService.deleteCoupon(id);
      if (response.success) {
        showSuccess('Coupon deleted successfully');
        loadCoupons();
      } else {
        showError(response.message || 'Failed to delete coupon');
      }
    } catch (error) {
      showError('Failed to delete coupon');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const response = await apiService.updateCoupon(coupon._id || coupon.id, {
        isActive: !coupon.isActive,
      });
      if (response.success) {
        showSuccess(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'} successfully`);
        loadCoupons();
      } else {
        showError(response.message || 'Failed to update coupon');
      }
    } catch (error) {
      showError('Failed to update coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.title.trim()) {
      showError('Please fill in code and title');
      return;
    }

    if (!formData.validFrom || !formData.validUntil) {
      showError('Please select valid from and until dates');
      return;
    }

    if (new Date(formData.validFrom) > new Date(formData.validUntil)) {
      showError('Valid until date must be after valid from date');
      return;
    }

    if (showAddModal) {
      try {
        const response = await apiService.createCoupon(formData);
        if (response.success) {
          showSuccess('Coupon added successfully');
          setShowAddModal(false);
          loadCoupons();
        } else {
          showError(response.message || 'Failed to add coupon');
        }
      } catch (error) {
        showError('Failed to add coupon');
      }
    } else if (showEditModal && selectedCoupon) {
      try {
        const response = await apiService.updateCoupon(selectedCoupon._id || selectedCoupon.id, formData);
        if (response.success) {
          showSuccess('Coupon updated successfully');
          setShowEditModal(false);
          loadCoupons();
        } else {
          showError(response.message || 'Failed to update coupon');
        }
      } catch (error) {
        showError('Failed to update coupon');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? null : Number(value)) : value),
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter(c => c !== category)
        : [...prev.applicableCategories, category],
    }));
  };

  const handleDurationToggle = (duration) => {
    setFormData(prev => ({
      ...prev,
      applicableDurations: prev.applicableDurations.includes(duration)
        ? prev.applicableDurations.filter(d => d !== duration)
        : [...prev.applicableDurations, duration],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Coupons</h1>
            <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Coupon
          </button>
        </div>

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No coupons found</p>
            <button
              onClick={handleAdd}
              className="mt-4 px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors font-semibold"
            >
              Create Your First Coupon
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <motion.div
                key={coupon._id || coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{coupon.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="font-mono font-bold text-lg text-primary-blue">{coupon.code}</p>
                      <p className="text-sm text-gray-600">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {coupon.minAmount > 0 && (
                    <p>Min. Order: ₹{coupon.minAmount.toLocaleString()}</p>
                  )}
                  {coupon.validUntil && (
                    <p className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Valid until: {new Date(coupon.validUntil).toLocaleDateString()}
                    </p>
                  )}
                  {coupon.usageLimit && (
                    <p>Usage: {coupon.usageCount || 0} / {coupon.usageLimit}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-semibold ${
                      coupon.isActive
                        ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id || coupon.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">
                  {showAddModal ? 'Add New Coupon' : 'Edit Coupon'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                      placeholder="WELCOME10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                      placeholder="Welcome Offer"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                    placeholder="Get 10% off on your first order"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {formData.type === 'percentage' ? (
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      )}
                      <input
                        type="number"
                        name="value"
                        value={formData.value}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                        placeholder={formData.type === 'percentage' ? '10' : '500'}
                        min="0"
                        step={formData.type === 'percentage' ? '1' : '1'}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Amount
                    </label>
                    <input
                      type="number"
                      name="minAmount"
                      value={formData.minAmount || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  {formData.type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Discount (Optional)
                      </label>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                        placeholder="No limit"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid Until <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Limit (Optional)
                    </label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                      placeholder="No limit"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per User Limit (Optional)
                    </label>
                    <input
                      type="number"
                      name="userLimit"
                      value={formData.userLimit || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                      placeholder="No limit"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable Categories (Optional - Leave empty for all)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          formData.applicableCategories.includes(category)
                            ? 'bg-primary-blue text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable Durations (Optional - Leave empty for all)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {durations.map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => handleDurationToggle(duration)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          formData.applicableDurations.includes(duration)
                            ? 'bg-primary-blue text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {duration}M
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active (Coupon will be available for use)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors font-semibold"
                  >
                    {showAddModal ? 'Create Coupon' : 'Update Coupon'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCoupons;

