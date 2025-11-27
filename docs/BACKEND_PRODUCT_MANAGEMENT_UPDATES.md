# Backend Updates for Multi-Product Management (AC, Refrigerator, Washing Machine)

This document outlines the necessary backend changes to support adding and managing AC, Refrigerator, and Washing Machine products, and updating the Leads/Requests system to handle all three product categories.

## 1. Product Management Endpoints

### A. Create Product Endpoint (`POST /api/admin/products`)

**Purpose:** Unified endpoint to add AC, Refrigerator, or Washing Machine products.

**Request Body:**
```json
{
  "category": "AC" | "Refrigerator" | "Washing Machine",
  "name": "1 Ton 3 Star Convertible Inverter Split AC",
  "brand": "LG",
  "model": "LG123ABC",
  "capacity": "1 Ton" | "190 L" | "5.8 kg",
  "type": "Split" | "Single Door" | "Automatic",
  "description": "Product description",
  "location": "Mumbai, Maharashtra",
  "status": "Available" | "Rented Out" | "Under Maintenance",
  "discount": 5,
  "price": {
    "3": 15000,
    "6": 28000,
    "9": 40000,
    "11": 50000,
    "monthly": 5000
  },
  "images": ["https://cloudinary.com/image1.jpg", "https://cloudinary.com/image2.jpg"],
  "features": {
    "specs": ["Capacity/Size: 1T", "Convertible 5 in 1 Modes"],
    "dimensions": "950\"L x 290\"B x 375\"H",
    "safety": ["Period Maintenance", "Ensure electrical hazards"]
  },
  "energyRating": "3 Star",  // Only for Refrigerator
  "operationType": "Automatic",  // Only for Washing Machine
  "loadType": "Top Load"  // Only for Washing Machine
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Product added successfully",
  "data": {
    "_id": "product_id",
    "category": "AC",
    "name": "1 Ton 3 Star Convertible Inverter Split AC",
    "brand": "LG",
    "model": "LG123ABC",
    "capacity": "1 Ton",
    "type": "Split",
    "description": "Product description",
    "location": "Mumbai, Maharashtra",
    "status": "Available",
    "discount": 5,
    "price": {
      "3": 15000,
      "6": 28000,
      "9": 40000,
      "11": 50000,
      "monthly": 5000
    },
    "images": ["https://cloudinary.com/image1.jpg"],
    "features": {
      "specs": ["Capacity/Size: 1T"],
      "dimensions": "950\"L x 290\"B x 375\"H",
      "safety": ["Period Maintenance"]
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Validation error or server error message"
}
```

**Validation Rules:**
- `category` must be one of: "AC", "Refrigerator", "Washing Machine"
- `name`, `brand`, `capacity`, `type`, `location` are required
- `price.3`, `price.6`, `price.9`, `price.11`, `price.monthly` are required
- `energyRating` is optional, only for Refrigerator
- `operationType` and `loadType` are optional, only for Washing Machine

### B. Get All Products Endpoint (`GET /api/admin/products`)

**Purpose:** Fetch all products (AC, Refrigerator, Washing Machine) for admin management.

**Query Parameters (Optional):**
- `category`: Filter by category ("AC", "Refrigerator", "Washing Machine")
- `status`: Filter by status ("Available", "Rented Out", "Under Maintenance")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "category": "AC",
      "name": "1 Ton 3 Star Convertible Inverter Split AC",
      "brand": "LG",
      "model": "LG123ABC",
      "capacity": "1 Ton",
      "type": "Split",
      "status": "Available",
      "price": {
        "3": 15000,
        "6": 28000,
        "9": 40000,
        "11": 50000,
        "monthly": 5000
      },
      "images": ["https://cloudinary.com/image1.jpg"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
    // ... more products
  ]
}
```

### C. Update Product Endpoint (`PATCH /api/admin/products/:id`)

**Purpose:** Update product details.

**Request Body:** (Same structure as create, all fields optional except those being updated)

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    // Updated product object
  }
}
```

