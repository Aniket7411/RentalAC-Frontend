import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import { Plus, Edit2, Trash2, Loader2, MessageSquare, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const ManageFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general', // general, rental, service, payment
  });
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'rental', label: 'Rental' },
    { value: 'service', label: 'Service' },
    { value: 'payment', label: 'Payment' },
  ];

  const loadFAQs = useCallback(async () => {
    setLoading(true);
    const response = await apiService.getFAQs();
    if (response.success) {
      setFaqs(response.data || []);
    } else {
      showError('Failed to load FAQs');
    }
    setLoading(false);
  }, [showError]);

  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  const handleAdd = () => {
    setFormData({ question: '', answer: '', category: 'general' });
    setSelectedFaq(null);
    setShowAddModal(true);
  };

  const handleEdit = (faq) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'general',
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    const response = await apiService.deleteFAQ(id);
    if (response.success) {
      showSuccess('FAQ deleted successfully');
      loadFAQs();
    } else {
      showError(response.message || 'Failed to delete FAQ');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      showError('Please fill in both question and answer');
      return;
    }

    if (showAddModal) {
      const response = await apiService.createFAQ(formData);
      if (response.success) {
        showSuccess('FAQ added successfully');
        setShowAddModal(false);
        loadFAQs();
      } else {
        showError(response.message || 'Failed to add FAQ');
      }
    } else if (showEditModal && selectedFaq) {
      const response = await apiService.updateFAQ(selectedFaq._id || selectedFaq.id, formData);
      if (response.success) {
        showSuccess('FAQ updated successfully');
        setShowEditModal(false);
        loadFAQs();
      } else {
        showError(response.message || 'Failed to update FAQ');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary-blue" />
              Manage FAQs
            </h1>
            <p className="text-gray-600 mt-2">Add and manage frequently asked questions</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add FAQ
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No FAQs yet</h2>
            <p className="text-gray-600 mb-6">Start by adding your first FAQ</p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-all font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add FAQ
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Answer</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faqs.map((faq, index) => (
                    <motion.tr
                      key={faq._id || faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {faq.question}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          faq.category === 'rental' ? 'bg-blue-100 text-blue-800' :
                          faq.category === 'service' ? 'bg-green-100 text-green-800' :
                          faq.category === 'payment' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {categories.find(c => c.value === faq.category)?.label || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate">
                          {faq.answer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(faq)}
                            className="text-primary-blue hover:text-primary-blue-light transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            title="Edit FAQ"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(faq._id || faq.id)}
                            className="text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Add FAQ</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    placeholder="Enter the question"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Answer <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    placeholder="Enter the answer"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue resize-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors font-semibold"
                  >
                    Add FAQ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Edit FAQ</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    placeholder="Enter the question"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Answer <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    placeholder="Enter the answer"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue resize-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition-colors font-semibold"
                  >
                    Update FAQ
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

export default ManageFAQs;

