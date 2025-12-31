/**
 * Round monetary value to 2 decimal places
 * This prevents floating point precision errors in calculations
 * @param {number} value - The monetary value to round
 * @returns {number} - The rounded value with 2 decimal places
 */
export const roundMoney = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  // Use Math.round to avoid floating point errors
  // Multiply by 100, round, then divide by 100
  return Math.round(value * 100) / 100;
};

/**
 * Format monetary value for display (with currency symbol)
 * @param {number} value - The monetary value to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} - Formatted string like "₹1,234.56"
 */
export const formatMoney = (value, currency = '₹') => {
  const rounded = roundMoney(value);
  return `${currency}${rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Calculate percentage discount amount with proper rounding
 * @param {number} amount - Base amount
 * @param {number} percentage - Discount percentage (e.g., 10 for 10%)
 * @returns {number} - Discount amount rounded to 2 decimal places
 */
export const calculateDiscount = (amount, percentage) => {
  if (percentage <= 0) return 0;
  const discount = (amount * percentage) / 100;
  return roundMoney(discount);
};

/**
 * Calculate final total after discounts with proper rounding
 * Ensures: finalTotal = subtotal - paymentDiscount - couponDiscount
 * @param {number} subtotal - Subtotal before discounts
 * @param {number} paymentDiscount - Payment discount amount
 * @param {number} couponDiscount - Coupon discount amount
 * @returns {number} - Final total rounded to 2 decimal places
 */
export const calculateFinalTotal = (subtotal, paymentDiscount = 0, couponDiscount = 0) => {
  const roundedSubtotal = roundMoney(subtotal);
  const roundedPaymentDiscount = roundMoney(paymentDiscount);
  const roundedCouponDiscount = roundMoney(couponDiscount);
  
  const finalTotal = Math.max(0, roundedSubtotal - roundedPaymentDiscount - roundedCouponDiscount);
  return roundMoney(finalTotal);
};