### D. Delete Product Endpoint (`DELETE /api/admin/products/:id`)

**Purpose:** Delete a product.

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## 2. Database Schema Updates

### Product Schema

```javascript
{
  category: {
    type: String,
    enum: ['AC', 'Refrigerator', 'Washing Machine'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    default: ''
  },
  capacity: {
    type: String,
    required: true  // e.g., "1 Ton", "190 L", "5.8 kg"
  },
  type: {
    type: String,
    required: true  // e.g., "Split", "Single Door", "Automatic"
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Rented Out', 'Under Maintenance'],
    default: 'Available'
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  price: {
    3: { type: Number, required: true },
    6: { type: Number, required: true },
    9: { type: Number, required: true },
    11: { type: Number, required: true },
    monthly: { type: Number, required: true }
  },
  images: [{
    type: String  // Cloudinary URLs
  }],
  features: {
    specs: [String],
    dimensions: String,
    safety: [String]
  },
  // Category-specific fields
  energyRating: {
    type: String,  // Only for Refrigerator: "2 Star", "3 Star", "4 Star", "5 Star"
    default: ''
  },
  operationType: {
    type: String,  // Only for Washing Machine: "Automatic", "Semi-Automatic"
    default: ''
  },
  loadType: {
    type: String,  // Only for Washing Machine: "Top Load", "Front Load"
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

## 3. Rental Inquiry Updates

### Update Rental Inquiry Schema

The rental inquiry should include a `productCategory` or `category` field to identify which product type the customer is interested in.

**Updated Rental Inquiry Schema:**
```javascript
{
  // ... existing fields
  productCategory: {
    type: String,
    enum: ['AC', 'Refrigerator', 'Washing Machine'],
    default: 'AC'  // For backward compatibility
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'  // Reference to the Product model
  },
  // Keep acId for backward compatibility, but prefer productId
  acId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // ... other existing fields
}
```

**Update Rental Inquiry Endpoint (`POST /api/rental-inquiries`):**
```json
{
  "name": "Customer Name",
  "phone": "1234567890",
  "email": "customer@example.com",
  "productCategory": "AC" | "Refrigerator" | "Washing Machine",
  "productId": "product_id",  // ID of the product they're interested in
  "message": "I'm interested in this product",
  "status": "Pending"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inquiry submitted successfully",
  "data": {
    "_id": "inquiry_id",
    "name": "Customer Name",
    "phone": "1234567890",
    "productCategory": "AC",
    "productId": "product_id",
    "status": "Pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 4. Get Rental Inquiries Endpoint (`GET /api/admin/rental-inquiries`)

**Response should include product category:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "inquiry_id",
      "name": "Customer Name",
      "phone": "1234567890",
      "productCategory": "AC",
      "productId": "product_id",
      "acDetails": {
        "brand": "LG",
        "model": "LG123ABC"
      },
      "message": "I'm interested",
      "status": "Pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 5. Backward Compatibility

- Keep the existing `/api/admin/acs` endpoint working (it can call the new `/api/admin/products` endpoint with `category: "AC"` filter)
- Keep `acId` field in rental inquiries for backward compatibility, but also support `productId`
- The frontend will gradually migrate to using the new endpoints

## 6. Summary of Required Changes

1. **Create Product Model/Schema** with category support and category-specific fields
2. **Create/Update Product Endpoints:**
   - `POST /api/admin/products` - Create product
   - `GET /api/admin/products` - Get all products (with optional category filter)
   - `PATCH /api/admin/products/:id` - Update product
   - `DELETE /api/admin/products/:id` - Delete product
3. **Update Rental Inquiry Schema** to include `productCategory` and `productId`
4. **Update Rental Inquiry Endpoints** to handle product category
5. **Maintain Backward Compatibility** with existing AC-specific endpoints

---

**Note:** The frontend has been updated to use these new endpoints. The admin can now add AC, Refrigerator, and Washing Machine products through a unified interface, and the Leads page will display the product category for each rental inquiry.


