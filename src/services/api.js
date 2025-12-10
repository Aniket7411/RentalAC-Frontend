import axios from 'axios';
import { uploadMultipleFilesToCloudinary } from '../utils/cloudinary';

// Configure base URL - Update this with your backend URL
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = "https://rental-backend-new.onrender.com/api"

// Create axios instance with default config
console.log(API_BASE_URL);
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout (backend should respond in < 3 seconds after fix)
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and let route guards handle redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Unified Login - Auto-detects admin or user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  },

  // Admin Authentication (kept for backward compatibility)
  adminLogin: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  userSignup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message || 'Account created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.',
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message || 'Password reset link sent to your email',
      };
    } catch (error) {
      // Handle network errors
      if (!error.response) {
        return {
          success: false,
          message: 'Network error. Please try again.',
        };
      }
      // Handle API errors (400, 500, etc.)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset link. Please try again.',
      };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return {
        success: true,
        message: response.data.message || 'Password reset successfully',
      };
    } catch (error) {
      // Handle network errors
      if (!error.response) {
        return {
          success: false,
          message: 'Network error. Please try again.',
        };
      }
      // Handle API errors (400, 500, etc.)
      const errorMessage = error.response?.data?.message;
      if (errorMessage && errorMessage.includes('Invalid or expired')) {
        return {
          success: false,
          message: 'Invalid or expired reset link',
        };
      }
      return {
        success: false,
        message: errorMessage || 'Failed to reset password. The link may have expired. Please request a new one.',
      };
    }
  },

  // ACs - Public endpoints
  getACs: async (filters = {}) => {
    try {
      const response = await api.get('/acs', { params: filters });
      return {
        success: true,
        data: response.data.data || response.data,
        total: response.data.total,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch ACs',
        data: [],
      };
    }
  },

  getACById: async (id) => {
    try {
      const response = await api.get(`/acs/${id}`);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'AC not found',
        data: null,
      };
    }
  },

  // Rental Inquiry - Public endpoint
  createRentalInquiry: async (acId, inquiryData) => {
    try {
      // Include AC ID in the request body to ensure backend has it
      const dataToSend = {
        ...inquiryData,
        acId: acId, // Explicitly include AC ID
      };
      const response = await api.post(`/acs/${acId}/inquiry`, dataToSend);
      return {
        success: true,
        message: response.data.message || 'Rental inquiry submitted successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit inquiry',
      };
    }
  },

  // Intentionally not implementing POST /service-requests here.
  // The app uses /service-bookings for user service flows. Add this when the UI needs it.

  // Lead Capture - Public endpoint
  createLead: async (leadData) => {
    try {
      const response = await api.post('/leads', leadData);
      return {
        success: true,
        message: response.data.message || 'Thank you! We will contact you soon.',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit lead',
      };
    }
  },

  // Admin - Callback Leads (from LeadCaptureModal)
  getCallbackLeads: async (filters = {}) => {
    try {
      const response = await api.get('/admin/leads', { params: filters });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch callback leads',
        data: [],
      };
    }
  },

  getCallbackLead: async (leadId) => {
    try {
      const response = await api.get(`/admin/leads/${leadId}`);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch lead',
        data: null,
      };
    }
  },

  updateCallbackLeadStatus: async (leadId, updates) => {
    try {
      const response = await api.patch(`/admin/leads/${leadId}`, updates);
      return {
        success: true,
        message: response.data.message || 'Lead updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update lead',
      };
    }
  },

  deleteCallbackLead: async (leadId) => {
    try {
      const response = await api.delete(`/admin/leads/${leadId}`);
      return {
        success: true,
        message: response.data.message || 'Lead deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete lead',
      };
    }
  },

  getCallbackLeadStats: async () => {
    try {
      const response = await api.get('/admin/leads/stats');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch lead statistics',
        data: null,
      };
    }
  },

  // Contact Form - Public endpoint
  submitContactForm: async (formData) => {
    try {
      const response = await api.post('/contact', formData);
      return {
        success: true,
        message: response.data.message || 'Message sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
      };
    }
  },

  // Vendor Listing Request - Public endpoint
  submitVendorListingRequest: async (vendorData) => {
    try {
      const response = await api.post('/vendor-listing-request', vendorData);
      return {
        success: true,
        message: response.data.message || 'Request submitted successfully. We will contact you soon.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit request',
      };
    }
  },

  // Admin - AC Management (kept for backward compatibility)
  getAdminACs: async () => {
    try {
      const response = await api.get('/admin/products');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products',
        data: [],
      };
    }
  },

  // Admin - Product Management
  getAdminProducts: async () => {
    try {
      const response = await api.get('/admin/products');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products',
        data: [],
      };
    }
  },

  addAC: async (acData) => {
    try {
      const dataToSend = {
        brand: acData.brand,
        model: acData.model,
        capacity: acData.capacity,
        type: acData.type,
        description: acData.description,
        location: acData.location,
        status: acData.status,
        price: acData.price,
        images: acData.images || [],
      };

      const response = await api.post('/admin/acs', dataToSend);
      return {
        success: true,
        message: response.data.message || 'AC added successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add AC',
      };
    }
  },

  addProduct: async (productData) => {
    try {
      const response = await api.post('/admin/products', productData);
      return {
        success: true,
        message: response.data.message || 'Product added successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add product',
      };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await api.patch(`/admin/products/${id}`, productData);
      return {
        success: true,
        message: response.data.message || 'Product updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product',
      };
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return {
        success: true,
        message: response.data.message || 'Product deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete product',
      };
    }
  },

  updateAC: async (id, acData) => {
    try {
      // Check if acData.images contains File objects (new files to upload)
      // vs URL strings (existing images to preserve)
      const hasNewFiles = acData.images &&
        Array.isArray(acData.images) &&
        acData.images.length > 0 &&
        acData.images[0] instanceof File;

      let imageUrls = [];

      // Only upload to Cloudinary if we have new File objects
      if (hasNewFiles) {
        const uploadedUrls = await uploadMultipleFilesToCloudinary(acData.images);
        if (uploadedUrls.length === 0) {
          return {
            success: false,
            message: 'Failed to upload images. Please try again.',
          };
        }
        // Combine existing images with newly uploaded ones
        imageUrls = [...(acData.existingImages || []), ...uploadedUrls];
      } else if (acData.images && Array.isArray(acData.images) && acData.images.length > 0) {
        // If images is an array of URLs (strings), use them directly
        imageUrls = acData.images;
      } else if (acData.existingImages && Array.isArray(acData.existingImages)) {
        // If we have existing images to preserve, use them
        imageUrls = acData.existingImages;
      }

      // Send data with image URLs to backend
      // Only send fields that are provided (for partial updates)
      const dataToSend = {};

      if (acData.brand !== undefined) dataToSend.brand = acData.brand;
      if (acData.model !== undefined) dataToSend.model = acData.model;
      if (acData.capacity !== undefined) dataToSend.capacity = acData.capacity;
      if (acData.type !== undefined) dataToSend.type = acData.type;
      if (acData.description !== undefined) dataToSend.description = acData.description;
      if (acData.location !== undefined) dataToSend.location = acData.location;
      if (acData.status !== undefined) dataToSend.status = acData.status;
      if (acData.price !== undefined) dataToSend.price = acData.price;

      // Only include images if we explicitly have images to send
      // If images is undefined, don't send it (backend will preserve existing)
      if (acData.images !== undefined) {
        // If images is explicitly set (even if empty array), send it
        dataToSend.images = imageUrls;
      }
      // If images is undefined, don't include it in dataToSend (backend preserves existing)

      const response = await api.patch(`/admin/acs/${id}`, dataToSend);
      return {
        success: true,
        message: response.data.message || 'AC updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update AC',
      };
    }
  },

  deleteAC: async (id) => {
    try {
      const response = await api.delete(`/admin/acs/${id}`);
      return {
        success: true,
        message: response.data.message || 'AC deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete AC',
      };
    }
  },

  // Admin - Service Leads
  getServiceLeads: async () => {
    try {
      const response = await api.get('/admin/service-bookings');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch leads',
        data: [],
      };
    }
  },

  updateLeadStatus: async (leadId, status) => {
    try {
      const response = await api.patch(`/admin/service-bookings/${leadId}`, { status });
      return {
        success: true,
        message: response.data.message || 'Lead status updated',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update lead status',
      };
    }
  },

  // Admin - Rental Inquiries
  getRentalInquiries: async () => {
    try {
      const response = await api.get('/admin/rental-inquiries');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch inquiries',
        data: [],
      };
    }
  },

  updateInquiryStatus: async (inquiryId, status) => {
    try {
      const response = await api.patch(`/admin/rental-inquiries/${inquiryId}`, { status });
      return {
        success: true,
        message: response.data.message || 'Inquiry status updated',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update inquiry status',
      };
    }
  },

  // Admin - Vendor Requests
  getVendorRequests: async () => {
    try {
      const response = await api.get('/admin/vendor-requests');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch vendor requests',
        data: [],
      };
    }
  },

  // Services - Public endpoints
  getServices: async () => {
    try {
      const response = await api.get('/services');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch services',
        data: [],
      };
    }
  },

  // Service Booking - Public endpoint
  createServiceBooking: async (bookingData) => {
    try {
      const response = await api.post('/service-bookings', bookingData);
      return {
        success: true,
        message: response.data.message || 'Service booking submitted successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit booking',
      };
    }
  },

  // Admin - Service Management
  addService: async (serviceData) => {
    try {
      const response = await api.post('/admin/services', serviceData);
      return {
        success: true,
        message: response.data.message || 'Service added successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add service',
      };
    }
  },

  updateService: async (id, serviceData) => {
    try {
      const response = await api.patch(`/admin/services/${id}`, serviceData);
      return {
        success: true,
        message: response.data.message || 'Service updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update service',
      };
    }
  },

  deleteService: async (id) => {
    try {
      const response = await api.delete(`/admin/services/${id}`);
      return {
        success: true,
        message: response.data.message || 'Service deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete service',
      };
    }
  },

  // User Orders
  getUserOrders: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/orders`);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders',
        data: [],
      };
    }
  },

  // Admin - Get All Orders
  getAllOrders: async (filters = {}) => {
    try {
      const response = await api.get('/admin/orders', { params: filters });
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders',
        data: [],
      };
    }
  },

  // Admin - Update Order Status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
      return {
        success: true,
        message: response.data.message || 'Order status updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status',
      };
    }
  },

  // Get Order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order',
        data: null,
      };
    }
  },

  // Create Order
  // Backend fix: Email notifications are now non-blocking, so API responds quickly (< 3 seconds)
  // Order creation succeeds even if email notification fails
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return {
        success: true,
        message: response.data.message || 'Order created successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          success: false,
          message: 'Request timeout. Please check your connection and try again.',
        };
      }
      // Handle network errors
      if (!error.response) {
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order',
      };
    }
  },

  // Cancel Order (User)
  cancelOrder: async (orderId, cancellationReason) => {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`, {
        cancellationReason
      });
      return {
        success: true,
        message: response.data.message || 'Order cancelled successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel order',
      };
    }
  },

  // FAQ Management (Public)
  getFAQs: async () => {
    try {
      const response = await api.get('/faqs');
      return {
        success: true,
        data: response.data.data || response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch FAQs',
        data: [],
      };
    }
  },

  // Admin - FAQ Management
  createFAQ: async (faqData) => {
    try {
      const response = await api.post('/admin/faqs', faqData);
      return {
        success: true,
        message: response.data.message || 'FAQ created successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create FAQ',
      };
    }
  },

  updateFAQ: async (id, faqData) => {
    try {
      const response = await api.patch(`/admin/faqs/${id}`, faqData);
      return {
        success: true,
        message: response.data.message || 'FAQ updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update FAQ',
      };
    }
  },

  deleteFAQ: async (id) => {
    try {
      const response = await api.delete(`/admin/faqs/${id}`);
      return {
        success: true,
        message: response.data.message || 'FAQ deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete FAQ',
      };
    }
  },

  // Wishlist Management
  getWishlist: async () => {
    try {
      const response = await api.get('/wishlist');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch wishlist',
      };
    }
  },

  addToWishlist: async (productId) => {
    try {
      const response = await api.post('/wishlist', { productId });
      return {
        success: true,
        message: response.data.message || 'Added to wishlist',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to wishlist',
      };
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      return {
        success: true,
        message: response.data.message || 'Removed from wishlist',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from wishlist',
      };
    }
  },

  checkWishlistStatus: async (productId) => {
    try {
      const response = await api.get(`/wishlist/check/${productId}`);
      return {
        success: true,
        isInWishlist: response.data.isInWishlist || false,
      };
    } catch (error) {
      return {
        success: false,
        isInWishlist: false,
      };
    }
  },

  // User Service Bookings
  getUserServiceBookings: async () => {
    try {
      const response = await api.get('/service-bookings/my-bookings');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch service bookings',
        data: [],
      };
    }
  },

  // User Profile
  updateUserProfile: async (profileData) => {
    try {
      const response = await api.patch('/users/profile', profileData);
      return {
        success: true,
        data: response.data.data || response.data.user,
        message: response.data.message || 'Profile updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
      };
    }
  },

  // Tickets - User endpoints
  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/tickets', ticketData);
      return {
        success: true,
        message: response.data.message || 'Ticket created successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create ticket',
      };
    }
  },

  getUserTickets: async () => {
    try {
      const response = await api.get('/tickets');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch tickets',
        data: [],
      };
    }
  },

  getTicketById: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch ticket',
        data: null,
      };
    }
  },

  // Admin - Ticket Management
  getAllTickets: async (filters = {}) => {
    try {
      const response = await api.get('/admin/tickets', { params: filters });
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch tickets',
        data: [],
      };
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    try {
      const response = await api.patch(`/admin/tickets/${ticketId}/status`, { status });
      return {
        success: true,
        message: response.data.message || 'Ticket status updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update ticket status',
      };
    }
  },

  addTicketRemark: async (ticketId, remark) => {
    try {
      const response = await api.post(`/admin/tickets/${ticketId}/remarks`, { remark });
      return {
        success: true,
        message: response.data.message || 'Remark added successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add remark',
      };
    }
  },

  // Coupon APIs
  getAvailableCoupons: async (userId = null, category = null, minAmount = null) => {
    try {
      const params = {};
      if (userId) params.userId = userId;
      if (category) params.category = category;
      if (minAmount) params.minAmount = minAmount;

      const response = await api.get('/coupons/available', { params });
      return {
        success: true,
        data: response.data?.data || response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load coupons',
        data: [],
      };
    }
  },

  validateCoupon: async (code, orderTotal, items = []) => {
    try {
      const response = await api.post('/coupons/validate', {
        code,
        orderTotal,
        items: items.map(item => ({
          type: item.type || 'rental',
          category: item.category,
          duration: item.selectedDuration,
        })),
      });
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Invalid coupon code',
        error: error.response?.data?.error || 'COUPON_VALIDATION_ERROR',
      };
    }
  },

  // Admin Coupon APIs
  getAdminCoupons: async () => {
    try {
      const response = await api.get('/admin/coupons');
      return {
        success: true,
        data: response.data?.data || response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load coupons',
        data: [],
      };
    }
  },

  createCoupon: async (couponData) => {
    try {
      const response = await api.post('/admin/coupons', couponData);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Coupon created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create coupon',
      };
    }
  },

  updateCoupon: async (couponId, couponData) => {
    try {
      const response = await api.put(`/admin/coupons/${couponId}`, couponData);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Coupon updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update coupon',
      };
    }
  },

  deleteCoupon: async (couponId) => {
    try {
      const response = await api.delete(`/admin/coupons/${couponId}`);
      return {
        success: true,
        message: response.data?.message || 'Coupon deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete coupon',
      };
    }
  },

  // Razorpay Payment APIs
  createRazorpayOrder: async (orderId, amount) => {
    try {
      const response = await api.post('/payments/create-order', {
        orderId,
        amount,
        // paymentId is auto-generated by backend - don't send it
      });
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Razorpay order created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create payment order',
        error: error.response?.data?.error || 'PAYMENT_GATEWAY_ERROR',
      };
    }
  },

  verifyPayment: async (paymentDetails) => {
    try {
      const response = await api.post('/payments/verify', paymentDetails);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Payment verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Payment verification failed',
        error: error.response?.data?.error || 'SIGNATURE_MISMATCH',
      };
    }
  },

  processPayment: async (orderId, amount, paymentDetails) => {
    try {
      const response = await api.post('/payments/process', {
        orderId,
        amount,
        paymentMethod: 'razorpay',
        paymentDetails,
      });
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Payment processed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to process payment',
        error: error.response?.data?.error || 'PAYMENT_PROCESSING_ERROR',
      };
    }
  },

  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch payment status',
        data: null,
      };
    }
  },
};

export default api;
