# Razorpay Payment Integration - Testing Guide

## Prerequisites

✅ **Backend Setup Complete**
- Razorpay test credentials added to backend `.env`
- Backend endpoints configured:
  - `POST /api/payments/create-order`
  - `POST /api/payments/verify`
  - `GET /api/payments/:paymentId`

✅ **Frontend Setup Required**
- Add `REACT_APP_RAZORPAY_KEY_ID` to frontend `.env` file
- Get your test Key ID from: https://dashboard.razorpay.com/app/keys

## Frontend Environment Setup

Create or update `.env` file in the root directory:

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Important**: 
- Use `rzp_test_` prefix for test mode
- Use `rzp_live_` prefix for production
- Restart your React dev server after adding the variable

## Testing Steps

### 1. Start the Application

```bash
npm start
```

### 2. Test Payment Flow

1. **Add items to cart**
   - Browse products and add to cart
   - Or add services to cart

2. **Go to Checkout**
   - Navigate to `/checkout` or click "Checkout" from cart

3. **Select "Pay Now" Option**
   - Choose "Pay Now" payment option
   - You should see a 5% discount applied

4. **Place Order**
   - Click "Place Order" button
   - Order will be created with `paymentStatus: 'pending'`
   - Razorpay payment button should appear

5. **Initiate Payment**
   - Click "Pay ₹[amount]" button
   - Razorpay checkout modal should open

### 3. Test Payment Scenarios

#### ✅ Successful Payment Test

**Test Card Details:**
- **Card Number**: `4111 1111 1111 1111`
- **Expiry Date**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Name**: Any name

**Expected Result:**
- Payment should complete successfully
- Success toast notification appears
- Order status updated to 'paid'
- Cart cleared
- Success modal shown
- Redirected to orders page

#### ❌ Failed Payment Test

**Test Card Details:**
- **Card Number**: `4000 0000 0000 0002`
- **Expiry Date**: Any future date
- **CVV**: Any 3 digits

**Expected Result:**
- Payment should fail
- Error toast notification appears
- Order remains with `paymentStatus: 'pending'`
- User can retry payment

#### 🔒 3D Secure Test

**Test Card Details:**
- **Card Number**: `4012 0010 3714 1112`
- **Expiry Date**: Any future date
- **CVV**: Any 3 digits

**Expected Result:**
- 3D Secure authentication popup appears
- Complete authentication
- Payment should succeed after authentication

#### ❌ User Cancellation Test

**Steps:**
1. Click "Pay ₹[amount]" button
2. Razorpay modal opens
3. Close the modal without completing payment

**Expected Result:**
- Modal closes
- Info toast: "Payment cancelled"
- Order remains with `paymentStatus: 'pending'`
- User can retry payment

### 4. Error Scenarios to Test

#### Network Error
- Disconnect internet before clicking "Pay"
- Should show network error message

#### Invalid Order Details
- Test with invalid order ID or amount
- Should show appropriate error

#### Backend Error
- If backend is down, should show error message
- User should be able to retry

## Verification Checklist

- [ ] Razorpay script loads successfully (check browser console)
- [ ] Payment button appears when "Pay Now" is selected
- [ ] Razorpay modal opens on button click
- [ ] Test card payment succeeds
- [ ] Payment verification works
- [ ] Order status updates to 'paid' after successful payment
- [ ] Cart clears after successful payment
- [ ] Success notification appears
- [ ] Failed payment shows error message
- [ ] User cancellation handled gracefully
- [ ] Network errors handled properly

## Common Issues & Solutions

### Issue: "Razorpay Key ID is not configured"
**Solution**: Add `REACT_APP_RAZORPAY_KEY_ID` to `.env` and restart dev server

### Issue: "Failed to load payment gateway"
**Solution**: 
- Check internet connection
- Verify Razorpay CDN is accessible
- Check browser console for errors

### Issue: "Payment verification failed"
**Solution**:
- Check backend Razorpay credentials
- Verify backend endpoint is working
- Check backend logs for errors

### Issue: Payment succeeds but order not updated
**Solution**:
- Check backend payment verification endpoint
- Verify webhook configuration (if using)
- Check backend logs

## Backend Verification

Test backend endpoints directly:

```bash
# Create Order
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-2025-001",
    "amount": 1000.00
  }'

# Verify Payment (after payment)
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx",
    "paymentId": "PAY-xxx"
  }'
```

## Production Checklist

Before going live:

- [ ] Switch to live Razorpay credentials
- [ ] Update `REACT_APP_RAZORPAY_KEY_ID` to live key
- [ ] Configure webhooks in Razorpay Dashboard
- [ ] Test with real payment methods (small amounts)
- [ ] Verify SSL certificate is valid
- [ ] Test error handling thoroughly
- [ ] Monitor payment logs

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify Razorpay Dashboard for transaction status
4. Contact support with:
   - Payment ID
   - Order ID
   - Error message
   - Browser console logs

