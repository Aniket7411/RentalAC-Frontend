import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { instantPaymentDiscount } = useSettings();
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    // Always load cart from localStorage on mount
    // Don't clear it based on auth state - let ProtectedRoute handle auth
    loadCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []); // Only run once on mount

  // Reload cart when user becomes authenticated (in case cart was cleared)
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated]);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      // Filter out invalid items (must have at least an id)
      const validCart = cart.filter(item => item && (item.id || item._id));

      // Migrate old cart items to new format (add cart item type field if missing)
      const migratedCart = validCart.map(item => {
        // Ensure item has an id
        if (!item.id && item._id) {
          item.id = item._id;
        }

        // Check if this is already a properly formatted cart item
        // Cart item type should be 'rental' or 'service', not product types like 'Split', 'Window', etc.
        const isCartItemType = item.type === 'rental' || item.type === 'service';

        if (!isCartItemType) {
          // Item doesn't have cart item type, need to determine and migrate
          // The current 'type' field is likely a product type (Split, Window, etc.)
          const productType = item.type; // Save the product type before overwriting

          // If it has serviceId or serviceTitle, it's a service
          if (item.serviceId || item.serviceTitle || item.servicePrice) {
            return {
              ...item,
              type: 'service', // Cart item type
            };
          }
          // If it has brand, model, productId, name, or price, it's a rental product
          if (item.brand || item.model || item.productId || item.name || item.price) {
            // Convert selectedDuration to number if it's a string
            let duration = item.selectedDuration;
            if (typeof duration === 'string') {
              duration = parseInt(duration, 10);
            }
            // Ensure it's a valid tenure option
            const validTenureOptions = [3, 6, 9, 11, 12, 24];
            duration = validTenureOptions.includes(duration) ? duration : 3;

            return {
              ...item,
              type: 'rental', // Cart item type - overwrite the product type
              productType: productType || item.productType, // Preserve product type (Split, Window, etc.)
              selectedDuration: duration, // Ensure it's a number
            };
          }
          // Default to rental if we can't determine
          // Convert selectedDuration to number if it's a string
          let duration = item.selectedDuration;
          if (typeof duration === 'string') {
            duration = parseInt(duration, 10);
          }
          // Ensure it's a valid tenure option
          const validTenureOptions = [3, 6, 9, 11, 12, 24];
          duration = validTenureOptions.includes(duration) ? duration : 3;

          return {
            ...item,
            type: 'rental',
            productType: productType || item.productType,
            selectedDuration: duration, // Ensure it's a number
          };
        }

        // Item already has cart item type, ensure productType and selectedDuration are set
        if (item.type === 'rental') {
          // Convert selectedDuration to number if it's a string
          let duration = item.selectedDuration;
          if (typeof duration === 'string') {
            duration = parseInt(duration, 10);
          }
          // Ensure it's a valid tenure option
          const validTenureOptions = [3, 6, 9, 11, 12, 24];
          duration = validTenureOptions.includes(duration) ? duration : 3;

          return {
            ...item,
            selectedDuration: duration, // Ensure it's a number
          };
        }

        return item;
      });

      setCartItems(migratedCart);

      // Save migrated cart back to localStorage if it changed
      if (JSON.stringify(cart) !== JSON.stringify(migratedCart)) {
        localStorage.setItem('cart', JSON.stringify(migratedCart));
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    }
  };

  const saveCart = (cart) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
      setCartItems(cart);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error saving cart:', error);
      throw new Error('Failed to save cart');
    }
  };

  // Add rental product to cart (works for both logged-in and non-logged-in users)
  const addRentalToCart = (product, selectedDuration = '3', isMonthlyPayment = false, monthlyTenure = null, securityDeposit = null) => {
    // No authentication check - allow cart for all users
    try {
      const cart = [...cartItems];
      const productId = product._id || product.id;
      const existingItem = cart.find(
        item => item.type === 'rental' && item.id === productId
      );

      // Convert selectedDuration to number to ensure consistency
      const durationNumber = typeof selectedDuration === 'string'
        ? parseInt(selectedDuration, 10)
        : (selectedDuration || 3);
      // Ensure it's a valid tenure option, default to 3 if not
      const validTenureOptions = [3, 6, 9, 11, 12, 24];
      const finalDuration = validTenureOptions.includes(durationNumber) ? durationNumber : 3;

      // For monthly payment, ensure minimum 3 months and valid tenure options
      const validMonthlyTenureOptions = [3, 6, 9, 11, 12, 24];
      const finalMonthlyTenure = isMonthlyPayment && monthlyTenure
        ? (validMonthlyTenureOptions.includes(monthlyTenure) ? monthlyTenure : 3)
        : null;

      const cartItem = {
        id: productId,
        type: 'rental',
        brand: product.brand,
        model: product.model,
        name: `${product.brand} ${product.model}`,
        capacity: product.capacity,
        productType: product.type,
        category: product.category,
        location: product.location,
        description: product.description,
        price: product.price,
        discount: product.discount || 0,
        images: product.images || [],
        features: product.features || {},
        status: product.status || 'Available',
        energyRating: product.energyRating,
        operationType: product.operationType,
        loadType: product.loadType,
        quantity: 1, // Always 1, no quantity increase
        selectedDuration: finalDuration, // Store as number: 3, 6, 9, 11, 12, or 24
        paymentOption: 'payLater', // Default payment option (will be set at checkout)
        installationCharges: product.installationCharges || null, // Include installation charges for AC
        // Monthly payment fields
        isMonthlyPayment: isMonthlyPayment,
        monthlyPrice: isMonthlyPayment ? (product.monthlyPrice || 0) : null,
        monthlyTenure: finalMonthlyTenure,
        monthlyPaymentEnabled: product.monthlyPaymentEnabled || false, // Store for reference
        securityDeposit: isMonthlyPayment ? (securityDeposit || product.securityDeposit || 0) : null, // Security deposit only for monthly payment
      };

      if (existingItem) {
        // Update existing item instead of incrementing quantity
        const updatedCart = cart.map(item =>
          item.id === productId && item.type === 'rental'
            ? cartItem // Replace with updated product info
            : item
        );
        saveCart(updatedCart);
      } else {
        // Add new item
        saveCart([...cart, cartItem]);
      }
    } catch (error) {
      console.error('Error adding rental to cart:', error);
      throw error;
    }
  };

  // Add service to cart (with booking details) - works for both logged-in and non-logged-in users
  const addServiceToCart = (service, bookingDetails = {}) => {
    // No authentication check - allow cart for all users
    try {
      const cart = [...cartItems];
      const serviceId = service._id || service.id;

      // For services, we allow multiple entries with different booking details
      const newItem = {
        id: `${serviceId}-${Date.now()}`, // Unique ID for each service booking
        type: 'service',
        serviceId: serviceId,
        serviceTitle: service.title,
        servicePrice: service.price,
        serviceDescription: service.description,
        serviceImage: service.image,
        bookingDetails: {
          date: bookingDetails.date || '',
          time: bookingDetails.time || '',
          address: bookingDetails.address || '',
          addressType: bookingDetails.addressType || 'myself',
          contactName: bookingDetails.contactName || '',
          contactPhone: bookingDetails.contactPhone || '',
          paymentOption: bookingDetails.paymentOption || 'payLater',
        },
        quantity: 1,
      };
      saveCart([...cart, newItem]);
    } catch (error) {
      console.error('Error adding service to cart:', error);
      throw error;
    }
  };

  // Update cart item
  const updateCartItem = (itemId, updates) => {
    try {
      const updatedCart = cartItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      saveCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  // Update service booking details
  const updateServiceBookingDetails = (itemId, bookingDetails) => {
    try {
      const updatedCart = cartItems.map(item =>
        item.id === itemId && item.type === 'service'
          ? { ...item, bookingDetails: { ...item.bookingDetails, ...bookingDetails } }
          : item
      );
      saveCart(updatedCart);
    } catch (error) {
      console.error('Error updating service booking details:', error);
      throw error;
    }
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    try {
      const updatedCart = cartItems.filter(item => item.id !== itemId);
      saveCart(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Update quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    try {
      const updatedCart = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      saveCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  // Clear cart
  const clearCart = () => {
    saveCart([]);
  };

  // Calculate totals
  const calculateTotals = () => {
    const rentals = cartItems.filter(item => {
      // Include items with type='rental' or items that look like rentals (have product fields)
      return item.type === 'rental' ||
        (item.type !== 'service' && (item.brand || item.model || item.price));
    });
    const services = cartItems.filter(item => item.type === 'service');

    // Since quantity is always 1, we just sum the prices
    // Use selected duration (3, 6, 9, 11, 12, 24 months) or default to 3 months
    const rentalTotal = rentals.reduce((total, item) => {
      // Check if this is a monthly payment item
      if (item.isMonthlyPayment && item.monthlyPrice && item.monthlyTenure) {
        // For monthly payment: one month charge + security deposit
        const oneMonthCharge = item.monthlyPrice;
        const securityDeposit = item.securityDeposit || 0;
        const monthlyTotal = oneMonthCharge + securityDeposit;
        // Add installation charges if present (only for AC)
        const installationCharge = (item.category === 'AC' && item.installationCharges && item.installationCharges.amount)
          ? item.installationCharges.amount
          : 0;
        return total + monthlyTotal + installationCharge;
      }

      // Regular payment: use selected duration
      // Ensure selectedDuration is a number
      let duration = item.selectedDuration;
      if (typeof duration === 'string') {
        duration = parseInt(duration, 10);
      }
      const selectedDuration = duration || 3;
      const price = item.price && typeof item.price === 'object'
        ? (item.price[selectedDuration] || item.price[3] || 0)
        : (item.price || 0);
      // Add installation charges if present (only for AC)
      const installationCharge = (item.category === 'AC' && item.installationCharges && item.installationCharges.amount)
        ? item.installationCharges.amount
        : 0;
      return total + price + installationCharge; // quantity is always 1
    }, 0);

    const serviceTotal = services.reduce((total, item) => {
      return total + (item.servicePrice || 0); // quantity is always 1
    }, 0);

    return {
      rentalTotal,
      serviceTotal,
      total: rentalTotal + serviceTotal,
      rentalCount: rentals.length,
      serviceCount: services.length,
      totalItems: cartItems.length,
    };
  };

  // Get payment benefits
  const getPaymentBenefits = () => {
    const discountDecimal = instantPaymentDiscount / 100;
    return {
      payNow: {
        title: 'Pay Now',
        benefits: [
          'Instant order confirmation',
          'Priority service scheduling',
          `${instantPaymentDiscount}% discount on total amount`,
          'Faster delivery/booking confirmation',
        ],
        discount: discountDecimal,
      },
      payLater: {
        title: 'Pay Later',
        benefits: [
          'Pay after service completion',
          'Pay on delivery for rentals',
          'No upfront payment required',
          'Flexible payment options',
        ],
        discount: 0,
      },
    };
  };

  const value = {
    cartItems,
    addRentalToCart,
    addServiceToCart,
    updateCartItem,
    updateServiceBookingDetails,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateTotals,
    getPaymentBenefits,
    cartCount: cartItems.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

