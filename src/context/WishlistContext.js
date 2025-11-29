import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load wishlist from backend - memoized to prevent infinite loops
  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getWishlist();
      if (response.success) {
        const items = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        setWishlistItems(items);
        setWishlistCount(items.length);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add item to wishlist - memoized
  const addToWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to add to wishlist' };
    }

    try {
      const response = await apiService.addToWishlist(productId);
      if (response.success) {
        await loadWishlist(); // Reload wishlist after adding
        return { success: true, message: response.message || 'Added to wishlist' };
      }
      return { success: false, message: response.message || 'Failed to add to wishlist' };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'Failed to add to wishlist' };
    }
  }, [isAuthenticated, loadWishlist]);

  // Remove item from wishlist - memoized
  const removeFromWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to remove from wishlist' };
    }

    try {
      const response = await apiService.removeFromWishlist(productId);
      if (response.success) {
        await loadWishlist(); // Reload wishlist after removing
        return { success: true, message: response.message || 'Removed from wishlist' };
      }
      return { success: false, message: response.message || 'Failed to remove from wishlist' };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, message: 'Failed to remove from wishlist' };
    }
  }, [isAuthenticated, loadWishlist]);

  // Check if product is in wishlist - memoized
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => {
      const itemId = item.productId || item.product?._id || item.product?.id || item._id || item.id;
      const checkId = productId?._id || productId?.id || productId;
      return itemId === checkId;
    });
  }, [wishlistItems]);

  // Load wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlistItems([]);
      setWishlistCount(0);
    }
  }, [isAuthenticated, loadWishlist]);

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

