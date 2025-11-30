# End-to-End Test Plan - Rental Service Application

## Overview
This document outlines comprehensive end-to-end testing scenarios for the Rental Service application, covering all user flows from public browsing to admin management.

**Test Environment:**
- Frontend: React application (http://localhost:3000)
- Backend API: http://localhost:5000/api
- Test Date: 2024-12-19

---

## Test Scenarios

### 1. Authentication & User Management

#### 1.1 User Registration Flow
**Test Case:** TC-AUTH-001
- **Steps:**
  1. Navigate to `/signup`
  2. Fill in registration form (name, email, password, phone)
  3. Select role as "user"
  4. Submit form
- **Expected Result:**
  - User account created successfully
  - User redirected to dashboard
  - Token stored in localStorage
  - User data displayed in header

**Test Case:** TC-AUTH-002
- **Steps:**
  1. Navigate to `/signup`
  2. Submit form with duplicate email
- **Expected Result:**
  - Error message displayed
  - Form not submitted

**Test Case:** TC-AUTH-003
- **Steps:**
  1. Navigate to `/signup`
  2. Submit form with invalid email format
- **Expected Result:**
  - Validation error displayed
  - Form not submitted

---

#### 1.2 User Login Flow
**Test Case:** TC-AUTH-004
- **Steps:**
  1. Navigate to `/login`
  2. Enter valid user credentials
  3. Submit form
- **Expected Result:**
  - Login successful
  - User redirected to dashboard
  - Token stored in localStorage
  - User menu displayed in header

**Test Case:** TC-AUTH-005
- **Steps:**
  1. Navigate to `/login`
  2. Enter invalid credentials
  3. Submit form
- **Expected Result:**
  - Error message displayed
  - User remains on login page

**Test Case:** TC-AUTH-006
- **Steps:**
  1. Navigate to `/login`
  2. Test password show/hide toggle
- **Expected Result:**
  - Password visibility toggles correctly

---

#### 1.3 Admin Login Flow
**Test Case:** TC-AUTH-007
- **Steps:**
  1. Navigate to `/admin/login`
  2. Enter valid admin credentials
  3. Submit form
- **Expected Result:**
  - Admin login successful
  - Redirected to admin dashboard
  - Admin menu displayed

**Test Case:** TC-AUTH-008
- **Steps:**
  1. Login as admin
  2. Navigate to user-protected route
- **Expected Result:**
  - Access denied or redirected appropriately

---

#### 1.4 Forgot Password Flow
**Test Case:** TC-AUTH-009
- **Steps:**
  1. Navigate to `/forgot-password`
  2. Enter registered email
  3. Submit form
- **Expected Result:**
  - Success message displayed
  - Email sent notification shown

**Test Case:** TC-AUTH-010
- **Steps:**
  1. Navigate to `/forgot-password`
  2. Enter non-existent email
  3. Submit form
- **Expected Result:**
  - Error message displayed

---

#### 1.5 Logout Flow
**Test Case:** TC-AUTH-011
- **Steps:**
  1. Login as user
  2. Click logout button
- **Expected Result:**
  - User logged out
  - Token removed from localStorage
  - Redirected to home page
  - Login button displayed in header

---

### 2. Public Browsing & Catalog

#### 2.1 Home Page Flow
**Test Case:** TC-PUB-001
- **Steps:**
  1. Navigate to `/`
  2. Verify page loads
- **Expected Result:**
  - Hero section displayed
  - Featured ACs section displayed
  - Featured Refrigerators section displayed
  - Featured Washing Machines section displayed
  - Services section displayed
  - Footer displayed

**Test Case:** TC-PUB-002
- **Steps:**
  1. Navigate to `/`
  2. Click "Browse All" on any featured section
- **Expected Result:**
  - Redirected to browse page with appropriate filters

---

#### 2.2 Browse ACs Flow
**Test Case:** TC-PUB-003
- **Steps:**
  1. Navigate to `/browse`
  2. Verify products displayed
- **Expected Result:**
  - Product cards displayed in grid
  - Each card shows image, brand, model, price
  - Filter sidebar visible

**Test Case:** TC-PUB-004
- **Steps:**
  1. Navigate to `/browse`
  2. Apply brand filter (e.g., "LG")
  3. Apply type filter (e.g., "Split")
- **Expected Result:**
  - Products filtered correctly
  - Only matching products displayed
  - Filter badges shown

**Test Case:** TC-PUB-005
- **Steps:**
  1. Navigate to `/browse`
  2. Set price range filter
  3. Set location filter
- **Expected Result:**
  - Products filtered by price range
  - Products filtered by location
  - Results update dynamically

**Test Case:** TC-PUB-006
- **Steps:**
  1. Navigate to `/browse`
  2. Clear all filters
- **Expected Result:**
  - All products displayed
  - Filter badges removed

---

#### 2.3 AC Detail Page Flow
**Test Case:** TC-PUB-007
- **Steps:**
  1. Navigate to `/browse`
  2. Click on any product card
  3. Verify detail page loads
- **Expected Result:**
  - Product images displayed
  - Product details shown (brand, model, capacity, type, description)
  - Price options for different durations displayed
  - Location information shown
  - "Add to Cart" button visible
  - "Add to Wishlist" button visible (if logged in)
  - "Submit Inquiry" button visible

**Test Case:** TC-PUB-008
- **Steps:**
  1. Navigate to `/ac/:id` with invalid ID
- **Expected Result:**
  - 404 error or "Product not found" message

---

#### 2.4 Rental Inquiry Flow
**Test Case:** TC-PUB-009
- **Steps:**
  1. Navigate to `/ac/:id`
  2. Click "Submit Inquiry" button
  3. Fill inquiry form (name, email, phone, duration, message)
  4. Submit form
- **Expected Result:**
  - Inquiry submitted successfully
  - Success modal displayed
  - Form cleared

**Test Case:** TC-PUB-010
- **Steps:**
  1. Navigate to `/ac/:id`
  2. Click "Submit Inquiry"
  3. Submit form with missing required fields
- **Expected Result:**
  - Validation errors displayed
  - Form not submitted

---

### 3. Service Booking Flow

#### 3.1 Browse Services Flow
**Test Case:** TC-SVC-001
- **Steps:**
  1. Navigate to `/service-request`
  2. Verify services displayed
- **Expected Result:**
  - Service cards displayed
  - Each card shows title, description, price
  - "Book Service" button visible

**Test Case:** TC-SVC-002
- **Steps:**
  1. Navigate to `/service-request`
  2. Click "Book Service" on any service
- **Expected Result:**
  - Service booking modal opens
  - Form fields displayed (date, time, address, contact info)

---

#### 3.2 Service Booking Flow
**Test Case:** TC-SVC-003
- **Steps:**
  1. Navigate to `/service-request`
  2. Click "Book Service"
  3. Fill booking form:
     - Select date (future date)
     - Select time slot
     - Enter address
     - Enter contact name and phone
     - Select payment option (Pay Now/Pay Later)
  4. Submit form
- **Expected Result:**
  - Service booking created
  - Service added to cart
  - Success message displayed
  - Modal closes

**Test Case:** TC-SVC-004
- **Steps:**
  1. Navigate to `/service-request`
  2. Click "Book Service"
  3. Submit form with missing required fields
- **Expected Result:**
  - Validation errors displayed
  - Form not submitted

**Test Case:** TC-SVC-005
- **Steps:**
  1. Navigate to `/service-request`
  2. Click "Book Service"
  3. Select past date
  4. Submit form
- **Expected Result:**
  - Date validation error displayed
  - Form not submitted

---

### 4. Shopping Cart Flow

#### 4.1 Add to Cart Flow
**Test Case:** TC-CART-001
- **Steps:**
  1. Navigate to `/browse`
  2. Click "Add to Cart" on a product
- **Expected Result:**
  - Product added to cart
  - Cart icon shows item count
  - Success toast displayed

**Test Case:** TC-CART-002
- **Steps:**
  1. Navigate to `/ac/:id`
  2. Select rental duration (3, 6, 9, or 11 months)
  3. Click "Add to Cart"
- **Expected Result:**
  - Product added with selected duration
  - Correct price calculated

**Test Case:** TC-CART-003
- **Steps:**
  1. Add service to cart from service booking modal
  2. Navigate to cart
- **Expected Result:**
  - Service displayed in cart
  - Booking details shown

---

#### 4.2 View Cart Flow
**Test Case:** TC-CART-004
- **Steps:**
  1. Add items to cart
  2. Navigate to `/user/cart`
- **Expected Result:**
  - All cart items displayed
  - Rentals and services separated
  - Order summary shown
  - Total calculated correctly
  - "Proceed to Checkout" button visible

**Test Case:** TC-CART-005
- **Steps:**
  1. Navigate to `/user/cart` with empty cart
- **Expected Result:**
  - Empty cart message displayed
  - "Browse Products" and "Browse Services" links shown

---

#### 4.3 Update Cart Flow
**Test Case:** TC-CART-006
- **Steps:**
  1. Navigate to `/user/cart`
  2. Change rental duration for a product
- **Expected Result:**
  - Duration updated
  - Price recalculated
  - Total updated

**Test Case:** TC-CART-007
- **Steps:**
  1. Navigate to `/user/cart`
  2. Click "Edit Booking Details" on a service
  3. Update booking details
  4. Save changes
- **Expected Result:**
  - Booking details updated
  - Changes reflected in cart

---

#### 4.4 Remove from Cart Flow
**Test Case:** TC-CART-008
- **Steps:**
  1. Navigate to `/user/cart`
  2. Click remove button on an item
- **Expected Result:**
  - Item removed from cart
  - Cart count updated
  - Total recalculated

---

### 5. Checkout & Order Placement

#### 5.1 Checkout Flow (Not Logged In)
**Test Case:** TC-CHK-001
- **Steps:**
  1. Add items to cart (without login)
  2. Navigate to `/user/cart`
  3. Click "Proceed to Checkout"
- **Expected Result:**
  - Login prompt modal displayed
  - Redirected to login page after delay

---

#### 5.2 Checkout Flow (Logged In)
**Test Case:** TC-CHK-002
- **Steps:**
  1. Login as user
  2. Add items to cart
  3. Navigate to `/checkout`
- **Expected Result:**
  - Checkout page loads
  - Order items displayed
  - Payment options shown (Pay Now/Pay Later)
  - Order summary displayed
  - "Place Order" button visible

**Test Case:** TC-CHK-003
- **Steps:**
  1. Navigate to `/checkout`
  2. Select "Pay Now" option
- **Expected Result:**
  - Discount shown (5%)
  - Final total updated
  - Benefits displayed

**Test Case:** TC-CHK-004
- **Steps:**
  1. Navigate to `/checkout`
  2. Select "Pay Later" option
- **Expected Result:**
  - No discount applied
  - Benefits displayed
  - Final total same as subtotal

---

#### 5.3 Place Order Flow
**Test Case:** TC-CHK-005
- **Steps:**
  1. Navigate to `/checkout`
  2. Select payment option
  3. Click "Place Order"
- **Expected Result:**
  - Order created successfully
  - Cart cleared
  - Success message displayed
  - Redirected to orders page

**Test Case:** TC-CHK-006
- **Steps:**
  1. Navigate to `/checkout` with empty cart
- **Expected Result:**
  - Redirected to cart page
  - Error message displayed

---

### 6. User Dashboard & Orders

#### 6.1 User Dashboard Flow
**Test Case:** TC-USER-001
- **Steps:**
  1. Login as user
  2. Navigate to `/user/dashboard`
- **Expected Result:**
  - Dashboard loads
  - User info displayed
  - Recent orders shown
  - Service bookings shown
  - Quick actions visible

---

#### 6.2 View Orders Flow
**Test Case:** TC-USER-002
- **Steps:**
  1. Login as user
  2. Navigate to `/user/orders`
- **Expected Result:**
  - All user orders displayed
  - Order status shown
  - Order date displayed
  - Total amount shown
  - "View Details" button visible

**Test Case:** TC-USER-003
- **Steps:**
  1. Navigate to `/user/orders`
  2. Click "View Details" on an order
- **Expected Result:**
  - Order detail page loads
  - Complete order information displayed
  - Items listed with details
  - Delivery addresses shown
  - Payment information displayed

---

#### 6.3 Service Bookings View
**Test Case:** TC-USER-004
- **Steps:**
  1. Login as user
  2. Navigate to `/user/dashboard`
  3. View service bookings section
- **Expected Result:**
  - Service bookings displayed
  - Booking status shown
  - Date and time displayed
  - Address shown

---

### 7. Wishlist Flow

#### 7.1 Add to Wishlist Flow
**Test Case:** TC-WISH-001
- **Steps:**
  1. Login as user
  2. Navigate to `/ac/:id`
  3. Click "Add to Wishlist"
- **Expected Result:**
  - Product added to wishlist
  - Button state changes (filled icon)
  - Success message displayed

**Test Case:** TC-WISH-002
- **Steps:**
  1. Try to add to wishlist without login
- **Expected Result:**
  - Login prompt displayed
  - Redirected to login page

---

#### 7.2 View Wishlist Flow
**Test Case:** TC-WISH-003
- **Steps:**
  1. Login as user
  2. Navigate to `/user/wishlist`
- **Expected Result:**
  - All wishlist items displayed
  - Product cards shown
  - "Add to Cart" button visible
  - "Remove" button visible

**Test Case:** TC-WISH-004
- **Steps:**
  1. Navigate to `/user/wishlist` with empty wishlist
- **Expected Result:**
  - Empty wishlist message displayed
  - "Browse Products" link shown

---

#### 7.3 Remove from Wishlist Flow
**Test Case:** TC-WISH-005
- **Steps:**
  1. Navigate to `/user/wishlist`
  2. Click "Remove" on an item
- **Expected Result:**
  - Item removed from wishlist
  - List updated

---

### 8. Contact & Lead Capture

#### 8.1 Contact Form Flow
**Test Case:** TC-CONT-001
- **Steps:**
  1. Navigate to `/contact`
  2. Fill contact form (name, email, phone, message)
  3. Submit form
- **Expected Result:**
  - Form submitted successfully
  - Success message displayed
  - Form cleared

**Test Case:** TC-CONT-002
- **Steps:**
  1. Navigate to `/contact`
  2. Submit form with invalid email
- **Expected Result:**
  - Validation error displayed
  - Form not submitted

---

#### 8.2 Lead Capture Flow
**Test Case:** TC-LEAD-001
- **Steps:**
  1. Navigate to home page
  2. Click lead capture button/modal
  3. Fill lead form (name, phone, message)
  4. Submit form
- **Expected Result:**
  - Lead submitted successfully
  - Success message displayed
  - Modal closes

---

### 9. Admin Dashboard

#### 9.1 Admin Dashboard Flow
**Test Case:** TC-ADMIN-001
- **Steps:**
  1. Login as admin
  2. Navigate to `/admin/dashboard`
- **Expected Result:**
  - Dashboard loads
  - Statistics cards displayed:
    - Total Products
    - Currently Rented
    - Available
    - New Leads
    - Total Orders
  - Quick actions visible

---

### 10. Admin Product Management

#### 10.1 Add Product Flow
**Test Case:** TC-ADMIN-002
- **Steps:**
  1. Login as admin
  2. Navigate to `/admin/add-product`
  3. Fill product form:
     - Brand, Model, Capacity, Type
     - Description, Location
     - Status
     - Prices for 3, 6, 9, 11 months
     - Upload images
  4. Submit form
- **Expected Result:**
  - Product created successfully
  - Images uploaded to Cloudinary
  - Redirected to manage products page
  - Success message displayed

**Test Case:** TC-ADMIN-003
- **Steps:**
  1. Navigate to `/admin/add-product`
  2. Submit form with missing required fields
- **Expected Result:**
  - Validation errors displayed
  - Form not submitted

---

#### 10.2 Manage Products Flow
**Test Case:** TC-ADMIN-004
- **Steps:**
  1. Login as admin
  2. Navigate to `/admin/manage-products`
- **Expected Result:**
  - All products displayed in table/list
  - Product details shown
  - Edit and Delete buttons visible
  - Status badges displayed

**Test Case:** TC-ADMIN-005
- **Steps:**
  1. Navigate to `/admin/manage-products`
  2. Filter products by status
- **Expected Result:**
  - Products filtered correctly
  - Only matching products displayed

---

#### 10.3 Edit Product Flow
**Test Case:** TC-ADMIN-006
- **Steps:**
  1. Navigate to `/admin/manage-products`
  2. Click "Edit" on a product
  3. Update product details
  4. Save changes
- **Expected Result:**
  - Product updated successfully
  - Changes reflected
  - Success message displayed

**Test Case:** TC-ADMIN-007
- **Steps:**
  1. Navigate to edit product page
  2. Update images (add new, remove existing)
  3. Save changes
- **Expected Result:**
  - New images uploaded
  - Existing images preserved (if not removed)
  - Product updated with new images

---

#### 10.4 Delete Product Flow
**Test Case:** TC-ADMIN-008
- **Steps:**
  1. Navigate to `/admin/manage-products`
  2. Click "Delete" on a product
  3. Confirm deletion
- **Expected Result:**
  - Product deleted successfully
  - Removed from list
  - Success message displayed

---

### 11. Admin Service Management

#### 11.1 Add Service Flow
**Test Case:** TC-ADMIN-009
- **Steps:**
  1. Login as admin
  2. Navigate to `/admin/manage-services`
  3. Click "Add Service"
  4. Fill service form (title, description, price, image)
  5. Submit form
- **Expected Result:**
  - Service created successfully
  - Added to services list
  - Success message displayed

---

#### 11.2 Manage Services Flow
**Test Case:** TC-ADMIN-010
- **Steps:**
  1. Navigate to `/admin/manage-services`
- **Expected Result:**
  - All services displayed
  - Edit and Delete buttons visible
  - Service details shown

---

#### 11.3 Edit Service Flow
**Test Case:** TC-ADMIN-011
- **Steps:**
  1. Navigate to `/admin/manage-services`
  2. Click "Edit" on a service
  3. Update service details
  4. Save changes
- **Expected Result:**
  - Service updated successfully
  - Changes reflected
  - Success message displayed

---

#### 11.4 Delete Service Flow
**Test Case:** TC-ADMIN-012
- **Steps:**
  1. Navigate to `/admin/manage-services`
  2. Click "Delete" on a service
  3. Confirm deletion
- **Expected Result:**
  - Service deleted successfully
  - Removed from list
  - Success message displayed

---

### 12. Admin Lead Management

#### 12.1 View Service Bookings Flow
**Test Case:** TC-ADMIN-013
- **Steps:**
  1. Login as admin
  2. Navigate to `/admin/leads`
  3. View service bookings tab
- **Expected Result:**
  - All service bookings displayed
  - Booking details shown
  - Status displayed
  - Update status dropdown visible

---

#### 12.2 Update Service Booking Status Flow
**Test Case:** TC-ADMIN-014
- **Steps:**
  1. Navigate to `/admin/leads`
  2. Select a service booking
  3. Change status (New → Contacted → In-Progress → Resolved)
  4. Save changes
- **Expected Result:**
  - Status updated successfully
  - Changes reflected in list
  - Success message displayed

---

#### 12.3 View Rental Inquiries Flow
**Test Case:** TC-ADMIN-015
- **Steps:**
  1. Navigate to `/admin/leads`
  2. View rental inquiries tab
- **Expected Result:**
  - All rental inquiries displayed
  - Inquiry details shown
  - Status displayed
  - Update status dropdown visible

---

#### 12.4 Update Rental Inquiry Status Flow
**Test Case:** TC-ADMIN-016
- **Steps:**
  1. Navigate to `/admin/leads`
  2. Select a rental inquiry
  3. Change status
  4. Save changes
- **Expected Result:**
  - Status updated successfully
  - Changes reflected
  - Success message displayed

---

### 13. Admin Order Management

#### 13.1 View All Orders Flow
**Test Case:** TC-ADMIN-017
- **Steps:**
  1. Login as admin
  2. Navigate to `/admin/orders`
- **Expected Result:**
  - All orders displayed
  - Order details shown (order ID, customer, total, status)
  - Filter options available
  - "View Details" button visible

**Test Case:** TC-ADMIN-018
- **Steps:**
  1. Navigate to `/admin/orders`
  2. Filter orders by status
- **Expected Result:**
  - Orders filtered correctly
  - Only matching orders displayed

---

#### 13.2 View Order Details Flow
**Test Case:** TC-ADMIN-019
- **Steps:**
  1. Navigate to `/admin/orders`
  2. Click "View Details" on an order
- **Expected Result:**
  - Order detail page loads
  - Complete order information displayed
  - Items listed with details
  - Customer information shown
  - Delivery addresses displayed
  - Payment information shown
  - Update status option visible

---

#### 13.3 Update Order Status Flow
**Test Case:** TC-ADMIN-020
- **Steps:**
  1. Navigate to order details page
  2. Change order status (pending → processing → completed)
  3. Save changes
- **Expected Result:**
  - Order status updated successfully
  - Changes reflected
  - Success message displayed

---

### 14. Admin FAQ Management

#### 14.1 View FAQs Flow
**Test Case:** TC-ADMIN-021
- **Steps:**
  1. Login as admin
  2. Navigate to `/admin/manage-faqs`
- **Expected Result:**
  - All FAQs displayed
  - Categories shown
  - Edit and Delete buttons visible

---

#### 14.2 Add FAQ Flow
**Test Case:** TC-ADMIN-022
- **Steps:**
  1. Navigate to `/admin/manage-faqs`
  2. Click "Add FAQ"
  3. Fill FAQ form (question, answer, category)
  4. Submit form
- **Expected Result:**
  - FAQ created successfully
  - Added to list
  - Success message displayed

---

#### 14.3 Edit FAQ Flow
**Test Case:** TC-ADMIN-023
- **Steps:**
  1. Navigate to `/admin/manage-faqs`
  2. Click "Edit" on an FAQ
  3. Update FAQ content
  4. Save changes
- **Expected Result:**
  - FAQ updated successfully
  - Changes reflected
  - Success message displayed

---

#### 14.4 Delete FAQ Flow
**Test Case:** TC-ADMIN-024
- **Steps:**
  1. Navigate to `/admin/manage-faqs`
  2. Click "Delete" on an FAQ
  3. Confirm deletion
- **Expected Result:**
  - FAQ deleted successfully
  - Removed from list
  - Success message displayed

---

### 15. Ticket Management

#### 15.1 Create Ticket Flow (User)
**Test Case:** TC-TICKET-001
- **Steps:**
  1. Login as user
  2. Navigate to user dashboard or support page
  3. Click "Create Ticket"
  4. Fill ticket form (subject, description, category, priority)
  5. Submit form
- **Expected Result:**
  - Ticket created successfully
  - Ticket ID generated
  - Success message displayed
  - Ticket visible in user's ticket list

---

#### 15.2 View User Tickets Flow
**Test Case:** TC-TICKET-002
- **Steps:**
  1. Login as user
  2. Navigate to tickets page
- **Expected Result:**
  - All user tickets displayed
  - Ticket status shown
  - Ticket details visible
  - "View Details" button visible

---

#### 15.3 View Ticket Details Flow (User)
**Test Case:** TC-TICKET-003
- **Steps:**
  1. Navigate to tickets page
  2. Click "View Details" on a ticket
- **Expected Result:**
  - Ticket detail page loads
  - Complete ticket information displayed
  - Admin remarks shown (if any)
  - Status displayed

---

#### 15.4 View All Tickets Flow (Admin)
**Test Case:** TC-TICKET-004
- **Steps:**
  1. Login as admin
  2. Navigate to `/admin/tickets`
- **Expected Result:**
  - All tickets displayed
  - Filter options available
  - Ticket details shown
  - Status badges displayed

---

#### 15.5 Update Ticket Status Flow (Admin)
**Test Case:** TC-TICKET-005
- **Steps:**
  1. Navigate to `/admin/tickets`
  2. Select a ticket
  3. Change status (new → open → in-progress → resolved)
  4. Save changes
- **Expected Result:**
  - Ticket status updated successfully
  - Changes reflected
  - Success message displayed

---

#### 15.6 Add Ticket Remark Flow (Admin)
**Test Case:** TC-TICKET-006
- **Steps:**
  1. Navigate to `/admin/tickets`
  2. Select a ticket
  3. Click "Add Remark"
  4. Enter remark text
  5. Submit
- **Expected Result:**
  - Remark added successfully
  - Remark visible in ticket details
  - Success message displayed

---

### 16. Responsive Design & UI/UX

#### 16.1 Mobile Responsiveness
**Test Case:** TC-UI-001
- **Steps:**
  1. Open application on mobile device (or resize browser to mobile width)
  2. Navigate through all pages
- **Expected Result:**
  - All pages responsive
  - Navigation menu works (hamburger menu)
  - Forms usable
  - Images scale correctly
  - Text readable

---

#### 16.2 Tablet Responsiveness
**Test Case:** TC-UI-002
- **Steps:**
  1. Open application on tablet (or resize browser to tablet width)
  2. Navigate through all pages
- **Expected Result:**
  - Layout adapts correctly
  - Grids adjust appropriately
  - Forms usable
  - Navigation accessible

---

#### 16.3 Desktop Responsiveness
**Test Case:** TC-UI-003
- **Steps:**
  1. Open application on desktop
  2. Navigate through all pages
- **Expected Result:**
  - Full layout displayed
  - Sidebars visible
  - All features accessible
  - Optimal use of screen space

---

### 17. Error Handling & Edge Cases

#### 17.1 Network Error Handling
**Test Case:** TC-ERR-001
- **Steps:**
  1. Disconnect network
  2. Try to perform API operation
- **Expected Result:**
  - Error message displayed
  - User-friendly error message shown
  - Application doesn't crash

---

#### 17.2 Invalid Route Handling
**Test Case:** TC-ERR-002
- **Steps:**
  1. Navigate to invalid route (e.g., `/invalid-route`)
- **Expected Result:**
  - 404 page displayed
  - "Back to Home" link visible

---

#### 17.3 Protected Route Access
**Test Case:** TC-ERR-003
- **Steps:**
  1. Without login, try to access `/user/dashboard`
- **Expected Result:**
  - Redirected to login page
  - Message displayed

**Test Case:** TC-ERR-004
- **Steps:**
  1. Login as user
  2. Try to access `/admin/dashboard`
- **Expected Result:**
  - Access denied
  - Redirected appropriately

---

#### 17.4 Session Expiry Handling
**Test Case:** TC-ERR-005
- **Steps:**
  1. Login as user
  2. Wait for token to expire (or manually expire)
  3. Try to perform authenticated operation
- **Expected Result:**
  - Token refresh attempted or user logged out
  - Redirected to login page
  - Appropriate message displayed

---

### 18. Performance Testing

#### 18.1 Page Load Performance
**Test Case:** TC-PERF-001
- **Steps:**
  1. Measure page load times for all major pages
- **Expected Result:**
  - Home page loads in < 3 seconds
  - Browse page loads in < 2 seconds
  - Dashboard loads in < 2 seconds

---

#### 18.2 Image Loading Performance
**Test Case:** TC-PERF-002
- **Steps:**
  1. Navigate to browse page with many products
  2. Observe image loading
- **Expected Result:**
  - Images load progressively
  - Placeholders shown while loading
  - No layout shift

---

### 19. Cross-Browser Testing

#### 19.1 Chrome Browser
**Test Case:** TC-BROWSER-001
- **Steps:**
  1. Test all major flows in Chrome
- **Expected Result:**
  - All features work correctly
  - No console errors
  - UI renders correctly

---

#### 19.2 Firefox Browser
**Test Case:** TC-BROWSER-002
- **Steps:**
  1. Test all major flows in Firefox
- **Expected Result:**
  - All features work correctly
  - No console errors
  - UI renders correctly

---

#### 19.3 Safari Browser
**Test Case:** TC-BROWSER-003
- **Steps:**
  1. Test all major flows in Safari
- **Expected Result:**
  - All features work correctly
  - No console errors
  - UI renders correctly

---

#### 19.4 Edge Browser
**Test Case:** TC-BROWSER-004
- **Steps:**
  1. Test all major flows in Edge
- **Expected Result:**
  - All features work correctly
  - No console errors
  - UI renders correctly

---

## Test Execution Summary

### Test Coverage
- **Total Test Cases:** 100+
- **Categories Covered:**
  - Authentication: 11 test cases
  - Public Browsing: 10 test cases
  - Service Booking: 5 test cases
  - Shopping Cart: 8 test cases
  - Checkout: 6 test cases
  - User Dashboard: 4 test cases
  - Wishlist: 5 test cases
  - Contact & Leads: 2 test cases
  - Admin Dashboard: 1 test case
  - Admin Product Management: 7 test cases
  - Admin Service Management: 4 test cases
  - Admin Lead Management: 4 test cases
  - Admin Order Management: 4 test cases
  - Admin FAQ Management: 4 test cases
  - Ticket Management: 6 test cases
  - UI/UX: 3 test cases
  - Error Handling: 5 test cases
  - Performance: 2 test cases
  - Cross-Browser: 4 test cases

### Priority Levels
- **P0 (Critical):** Authentication, Order Placement, Payment Processing
- **P1 (High):** Product Management, Service Booking, Cart Operations
- **P2 (Medium):** Wishlist, Tickets, FAQs
- **P3 (Low):** UI Polish, Performance Optimization

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Database seeded with test data
- [ ] Test user accounts created
- [ ] Test admin account created
- [ ] Cloudinary configured for image uploads

### Test Execution
- [ ] All P0 test cases executed
- [ ] All P1 test cases executed
- [ ] All P2 test cases executed
- [ ] All P3 test cases executed
- [ ] All bugs logged with details
- [ ] Test results documented

### Post-Testing
- [ ] Test report generated
- [ ] Bugs prioritized
- [ ] Critical issues fixed
- [ ] Regression testing performed

---

## Known Issues & Limitations

1. **Backend Dependency:** All tests require a running backend server
2. **Image Upload:** Requires Cloudinary configuration
3. **Payment Gateway:** Payment integration not fully implemented (mock)
4. **Email Service:** Email notifications may not work in test environment

---

## Test Data Requirements

### Test Users
- **User Account:**
  - Email: `user@example.com`
  - Password: `password`
  - Role: `user`

- **Admin Account:**
  - Email: `admin@example.com`
  - Password: `password`
  - Role: `admin`

### Test Products
- At least 10 products with different brands, types, and locations
- Products with different statuses (Available, Rented Out)
- Products with images

### Test Services
- At least 5 services with different prices
- Services with images

---

**Document Version:** 1.0.0  
**Last Updated:** 2024-12-19  
**Prepared By:** QA Team

