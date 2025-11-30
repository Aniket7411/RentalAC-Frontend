# Invoice Download Feature Documentation

## Overview
This feature allows both users and admins to download and print order invoices. The invoices are generated as HTML files that can be downloaded, printed, or saved as PDF using the browser's print-to-PDF functionality.

## Features Implemented

### 1. Invoice Generation
- Professional invoice template with company branding
- Complete order details including:
  - Order ID and date
  - Customer information
  - Order items (rental products and services)
  - Pricing breakdown (subtotal, discount, total)
  - Payment information
  - Order status
  - Cancellation details (if applicable)

### 2. Download Functionality
- **Download Invoice**: Downloads invoice as HTML file
- **Print Invoice**: Opens print dialog for printing or saving as PDF
- Available on both user and admin sides

### 3. User Interface
- Download and Print buttons on:
  - User Orders list page
  - User Order Detail page
  - Admin Orders list page
  - Admin Order Detail page

## Files Created/Modified

### New Files
1. **src/utils/invoiceGenerator.js**
   - Invoice generation utility
   - HTML template generation
   - Download and print functions

### Modified Files
1. **src/pages/user/Orders.js**
   - Added Download Invoice and Print buttons
   - Integrated invoice generation

2. **src/pages/user/OrderDetail.js**
   - Added Download Invoice and Print buttons in order header
   - Integrated invoice generation

3. **src/pages/admin/AdminOrders.js**
   - Added Download Invoice and Print buttons for each order
   - Integrated invoice generation

4. **src/pages/admin/AdminOrderDetail.js**
   - Added Invoice section in sidebar
   - Download and Print buttons
   - Integrated invoice generation

## Invoice Template Features

### Header Section
- Company name and branding
- Invoice title
- Order ID and date

### Customer Information
- Bill To section with:
  - Customer name
  - Email
  - Phone
  - Address details

### Order Information
- Order ID
- Order date
- Order status (with color-coded badge)
- Payment option
- Payment status

### Items Table
- Item name
- Description (includes product details, booking details for services)
- Quantity
- Price per item
- Total per item

### Summary Section
- Subtotal
- Discount (if applicable)
- Total amount

### Footer
- Thank you message
- Contact information
- Computer-generated notice

### Cancellation Notice
- If order is cancelled, shows:
  - Cancellation reason
  - Cancellation date

## Usage

### For Users
1. Navigate to "My Orders" page
2. Click "Invoice" button next to any order
3. Choose:
   - **Download Invoice**: Downloads as HTML file
   - **Print**: Opens print dialog (can save as PDF)

Or:
1. Open order details page
2. Click "Download Invoice" or "Print" button in header

### For Admins
1. Navigate to "All Orders" page
2. Click "Invoice" or "Print" button for any order
3. Or open order details and use Invoice section in sidebar

## Technical Details

### Invoice Format
- **File Format**: HTML
- **Download**: HTML file (can be opened in any browser)
- **Print**: Uses browser's print functionality
- **PDF**: Users can save as PDF using browser's "Save as PDF" option in print dialog

### Browser Compatibility
- Works in all modern browsers
- Print functionality uses browser's native print dialog
- PDF generation via browser's print-to-PDF feature

### Styling
- Professional invoice design
- Print-optimized CSS (@media print)
- Responsive layout
- Color-coded status badges

## Invoice Content

### Included Information
- ✅ Company information
- ✅ Invoice number (Order ID)
- ✅ Invoice date
- ✅ Customer billing information
- ✅ Order items with details
- ✅ Item quantities and prices
- ✅ Subtotal, discount, and total
- ✅ Payment information
- ✅ Order status
- ✅ Cancellation details (if applicable)

### Item Details
For **Rental Items**:
- Product brand and model
- Capacity, type, location
- Rental duration
- Delivery address (if available)

For **Service Items**:
- Service title and description
- Booking date and time
- Service address
- Contact information

## Customization

### Company Information
To update company details in invoices, edit `src/utils/invoiceGenerator.js`:
```javascript
<div class="company-info">
  <h1>Rental Service</h1>
  <p>AC & Appliance Rental Services</p>
  <p>Email: support@rentalservice.com</p>
  <p>Phone: +91 1234567890</p>
</div>
```

### Styling
Invoice styles are defined in the `generateInvoiceHTML` function. You can customize:
- Colors (primary blue: #2563eb)
- Fonts
- Layout
- Print styles

## Future Enhancements

Potential improvements:
1. Add PDF generation library (jsPDF) for direct PDF download
2. Add invoice numbering system
3. Add tax calculations
4. Add company logo
5. Add QR code for payment
6. Email invoice functionality
7. Invoice templates selection

## Notes

- Invoices are generated client-side (no server required)
- HTML files can be opened in any browser
- For PDF, users use browser's print-to-PDF feature
- All order data is included in the invoice
- Cancellation information is automatically included if order is cancelled

---

**Last Updated:** 2024-12-19  
**Version:** 1.0.0

