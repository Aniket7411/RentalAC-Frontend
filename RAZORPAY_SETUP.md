# Razorpay Payment Integration Setup

This document provides setup instructions for the Razorpay payment integration in the frontend.

## Environment Variables

Create a `.env` file in the root directory of your React app with the following variable:

```env
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

**Note**: 
- The Razorpay Key ID is public and safe to expose in frontend code
- Get your Key ID from the Razorpay Dashboard: https://dashboard.razorpay.com/
- For testing, use test credentials from Razorpay test mode
- For production, use live credentials from Razorpay live mode

## Backend Configuration

Ensure your backend has these environment variables configured:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret (optional, falls back to key_secret)
```

## How It Works

1. **Order Creation**: When user selects "Pay Now" and clicks "Place Order", an order is created with `paymentStatus: 'pending'`

2. **Payment Initiation**: Razorpay checkout modal opens automatically

3. **Payment Processing**: User completes payment on Razorpay gateway

4. **Payment Verification**: Backend verifies payment signature

5. **Order Confirmation**: On successful verification, order status is updated to 'paid' and cart is cleared

## Payment Flow

```
User clicks "Place Order" (Pay Now selected)
  ↓
Order created with paymentStatus: 'pending'
  ↓
Razorpay checkout modal opens
  ↓
User completes payment
  ↓
Payment verified on backend
  ↓
Order status updated to 'paid'
  ↓
Success message shown, cart cleared
```

## Error Handling

The integration includes comprehensive error handling for:

- **Network Errors**: Connection issues, timeout errors
- **Payment Gateway Errors**: Invalid payment details, gateway failures
- **Signature Verification Errors**: Payment verification failures
- **User Cancellation**: When user closes payment modal

All errors are displayed to the user via toast notifications.

## Testing

### Test Mode

1. Use test credentials from Razorpay Dashboard
2. Test cards:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4000 0000 0000 0002`
   - **3D Secure**: `4012 0010 3714 1112`
3. Use any future expiry date (e.g., 12/25)
4. Use any CVV (e.g., 123)

### Production

1. Switch to live credentials
2. Ensure webhook is configured in Razorpay Dashboard
3. Test with real payment methods

## Files Modified/Created

1. **src/services/api.js**: Added Razorpay payment API functions
2. **src/components/RazorpayPaymentCheckout.jsx**: New Razorpay payment component
3. **src/pages/user/Checkout.js**: Integrated Razorpay payment flow

## Support

For payment-related issues:
- Check payment status: `GET /api/payments/:paymentId`
- Contact support with Payment ID, Order ID, and error message
- Check Razorpay Dashboard for transaction details

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)

