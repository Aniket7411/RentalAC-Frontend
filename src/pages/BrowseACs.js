import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import ACCard from '../components/ACCard';
import LeadCaptureModal from '../components/LeadCaptureModal';
import { Search, Filter, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BrowseACs = () => {
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    capacity: '',
    type: '',
    location: '',
    duration: 'monthly',
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const modalTimerRef = useRef(null);

  useEffect(() => {
    loadACs();

    // Show modal after 2 minutes (120000 ms) of being on the page
    modalTimerRef.current = setTimeout(() => {
      setShowModal(true);
    }, 120000); // 2 minutes

    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Debounce search - wait 500ms after user stops typing
    const debounceTimer = setTimeout(() => {
      loadACs();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  const loadACs = async () => {
    setLoading(true);
    setError('');

    try {
      // Build query params
      const queryParams = {};

      if (filters.search) {
        queryParams.search = filters.search;
      }
      if (filters.brand) {
        queryParams.brand = filters.brand;
      }
      if (filters.capacity) {
        queryParams.capacity = filters.capacity;
      }
      if (filters.type) {
        queryParams.type = filters.type;
      }
      if (filters.location) {
        queryParams.location = filters.location;
      }
      if (filters.duration) {
        queryParams.duration = filters.duration;
      }
      if (filters.minPrice) {
        queryParams.minPrice = filters.minPrice;
      }
      if (filters.maxPrice) {
        queryParams.maxPrice = filters.maxPrice;
      }

      const response = await apiService.getACs(queryParams);

      if (response.success) {
        setAcs(response.data || []);
      } else {
        setError(response.message || 'Failed to load ACs');
        setAcs([]);
      }
    } catch (err) {
      setError('An error occurred while loading ACs. Please try again.');
      setAcs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      capacity: '',
      type: '',
      location: '',
      duration: 'monthly',
      minPrice: '',
      maxPrice: '',
    });
  };

  const capacities = ['1 Ton', '1.5 Ton', '2 Ton', '2.5 Ton'];
  const types = ['Split', 'Window'];
  const brands = ['LG', 'Samsung', 'Daikin', 'Voltas', 'Hitachi', 'Blue Star', 'Carrier', 'Other'];

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-dark mb-6">Browse ACs</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Search and Filter Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
            <input
              type="text"
              placeholder="Search by brand, model, location, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text-dark">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-blue hover:text-primary-blue-light"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Rental Duration
                  </label>
                  <select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Cooling Capacity
                  </label>
                  <select
                    value={filters.capacity}
                    onChange={(e) => handleFilterChange('capacity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="">All</option>
                    {capacities.map((cap) => (
                      <option key={cap} value={cap}>
                        {cap}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    AC Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="">All</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Brand
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="">All</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Price Range (₹)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AC Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
              </div>
            ) : acs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {acs.map((ac) => (
                  <ACCard key={ac._id || ac.id} ac={ac} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <p className="text-text-light text-lg mb-4">No ACs found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="text-primary-blue hover:text-primary-blue-light"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      {showModal && (
        <LeadCaptureModal
          onClose={() => setShowModal(false)}
          source="browse"
        />
      )}
    </div>
  );
};

export default BrowseACs;
