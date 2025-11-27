import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import ACCard from '../components/ACCard';
import LeadCaptureModal from '../components/LeadCaptureModal';
import { Search, Filter, X, AlertCircle, Loader2, Snowflake, Package, Droplets, ArrowUpDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const BrowseACs = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category');
  const categoriesParam = searchParams.get('categories');

  // Initialize selected categories from URL or default to all
  const getInitialCategories = () => {
    if (categoriesParam) {
      return categoriesParam.split(',').filter(c => ['AC', 'Refrigerator', 'Washing Machine'].includes(c));
    }
    if (categoryParam && ['AC', 'Refrigerator', 'Washing Machine'].includes(categoryParam)) {
      return [categoryParam];
    }
    return ['AC', 'Refrigerator', 'Washing Machine']; // Show all by default
  };

  const [acs, setAcs] = useState([]);
  const [filteredACs, setFilteredACs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(getInitialCategories());
  const [filters, setFilters] = useState({
    search: '',
    capacity: '',
    type: '',
    location: '',
    duration: 'monthly',
    condition: '',
    priceSort: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const modalTimerRef = useRef(null);

  useEffect(() => {
    // Update categories from URL
    const categories = getInitialCategories();
    setSelectedCategories(categories);
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
  }, [searchParams]);

  useEffect(() => {
    // Update URL when categories change
    if (selectedCategories.length > 0) {
      const params = new URLSearchParams();
      if (selectedCategories.length === 1) {
        params.set('category', selectedCategories[0]);
      } else {
        params.set('categories', selectedCategories.join(','));
      }
      navigate(`/browse?${params.toString()}`, { replace: true });
    }
  }, [selectedCategories]);

  useEffect(() => {
    // Debounce search - wait 500ms after user stops typing
    const debounceTimer = setTimeout(() => {
      loadACs();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters.search, filters.capacity, filters.type, filters.location, filters.duration, selectedCategories.join(',')]);

  const loadACs = async () => {
    setLoading(true);
    setError('');

    try {
      // Load products for all selected categories
      const allProducts = [];

      for (const category of selectedCategories) {
        const queryParams = {
          category: category,
        };

        if (filters.search) {
          queryParams.search = filters.search;
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

        const response = await apiService.getACs(queryParams);

        if (response?.success) {
          const products = Array.isArray(response.data) ? response.data : (Array.isArray(response.data?.data) ? response.data.data : []);
          allProducts.push(...(products || []));
        }
      }

      // Remove duplicates based on product ID
      const uniqueProducts = allProducts.filter((product, index, self) =>
        index === self.findIndex(p => (p?._id || p?.id) === (product?._id || product?.id))
      );

      setAcs(uniqueProducts);
      setFilteredACs(uniqueProducts);

      if (selectedCategories.length === 0) {
        setAcs([]);
        setFilteredACs([]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(`An error occurred while loading products. Please try again.`);
      setAcs([]);
      setFilteredACs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (products = acs) => {
    let filtered = [...products];

    // Apply condition filter
    if (filters.condition) {
      filtered = filtered.filter(product => product?.condition === filters.condition);
    }

    // Apply price sorting
    if (filters.priceSort === 'low-to-high') {
      filtered.sort((a, b) => {
        const priceA = a?.price?.monthly || a?.price || 0;
        const priceB = b?.price?.monthly || b?.price || 0;
        return priceA - priceB;
      });
    } else if (filters.priceSort === 'high-to-low') {
      filtered.sort((a, b) => {
        const priceA = a?.price?.monthly || a?.price || 0;
        const priceB = b?.price?.monthly || b?.price || 0;
        return priceB - priceA;
      });
    }

    setFilteredACs(filtered);
  };

  useEffect(() => {
    if (acs.length > 0 || filters.condition || filters.priceSort) {
      applyFilters(acs);
    }
  }, [filters.condition, filters.priceSort, acs.length]);

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        const newCats = prev.filter(c => c !== category);
        // Ensure at least one category is selected
        return newCats.length > 0 ? newCats : prev;
      } else {
        return [...prev, category];
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      capacity: '',
      type: '',
      location: '',
      duration: 'monthly',
      condition: '',
      priceSort: '',
    });
  };

  const getCapacities = () => {
    // Return all unique capacities across selected categories
    const allCapacities = new Set();
    if (selectedCategories.includes('AC')) {
      ['1 Ton', '1.5 Ton', '2 Ton', '2.5 Ton'].forEach(c => allCapacities.add(c));
    }
    if (selectedCategories.includes('Refrigerator')) {
      ['190 L', '210 L', '240 L', '280 L', '300 L+'].forEach(c => allCapacities.add(c));
    }
    if (selectedCategories.includes('Washing Machine')) {
      ['5.8 kg', '6.5 kg', '7 kg', '8 kg', '10 kg+'].forEach(c => allCapacities.add(c));
    }
    return Array.from(allCapacities);
  };

  const getTypes = () => {
    // Return all unique types across selected categories
    const allTypes = new Set();
    if (selectedCategories.includes('AC')) {
      ['Split', 'Window'].forEach(t => allTypes.add(t));
    }
    if (selectedCategories.includes('Refrigerator')) {
      ['Single Door', 'Double Door'].forEach(t => allTypes.add(t));
    }
    if (selectedCategories.includes('Washing Machine')) {
      ['Automatic', 'Semi-Automatic', 'Top Load', 'Front Load'].forEach(t => allTypes.add(t));
    }
    return Array.from(allTypes);
  };

  const categoryInfo = {
    'AC': { icon: Snowflake, label: 'Air Conditioners', color: 'from-blue-400 to-purple-500' },
    'Refrigerator': { icon: Package, label: 'Refrigerators', color: 'from-cyan-400 to-purple-500' },
    'Washing Machine': { icon: Droplets, label: 'Washing Machines', color: 'from-purple-400 to-pink-500' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/30 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="flex gap-4 lg:gap-6 items-start">
          {/* Filter Sidebar - Sticky Left */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100/50 sticky top-20 overflow-y-auto w-72 p-4" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
              {/* Filter Header */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-purple-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-600" />
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-xs text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4 py-2">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide">
                    Product Category
                  </label>
                  <div className="space-y-2">
                    {['AC', 'Refrigerator', 'Washing Machine'].map((category) => {
                      const info = categoryInfo[category];
                      const Icon = info.icon;
                      const isSelected = selectedCategories.includes(category);

                      return (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`
                            w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                            text-xs font-medium transition-all duration-200
                            ${isSelected
                              ? `bg-gradient-to-r ${info.color} text-white shadow-md`
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                            <span>{info.label}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                    Condition
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleFilterChange('condition', '')}
                      className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all text-center ${!filters.condition
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleFilterChange('condition', filters.condition === 'New' ? '' : 'New')}
                      className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.condition === 'New'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => handleFilterChange('condition', filters.condition === 'Refurbished' ? '' : 'Refurbished')}
                      className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.condition === 'Refurbished'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      Used
                    </button>
                  </div>
                </div>

                {/* Rental Duration */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                    Rental Duration
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['3', '6', '9', '11'].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => handleFilterChange('duration', filters.duration === dur ? 'monthly' : dur)}
                        className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.duration === dur
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {dur}M
                      </button>
                    ))}
                    <button
                      onClick={() => handleFilterChange('duration', filters.duration === 'monthly' ? '3' : 'monthly')}
                      className={`col-span-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.duration === 'monthly'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Capacity */}
                {getCapacities().length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                      Capacity
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleFilterChange('capacity', '')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${!filters.capacity
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        All
                      </button>
                      {getCapacities().map((cap) => (
                        <button
                          key={cap}
                          onClick={() => handleFilterChange('capacity', filters.capacity === cap ? '' : cap)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${filters.capacity === cap
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                          {cap}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Type */}
                {getTypes().length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                      Type
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleFilterChange('type', '')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${!filters.type
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        All
                      </button>
                      {getTypes().map((type) => (
                        <button
                          key={type}
                          onClick={() => handleFilterChange('type', filters.type === type ? '' : type)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${filters.type === type
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City/Area"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 text-xs bg-white/80"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area - Takes remaining space */}
          <main className="flex-1 min-w-0">
            <div className="py-6">
              {/* Page Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
                  Browse Products
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Discover amazing appliances for your home
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2 shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Search and Sort Bar */}
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by brand, model, location..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-sm"
                  />
                </div>

                {/* Price Sort Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange('priceSort', filters.priceSort === 'low-to-high' ? '' : 'low-to-high')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md ${filters.priceSort === 'low-to-high'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Low to High</span>
                    <span className="sm:hidden">↑↓</span>
                  </button>
                  <button
                    onClick={() => handleFilterChange('priceSort', filters.priceSort === 'high-to-low' ? '' : 'high-to-low')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md ${filters.priceSort === 'high-to-low'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <ArrowUpDown className="w-4 h-4 rotate-180" />
                    <span className="hidden sm:inline">High to Low</span>
                    <span className="sm:hidden">↓↑</span>
                  </button>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`md:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md ${showFilters
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                    : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                </div>
              ) : (filters.condition || filters.priceSort ? filteredACs.length > 0 : acs.length > 0) ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                  {(filters.condition || filters.priceSort ? filteredACs : acs).map((ac, index) => (
                    <motion.div
                      key={ac?._id || ac?.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ACCard ac={ac} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-lg text-center border border-purple-100"
                >
                  <p className="text-gray-600 text-lg mb-4">No products found matching your criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-purple-100">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-600" />
                Filters
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-purple-600 hover:text-purple-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Same filter content as desktop - can be extracted to a component */}
            <div className="space-y-4 py-2">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide">
                  Product Category
                </label>
                <div className="space-y-2">
                  {['AC', 'Refrigerator', 'Washing Machine'].map((category) => {
                    const info = categoryInfo[category];
                    const Icon = info.icon;
                    const isSelected = selectedCategories.includes(category);

                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                          text-xs font-medium transition-all duration-200
                          ${isSelected
                            ? `bg-gradient-to-r ${info.color} text-white shadow-md`
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                          <span>{info.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Condition Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                  Condition
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleFilterChange('condition', '')}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all text-center ${!filters.condition
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange('condition', filters.condition === 'New' ? '' : 'New')}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.condition === 'New'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => handleFilterChange('condition', filters.condition === 'Refurbished' ? '' : 'Refurbished')}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.condition === 'Refurbished'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    Used
                  </button>
                </div>
              </div>

              {/* Rental Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                  Rental Duration
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['3', '6', '9', '11'].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => handleFilterChange('duration', filters.duration === dur ? 'monthly' : dur)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.duration === dur
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      {dur}M
                    </button>
                  ))}
                  <button
                    onClick={() => handleFilterChange('duration', filters.duration === 'monthly' ? '3' : 'monthly')}
                    className={`col-span-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.duration === 'monthly'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Capacity */}
              {getCapacities().length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                    Capacity
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleFilterChange('capacity', '')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${!filters.capacity
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      All
                    </button>
                    {getCapacities().map((cap) => (
                      <button
                        key={cap}
                        onClick={() => handleFilterChange('capacity', filters.capacity === cap ? '' : cap)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${filters.capacity === cap
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Type */}
              {getTypes().length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleFilterChange('type', '')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${!filters.type
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      All
                    </button>
                    {getTypes().map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange('type', filters.type === type ? '' : type)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${filters.type === type
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City/Area"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 text-xs bg-white/80"
                />
              </div>
            </div>
          </div>
        </div>
      )}

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