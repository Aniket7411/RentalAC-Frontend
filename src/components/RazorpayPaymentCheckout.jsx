import React, { useState, useEffect } from 'react';
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';

const RazorpayPaymentCheckout = ({
  orderId,
  amount,
  user,
  onPaymentSuccess,
  onPaymentFailure,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [error, setError] = useState('');
  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  useEffect(() => {
    // Load Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load payment gateway. Please refresh the page.');
      showError('Failed to load payment gateway. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [showError]);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      showError('Payment gateway is loading. Please wait...');
      return;
    }

    if (!window.Razorpay) {
      showError('Payment gateway not available. Please refresh the page.');
      return;
    }

    if (!orderId || !amount || amount <= 0) {
      const errorMsg = 'Invalid order details. Please try again.';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create Razorpay order on backend
      // Backend will auto-generate paymentId - don't send it
      showInfo('Creating payment order...', 0);
      const orderResponse = await apiService.createRazorpayOrder(orderId, amount);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const orderData = orderResponse.data;

      if (!orderData.razorpayOrderId || !orderData.paymentId) {
        throw new Error('Invalid response from payment gateway');
      }

      // Step 2: Initialize Razorpay checkout
      const razorpayKey = orderData.key || process.env.REACT_APP_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        throw new Error('Razorpay Key ID is not configured. Please contact support.');
      }

      const options = {
        key: razorpayKey,
        amount: Math.round(orderData.amount * 100), // Convert to paise
        currency: orderData.currency || 'INR',
        name: 'CoolRentals & Services',
        description: `Payment for Order ${orderData.orderId}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#3498db', // Primary blue color
        },
        modal: {
          ondismiss: function () {
            // User closed the payment modal
            setLoading(false);
            showInfo('Payment cancelled');
            if (onCancel) {
              onCancel();
            }
          },
        },
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            setLoading(true);
            showInfo('Verifying payment...', 0);

            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: orderData.paymentId,
            };

            const verifyResponse = await apiService.verifyPayment(verificationData);

            if (!verifyResponse.success) {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }

            // Payment successful
            showSuccess('Payment successful! Your order has been confirmed.', 5000);

            if (onPaymentSuccess) {
              onPaymentSuccess(verifyResponse.data);
            }
          } catch (error) {
            // Payment verification failed
            console.error('Payment verification error:', error);
            const errorMessage =
              error.message ||
              'Payment verification failed. Please contact support with your payment ID.';
            showError(errorMessage, 5000);
            setError(errorMessage);

            // Log payment details for support
            console.error('Payment verification failed:', {
              orderId,
              paymentId: orderData.paymentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });

            if (onPaymentFailure) {
              onPaymentFailure(error);
            }
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      // Handle payment failure
      razorpay.on('payment.failed', function (response) {
        const error = response.error;
        let errorMessage = 'Payment failed. ';

        if (error.code === 'BAD_REQUEST_ERROR') {
          errorMessage += 'Invalid payment details.';
        } else if (error.code === 'GATEWAY_ERROR') {
          errorMessage += 'Payment gateway error. Please try again.';
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage += 'Network error. Please check your connection.';
        } else {
          errorMessage += error.description || 'Please try again.';
        }

        console.error('Payment failed:', error);
        showError(errorMessage, 5000);
        setError(errorMessage);
        setLoading(false);

        if (onPaymentFailure) {
          onPaymentFailure(new Error(errorMessage));
        }
      });

      // Open Razorpay checkout
      razorpay.open();
      setLoading(false); // Reset loading since modal is open
    } catch (error) {
      console.error('Payment initiation error:', error);
      let errorMessage = 'Failed to initiate payment. ';

      // Handle network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage += 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage += 'Please login again to continue.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      showError(errorMessage, 5000);
      setError(errorMessage);
      setLoading(false);

      if (onPaymentFailure) {
        onPaymentFailure(error);
      }
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || !razorpayLoaded || !orderId || amount <= 0}
        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : !razorpayLoaded ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading Payment Gateway...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pay ₹{amount.toFixed(2)}</span>
          </>
        )}
      </button>

      {!razorpayLoaded && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Loading secure payment gateway...
        </p>
      )}
    </div>
  );
};

export default RazorpayPaymentCheckout;

