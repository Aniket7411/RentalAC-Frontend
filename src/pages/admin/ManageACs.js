import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Edit, Eye, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const ManageACs = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'AC', 'Refrigerator', 'Washing Machine'
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getAdminProducts();
      if (response.success) {
        setProducts(response.data || []);
      } else {
        setError(response.message || 'Failed to load products');
      }
    } catch (err) {
      setError('An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    if (categoryFilter === 'all') return products;
    return products.filter(p => p.category === categoryFilter);
  };

  const handleStatusChange = async (productId, newStatus) => {
    const product = products.find(p => (p._id || p.id) === productId);
    if (!product) return;

    setUpdatingStatus(productId);
    try {
      const response = await apiService.updateProduct(productId, {
        status: newStatus,
      });
      if (response.success) {
        success('Status updated successfully');
        loadProducts();
      } else {
        showError(response.message || 'Failed to update status');
      }
    } catch (err) {
      showError('An error occurred while updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEdit = (product) => {
    const productId = product._id || product.id;
    setEditingProduct(productId);
    setEditForm({
      name: product.name,
      brand: product.brand,
      model: product.model,
      capacity: product.capacity,
      type: product.type,
      location: product.location,
      description: product.description,
      status: product.status,
      price: {
        3: product.price?.[3],
        6: product.price?.[6],
        9: product.price?.[9],
        11: product.price?.[11],
        monthly: product.price?.monthly,
      },
    });
  };

  const handleSaveEdit = async (productId) => {
    const product = products.find(p => (p._id || p.id) === productId);
    if (!product) return;

    setUpdatingStatus(productId);
    try {
      const response = await apiService.updateProduct(productId, {
        ...editForm,
        images: product.images || [],
      });
      if (response.success) {
        success('Product updated successfully');
        setEditingProduct(null);
        loadProducts();
      } else {
        showError(response.message || 'Failed to update product');
      }
    } catch (err) {
      showError('An error occurred while updating product');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product listing? This action cannot be undone.')) {
      return;
    }

    setDeletingProduct(productId);
    try {
      const response = await apiService.deleteProduct(productId);
      if (response.success) {
        success('Product deleted successfully');
        loadProducts();
      } else {
        showError(response.message || 'Failed to delete product');
      }
    } catch (err) {
      showError('An error occurred while deleting product');
    } finally {
      setDeletingProduct(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Rented Out':
        return 'bg-red-100 text-red-800';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const containerClasses = 'w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className={containerClasses}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Inventory</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">Manage Products</h1>
            <p className="text-slate-500 mt-1">
              Edit listings, control availability, and act faster with a wider canvas.
            </p>
          </div>
          <Link
            to="/admin/add-product"
            className="inline-flex items-center justify-center gap-2 bg-primary-blue text-white px-6 py-3 rounded-2xl shadow-lg shadow-primary-blue/30 hover:bg-primary-blue-light transition"
          >
            Add New Product
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${categoryFilter === 'all'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setCategoryFilter('AC')}
              className={`px-4 py-2 rounded-lg transition ${categoryFilter === 'AC'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                }`}
            >
              AC ({products.filter(p => p.category === 'AC').length})
            </button>
            <button
              onClick={() => setCategoryFilter('Refrigerator')}
              className={`px-4 py-2 rounded-lg transition ${categoryFilter === 'Refrigerator'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                }`}
            >
              Refrigerator ({products.filter(p => p.category === 'Refrigerator').length})
            </button>
            <button
              onClick={() => setCategoryFilter('Washing Machine')}
              className={`px-4 py-2 rounded-lg transition ${categoryFilter === 'Washing Machine'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                }`}
            >
              Washing Machine ({products.filter(p => p.category === 'Washing Machine').length})
            </button>
          </div>
        </div>

        {getFilteredProducts().length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-md text-center border border-dashed border-slate-200">
            <p className="text-text-light text-lg mb-4">
              {categoryFilter === 'all' ? 'No products listed yet.' : `No ${categoryFilter} products found.`}
            </p>
            <Link
              to="/admin/add-product"
              className="text-primary-blue hover:text-primary-blue-light"
            >
              Add your first product listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {getFilteredProducts().map((product) => {
              const productId = product._id || product.id;
              return (
                <motion.div
                  key={productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100"
                >
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name || `${product.brand} ${product.model}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Product+Image';
                      }}
                    />
                  )}

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-semibold text-primary-blue bg-blue-50 px-2 py-1 rounded mb-1 inline-block">
                          {product.category}
                        </span>
                        <h3 className="font-semibold text-lg text-text-dark mt-1">
                          {product.name || `${product.brand} ${product.model}`}
                        </h3>
                        <p className="text-sm text-text-light">{product.capacity} • {product.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </div>

                    <p className="text-sm text-text-light mb-2">{product.location}</p>
                    <p className="text-lg font-bold text-primary-blue mb-4">
                      ₹{product.price?.monthly?.toLocaleString()}/month
                    </p>

                    {editingProduct === productId ? (
                      <div className="space-y-3 border-t pt-4">
                        <div>
                          <label className="block text-xs text-text-dark mb-1">Status</label>
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Available">Available</option>
                            <option value="Rented Out">Rented Out</option>
                            <option value="Under Maintenance">Under Maintenance</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(productId)}
                            className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingProduct(null)}
                            className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/edit-product/${productId}`}
                            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-blue text-white rounded hover:bg-primary-blue-light transition text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </Link>
                          <Link
                            to={`/ac/${productId}`}
                            className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(productId)}
                            disabled={deletingProduct === productId}
                            className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingProduct === productId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <select
                          value={product.status}
                          onChange={(e) => handleStatusChange(productId, e.target.value)}
                          disabled={updatingStatus === productId}
                          className={`w-full px-2 py-2 rounded text-xs font-semibold border-0 ${getStatusColor(product.status)} disabled:opacity-50`}
                        >
                          <option value="Available">Available</option>
                          <option value="Rented Out">Rented Out</option>
                          <option value="Under Maintenance">Under Maintenance</option>
                        </select>
                        {updatingStatus === productId && (
                          <div className="flex items-center justify-center space-x-1 text-xs text-text-light">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Updating...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageACs;

