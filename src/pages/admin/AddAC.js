import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import uploadFileToCloudinary, { uploadMultipleFilesToCloudinary } from '../../utils/cloudinary';
import { Upload, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';

const AddAC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: 'AC',
    name: '',
    brand: '',
    model: '',
    capacity: '',
    type: '',
    condition: 'New', // Separate condition field (Refurbished/New)
    description: '',
    location: '',
    price: {
      3: '',
      6: '',
      9: '',
      11: '',
    },
    discount: 0,
    status: 'Available',
    heroImage: null, // Hero/primary image
    heroImageUrl: '', // Uploaded hero image URL
    images: [], // Other images
    uploadedImageUrls: [], // Uploaded other images URLs
    // Category-specific fields
    energyRating: '', // For Refrigerator
    operationType: '', // For Washing Machine
    loadType: '', // For Washing Machine
    features: {
      specs: [],
      dimensions: '',
      safety: [],
    },
  });
  const [heroImagePreview, setHeroImagePreview] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [specInput, setSpecInput] = useState('');
  const [safetyInput, setSafetyInput] = useState('');
  const { toasts, removeToast, success: showSuccess, error: showError } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('price.')) {
      const priceKey = name.split('.')[1];
      setFormData({
        ...formData,
        price: {
          ...formData.price,
          [priceKey]: value,
        },
      });
    } else if (name === 'category') {
      // Reset category-specific fields when category changes
      setFormData({
        ...formData,
        category: value,
        capacity: '',
        type: '',
        condition: 'New',
        energyRating: '',
        operationType: '',
        loadType: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError('');
  };

  // Handle hero image change with auto-upload
  const handleHeroImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setHeroImagePreview(URL.createObjectURL(file));
    setUploadingHeroImage(true);
    setError('');

    try {
      const imageUrl = await uploadFileToCloudinary(file);
      if (imageUrl) {
        setFormData({
          ...formData,
          heroImage: file,
          heroImageUrl: imageUrl,
        });
        showSuccess('Hero image uploaded successfully!');
      } else {
        setError('Failed to upload hero image. Please try again.');
      }
    } catch (err) {
      setError('Failed to upload hero image. Please try again.');
      showError('Failed to upload hero image');
    } finally {
      setUploadingHeroImage(false);
    }
  };

  // Handle additional images change with auto-upload
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.uploadedImageUrls.length > 5) {
      setError('Maximum 5 additional images allowed');
      return;
    }

    setUploadingImages(true);
    setError('');

    try {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);

      // Auto-upload each image
      const uploadPromises = files.map(file => uploadFileToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      const successfulUrls = uploadedUrls.filter(url => url !== null);

      if (successfulUrls.length > 0) {
        setFormData({
          ...formData,
          images: [...formData.images, ...files],
          uploadedImageUrls: [...formData.uploadedImageUrls, ...successfulUrls],
        });
        showSuccess(`${successfulUrls.length} image(s) uploaded successfully!`);
      } else {
        setError('Failed to upload images. Please try again.');
      }
    } catch (err) {
      setError('Failed to upload images. Please try again.');
      showError('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeHeroImage = () => {
    setHeroImagePreview('');
    setFormData({
      ...formData,
      heroImage: null,
      heroImageUrl: '',
    });
  };

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = formData.images.filter((_, i) => i !== index);
    const newUploadedUrls = formData.uploadedImageUrls.filter((_, i) => i !== index);

    setImagePreviews(newPreviews);
    setFormData({
      ...formData,
      images: newImages,
      uploadedImageUrls: newUploadedUrls,
    });
  };

  // Handle features specs
  const addSpec = () => {
    const val = specInput.trim();
    if (!val) return;
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        specs: [...formData.features.specs, val],
      },
    });
    setSpecInput('');
  };

  const removeSpec = (index) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        specs: formData.features.specs.filter((_, i) => i !== index),
      },
    });
  };

  // Handle safety features
  const addSafety = () => {
    const val = safetyInput.trim();
    if (!val) return;
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        safety: [...formData.features.safety, val],
      },
    });
    setSafetyInput('');
  };

  const removeSafety = (index) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        safety: formData.features.safety.filter((_, i) => i !== index),
      },
    });
  };

  // Handle dimensions
  const handleDimensionsChange = (e) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        dimensions: e.target.value,
      },
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.name || !formData.brand || !formData.capacity || !formData.location) {
      setError('Please fill all required fields');
      return;
    }

    if (!formData.price[3] || !formData.price[6] || !formData.price[9] || !formData.price[11]) {
      setError('Please fill all rental tenure price fields');
      return;
    }

    if (!formData.heroImageUrl) {
      setError('Please upload a hero image');
      return;
    }

    setLoading(true);

    try {
      // Combine hero image with other images (hero image first)
      const allImages = [formData.heroImageUrl, ...formData.uploadedImageUrls].filter(Boolean);
      
      const productData = {
        category: formData.category,
        name: formData.name,
        brand: formData.brand,
        model: formData.model || '',
        capacity: formData.capacity,
        type: formData.type,
        condition: formData.condition || 'New',
        description: formData.description,
        location: formData.location,
        status: formData.status,
        discount: parseFloat(formData.discount) || 0,
        price: {
          3: parseFloat(formData.price[3]),
          6: parseFloat(formData.price[6]),
          9: parseFloat(formData.price[9]),
          11: parseFloat(formData.price[11]),
        },
        images: allImages,
        features: formData.features,
      };

      // Add category-specific fields
      if (formData.category === 'Refrigerator' && formData.energyRating) {
        productData.energyRating = formData.energyRating;
      }
      if (formData.category === 'Washing Machine') {
        if (formData.operationType) productData.operationType = formData.operationType;
        if (formData.loadType) productData.loadType = formData.loadType;
      }

      const response = await apiService.addProduct(productData);

      if (response.success) {
        showSuccess(`${formData.category} added successfully!`);
        setTimeout(() => {
          navigate('/admin/manage-products');
        }, 1500);
      } else {
        showError(response.message || `Failed to add ${formData.category}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCapacities = () => {
    if (formData.category === 'AC') {
      return ['1 Ton', '1.5 Ton', '2 Ton', '2.5 Ton'];
    } else if (formData.category === 'Refrigerator') {
      return ['190 L', '210 L', '240 L', '280 L', '300 L+'];
    } else if (formData.category === 'Washing Machine') {
      return ['5.8 kg', '6.5 kg', '7 kg', '8 kg', '10 kg+'];
    }
    return [];
  };

  const getTypes = () => {
    if (formData.category === 'AC') {
      return ['Split', 'Window'];
    } else if (formData.category === 'Refrigerator') {
      return ['Single Door', 'Double Door'];
    } else if (formData.category === 'Washing Machine') {
      return ['Top Load', 'Front Load'];
    }
    return [];
  };

  const brands = ['LG', 'Samsung', 'Daikin', 'Voltas', 'Hitachi', 'Blue Star', 'Carrier', 'Haier', 'Whirlpool', 'Other'];
  const statuses = ['Available', 'Rented Out', 'Under Maintenance'];
  const energyRatings = ['2 Star', '3 Star', '4 Star', '5 Star'];
  const containerClasses = 'w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10';

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className={containerClasses}>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">New Listing</p>
        <h1 className="text-3xl font-bold text-text-dark mb-2 mt-2">Add New Product</h1>
        <p className="text-text-light mb-8">Fill in the details to list your product for rental</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6">
              <CheckCircle className="w-5 h-5" />
              <span>AC added successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection - Visual Tabs */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-3">
                Select Product Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const event = { target: { name: 'category', value: 'AC' } };
                    handleChange(event);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    formData.category === 'AC'
                      ? 'border-primary-blue bg-blue-50 shadow-lg shadow-primary-blue/20'
                      : 'border-gray-200 bg-white hover:border-primary-blue/50 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-4xl mb-2 ${formData.category === 'AC' ? 'text-primary-blue' : 'text-gray-400'}`}>❄️</div>
                    <div className={`font-semibold text-lg ${formData.category === 'AC' ? 'text-primary-blue' : 'text-text-dark'}`}>
                      Air Conditioner
                    </div>
                    <div className="text-xs text-text-light mt-1">Cool & Comfort</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const event = { target: { name: 'category', value: 'Refrigerator' } };
                    handleChange(event);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    formData.category === 'Refrigerator'
                      ? 'border-primary-blue bg-blue-50 shadow-lg shadow-primary-blue/20'
                      : 'border-gray-200 bg-white hover:border-primary-blue/50 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-4xl mb-2 ${formData.category === 'Refrigerator' ? 'text-primary-blue' : 'text-gray-400'}`}>🧊</div>
                    <div className={`font-semibold text-lg ${formData.category === 'Refrigerator' ? 'text-primary-blue' : 'text-text-dark'}`}>
                      Refrigerator
                    </div>
                    <div className="text-xs text-text-light mt-1">Fresh Storage</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const event = { target: { name: 'category', value: 'Washing Machine' } };
                    handleChange(event);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    formData.category === 'Washing Machine'
                      ? 'border-primary-blue bg-blue-50 shadow-lg shadow-primary-blue/20'
                      : 'border-gray-200 bg-white hover:border-primary-blue/50 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-4xl mb-2 ${formData.category === 'Washing Machine' ? 'text-primary-blue' : 'text-gray-400'}`}>🌀</div>
                    <div className={`font-semibold text-lg ${formData.category === 'Washing Machine' ? 'text-primary-blue' : 'text-text-dark'}`}>
                      Washing Machine
                    </div>
                    <div className="text-xs text-text-light mt-1">Clean & Fresh</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={formData.category === 'AC' ? 'e.g., 1 Ton 3 Star Convertible Inverter Split AC' : formData.category === 'Refrigerator' ? 'e.g., Single Door Fridge (190 Litre)' : 'e.g., Fully Automatic Top Load Washing Machine'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Model (Optional)
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Model number or variant"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {formData.category === 'AC' ? 'Cooling Capacity' : formData.category === 'Refrigerator' ? 'Capacity (Litre)' : 'Load Capacity'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Select Capacity</option>
                  {getCapacities().map((cap) => (
                    <option key={cap} value={cap}>
                      {cap}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  {formData.category === 'AC' ? 'AC Type' : formData.category === 'Refrigerator' ? 'Refrigerator Type' : 'Load Type'} <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Select Type</option>
                  {getTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition Field */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const event = { target: { name: 'condition', value: 'New' } };
                    handleChange(event);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.condition === 'New'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-text-dark hover:border-green-300'
                  }`}
                >
                  <div className="font-semibold">✨ New</div>
                  <div className="text-xs text-text-light mt-1">Brand new product</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const event = { target: { name: 'condition', value: 'Refurbished' } };
                    handleChange(event);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.condition === 'Refurbished'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-text-dark hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold">♻️ Refurbished</div>
                  <div className="text-xs text-text-light mt-1">Restored to like-new</div>
                </button>
              </div>
            </div>

            {/* Category-specific fields */}
            {formData.category === 'Refrigerator' && (
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Energy Rating
                </label>
                <select
                  name="energyRating"
                  value={formData.energyRating}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Select Energy Rating</option>
                  {energyRatings.map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.category === 'Washing Machine' && (
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Operation Type
                </label>
                <select
                  name="operationType"
                  value={formData.operationType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="">Select Operation Type</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Semi-Automatic">Semi-Automatic</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Mumbai, Maharashtra"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the AC features, condition, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Rental Prices (₹) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-text-light mb-1">3 Months</label>
                  <input
                    type="number"
                    name="price.3"
                    value={formData.price[3]}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-light mb-1">6 Months</label>
                  <input
                    type="number"
                    name="price.6"
                    value={formData.price[6]}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-light mb-1">9 Months</label>
                  <input
                    type="number"
                    name="price.9"
                    value={formData.price[9]}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-light mb-1">11 Months</label>
                  <input
                    type="number"
                    name="price.11"
                    value={formData.price[11]}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="e.g., 5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>

            {/* Features & Specs Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Features & Specifications</h3>
              
              {/* Features & Specs */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Features & Specs
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={specInput}
                      onChange={(e) => setSpecInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSpec();
                        }
                      }}
                      placeholder={formData.category === 'AC' ? 'e.g., Capacity/Size: 1T' : formData.category === 'Refrigerator' ? 'e.g., Capacity/Size: 181-200L' : 'e.g., Capacity/Size: 5.8 to 6.5 kg'}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                    <button
                      type="button"
                      onClick={addSpec}
                      className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                    >
                      Add
                    </button>
                  </div>
                  {formData.features.specs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.features.specs.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm"
                        >
                          {spec}
                          <button
                            type="button"
                            onClick={() => removeSpec(index)}
                            className="hover:text-red-600 transition"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={formData.features.dimensions}
                  onChange={handleDimensionsChange}
                  placeholder={formData.category === 'AC' ? 'e.g., 950"L x 290"B x 375"H' : formData.category === 'Refrigerator' ? 'e.g., 25"L x 21"B x 49"H' : 'e.g., 950"L x 290"B x 375"H'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              {/* Safety & Usage */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Safety & Usage
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={safetyInput}
                      onChange={(e) => setSafetyInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSafety();
                        }
                      }}
                      placeholder={formData.category === 'AC' ? 'e.g., Period Maintenance' : formData.category === 'Refrigerator' ? 'e.g., Defrost at regular interval' : 'e.g., Do not overload the washing machine'}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                    <button
                      type="button"
                      onClick={addSafety}
                      className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition"
                    >
                      Add
                    </button>
                  </div>
                  {formData.features.safety.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.features.safety.map((safety, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm"
                        >
                          {safety}
                          <button
                            type="button"
                            onClick={() => removeSafety(index)}
                            className="hover:text-red-600 transition"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Hero Image Upload */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Hero Image (Primary Product Image) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageChange}
                  className="hidden"
                  id="hero-image-upload"
                  disabled={uploadingHeroImage}
                />
                <label
                  htmlFor="hero-image-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center ${uploadingHeroImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {heroImagePreview || formData.heroImageUrl ? (
                    <div className="relative w-full max-w-md">
                      <img
                        src={heroImagePreview || formData.heroImageUrl}
                        alt="Hero preview"
                        className="w-full h-64 object-cover rounded-lg border-2 border-primary-blue"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removeHeroImage();
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                        title="Remove hero image"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      {formData.heroImageUrl && (
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                          ✓ Uploaded
                        </div>
                      )}
                      {uploadingHeroImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <Loader2 className="w-8 h-8 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-text-light mb-2" />
                      <p className="text-text-light">Click to upload hero image</p>
                      <p className="text-xs text-text-light mt-1">This will be the main product image</p>
                      {uploadingHeroImage && (
                        <div className="mt-2 flex items-center space-x-2 text-primary-blue">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Additional Images Upload */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Additional Images (Up to 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={formData.uploadedImageUrls.length >= 5 || uploadingImages}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center ${formData.uploadedImageUrls.length >= 5 || uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-12 h-12 text-text-light mb-2" />
                  <p className="text-text-light">Click to select additional images</p>
                  <p className="text-sm text-text-light mt-1">
                    {formData.uploadedImageUrls.length}/5 images uploaded
                    {uploadingImages && ' (Uploading...)'}
                  </p>
                  {uploadingImages && (
                    <div className="mt-2 flex items-center space-x-2 text-primary-blue">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Uploading images...</span>
                    </div>
                  )}
                </label>
              </div>

              {formData.uploadedImageUrls.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                  {formData.uploadedImageUrls.map((url, index) => (
                    <div key={`uploaded-${index}`} className="relative">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ✓
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingHeroImage || uploadingImages || !formData.heroImageUrl}
                className="flex-1 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-light transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding {formData.category}...</span>
                  </span>
                ) : (
                  `Add ${formData.category} Listing`
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddAC;

