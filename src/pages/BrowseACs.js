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
  const typeParam = searchParams.get('type');

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

  // Initialize type filter from URL
  const getInitialType = () => {
    if (typeParam) {
      // Handle comma-separated types or single type
      return typeParam.split(',').filter(t => t.trim());
    }
    return [];
  };

  const [acs, setAcs] = useState([]);
  const [filteredACs, setFilteredACs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(getInitialCategories());
  const [filters, setFilters] = useState({
    search: '',
    capacity: [], // Changed to array for multiple selections
    type: getInitialType(), // Initialize from URL
    location: '',
    duration: '3',
    condition: [], // Changed to array for multiple selections
    priceSort: 'low-to-high',
  });
  const [showFilters, setShowFilters] = useState(false);
  const modalTimerRef = useRef(null);

  useEffect(() => {
    // Update categories from URL
    const categories = getInitialCategories();
    setSelectedCategories(categories);
    
    // Update type filter from URL
    const types = getInitialType();
    setFilters(prev => ({
      ...prev,
      type: types,
    }));

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
    // Update URL when categories change, but preserve type parameter from URL if it exists
    if (selectedCategories.length > 0) {
      const params = new URLSearchParams();
      if (selectedCategories.length === 1) {
        params.set('category', selectedCategories[0]);
      } else {
        params.set('categories', selectedCategories.join(','));
      }
      // Preserve type parameter from URL if it exists
      const currentTypeParam = searchParams.get('type');
      if (currentTypeParam) {
        params.set('type', currentTypeParam);
      }
      const newUrl = `/browse?${params.toString()}`;
      const currentUrl = window.location.pathname + window.location.search;
      // Only navigate if URL actually changed to avoid unnecessary updates
      if (newUrl !== currentUrl) {
        navigate(newUrl, { replace: true });
      }
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
        if (filters.capacity.length > 0) {
          queryParams.capacity = filters.capacity.join(',');
        }
        if (filters.type.length > 0) {
          queryParams.type = filters.type.join(',');
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

    // Apply condition filter (multiple selections)
    if (filters.condition.length > 0) {
      filtered = filtered.filter(product => filters.condition.includes(product?.condition));
    }

    // Apply capacity filter (multiple selections)
    if (filters.capacity.length > 0) {
      filtered = filtered.filter(product => filters.capacity.includes(product?.capacity));
    }

    // Apply type filter (multiple selections)
    if (filters.type.length > 0) {
      filtered = filtered.filter(product => filters.type.includes(product?.type));
    }

    // Apply price sorting
    if (filters.priceSort === 'low-to-high') {
      filtered.sort((a, b) => {
        const duration = filters.duration || '3';
        const priceA = a?.price?.[duration] || a?.price?.[3] || a?.price || 0;
        const priceB = b?.price?.[duration] || b?.price?.[3] || b?.price || 0;
        return priceA - priceB;
      });
    } else if (filters.priceSort === 'high-to-low') {
      filtered.sort((a, b) => {
        const duration = filters.duration || '3';
        const priceA = a?.price?.[duration] || a?.price?.[3] || a?.price || 0;
        const priceB = b?.price?.[duration] || b?.price?.[3] || b?.price || 0;
        return priceB - priceA;
      });
    }

    setFilteredACs(filtered);
  };

  useEffect(() => {
    if (acs.length > 0 || filters.condition.length > 0 || filters.capacity.length > 0 || filters.type.length > 0 || filters.priceSort) {
      applyFilters(acs);
    } else {
      setFilteredACs(acs);
    }
  }, [filters.condition, filters.capacity, filters.type, filters.priceSort, acs]);

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Toggle array-based filters (capacity, type, condition)
  const toggleArrayFilter = (filterName, value) => {
    setFilters(prev => {
      const currentArray = prev[filterName] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [filterName]: newArray,
      };
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
      capacity: [],
      type: [],
      location: '',
      duration: '3',
      condition: [],
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
    'AC': { icon: Snowflake, label: 'Air Conditioners', color: 'from-blue-400 to-blue-500' },
    'Refrigerator': { icon: Package, label: 'Refrigerators', color: 'from-cyan-400 to-blue-500' },
    'Washing Machine': { icon: Droplets, label: 'Washing Machines', color: 'from-blue-400 to-blue-500' },
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50/50 min-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content */}
        <div className="flex gap-6 lg:gap-8 items-start">
          {/* Filter Sidebar - Fixed Left */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 fixed top-24 overflow-y-auto w-80 p-5 z-10" style={{ maxHeight: 'calc(100vh - 6rem)', bottom: 0 }}>
              {/* Filter Header */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10 -mt-1 pt-1">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary-blue" />
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-blue hover:text-primary-blue-light font-semibold transition-colors hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-5 py-2">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">
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

                {/* Condition Filter - Multiple Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Condition
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['New', 'Refurbished'].map((cond) => {
                      const isSelected = filters.condition.includes(cond);
                      return (
                        <button
                          key={cond}
                          onClick={() => toggleArrayFilter('condition', cond)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${isSelected
                            ? cond === 'New'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                              : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rental Duration */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Rental Duration
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['3', '6', '9', '11', '12', '24'].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => handleFilterChange('duration', filters.duration === dur ? '3' : dur)}
                        className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.duration === dur
                          ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {dur}M
                      </button>
                    ))}
                    <button
                      onClick={() => handleFilterChange('duration', filters.duration === '3' ? '6' : '3')}
                      className={`col-span-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.duration === '3'
                        ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      3 Months
                    </button>
                  </div>
                </div>

                {/* Capacity - Multiple Selection */}
                {getCapacities().length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">
                      Capacity
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getCapacities().map((cap) => {
                        const isSelected = filters.capacity.includes(cap);
                        return (
                          <button
                            key={cap}
                            onClick={() => toggleArrayFilter('capacity', cap)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${isSelected
                              ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                          >
                            {cap}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Type - Multiple Selection */}
                {getTypes().length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">
                      Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {getTypes().map((type) => {
                        const isSelected = filters.type.includes(type);
                        return (
                          <button
                            key={type}
                            onClick={() => toggleArrayFilter('type', type)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${isSelected
                              ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City/Area"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue text-sm bg-white shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area - Takes remaining space */}
          <main className="flex-1 min-w-0 lg:ml-0">
            <div className="flex flex-col">
              {/* Page Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 lg:mb-6 flex-shrink-0"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold bg-gradient-to-r from-primary-blue via-blue-600 to-primary-blue-light bg-clip-text text-transparent mb-1 lg:mb-2">
                  Browse Products
                </h1>
                <p className="text-gray-600 text-sm md:text-base lg:text-base">
                  Discover amazing appliances for your home
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center space-x-2 shadow-sm flex-shrink-0"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Search and Sort Bar */}
              <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by brand, model, location..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue shadow-sm hover:shadow-md transition-all bg-white"
                  />
                </div>

                {/* Price Sort Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange('priceSort', filters.priceSort === 'low-to-high' ? '' : 'low-to-high')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md ${filters.priceSort === 'low-to-high'
                      ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white'
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
                      ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white'
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
                    ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white'
                    : 'bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Mobile Category Buttons - Visible only on small screens, below search bar */}
              <div className="md:hidden mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                  {['AC', 'Refrigerator', 'Washing Machine'].map((category) => {
                    const info = categoryInfo[category];
                    const Icon = info.icon;
                    const isSelected = selectedCategories.includes(category);

                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`
                          flex items-center gap-2 px-4 py-2.5 rounded-xl
                          text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0
                          ${isSelected
                            ? `bg-gradient-to-r ${info.color} text-white shadow-md`
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-sm'
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        <span>{category}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-blue" />
                  </div>
                ) : (filters.condition.length > 0 || filters.capacity.length > 0 || filters.type.length > 0 || filters.priceSort ? filteredACs.length > 0 : acs.length > 0) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 pb-8">
                    {(filters.condition.length > 0 || filters.capacity.length > 0 || filters.type.length > 0 || filters.priceSort ? filteredACs : acs).map((ac, index) => (
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
                    className="bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-lg text-center border border-blue-100"
                  >
                    <p className="text-gray-600 text-lg mb-4">No products found matching your criteria.</p>
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-blue-light text-white rounded-xl hover:from-primary-blue-light hover:to-primary-blue transition-all font-semibold shadow-md hover:shadow-lg"
                    >
                      Clear filters
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-blue-100">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-blue" />
                Filters
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-primary-blue hover:text-primary-blue-light"
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
              {/* Condition Filter - Multiple Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                  Condition
                </label>
                <div className="flex flex-wrap gap-2">
                  {['New', 'Refurbished'].map((cond) => {
                    const isSelected = filters.condition.includes(cond);
                    return (
                      <button
                        key={cond}
                        onClick={() => toggleArrayFilter('condition', cond)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${isSelected
                          ? cond === 'New'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                            : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rental Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                  Rental Duration
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['3', '6', '9', '11', '12', '24'].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => handleFilterChange('duration', filters.duration === dur ? '3' : dur)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-all text-center ${filters.duration === dur
                        ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      {dur}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacity - Multiple Selection */}
              {getCapacities().length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                    Capacity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getCapacities().map((cap) => {
                      const isSelected = filters.capacity.includes(cap);
                      return (
                        <button
                          key={cap}
                          onClick={() => toggleArrayFilter('capacity', cap)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${isSelected
                            ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                          {cap}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Type - Multiple Selection */}
              {getTypes().length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2.5 uppercase tracking-wide">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getTypes().map((type) => {
                      const isSelected = filters.type.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => toggleArrayFilter('type', type)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-center whitespace-nowrap ${isSelected
                            ? 'bg-gradient-to-r from-primary-blue to-primary-blue-light text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                          {type}
                        </button>
                      );
                    })}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue text-xs bg-white/80"
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