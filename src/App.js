import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import BrowseACs from './pages/BrowseACs';
import ACDetail from './pages/ACDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ServiceRequest from './pages/user/ServiceRequest';
import AdminLogin from './pages/admin/AdminLogin';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Wishlist from './pages/user/Wishlist';
import Orders from './pages/user/Orders';
import OrderDetail from './pages/user/OrderDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AddAC from './pages/admin/AddAC';
import EditProduct from './pages/admin/EditProduct';
import ManageACs from './pages/admin/ManageACs';
import Leads from './pages/admin/Leads';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import ManageServices from './pages/admin/ManageServices';
import Tickets from './pages/admin/Tickets';
import ManageFAQs from './pages/admin/ManageFAQs';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden w-full max-w-full">
              <Header />
              <main className="flex-grow w-full max-w-full overflow-x-hidden pt-16 md:pt-20">
                <ScrollToTop />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/browse" element={<BrowseACs />} />
                  <Route path="/ac/:id" element={<ACDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/service-request" element={<ServiceRequest />} />
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* User Protected Routes */}
                  <Route
                    path="/user/dashboard"
                    element={
                      <ProtectedRoute requireUser={true}>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user/cart"
                    element={<Cart />}
                  />
                  <Route
                    path="/checkout"
                    element={<Checkout />}
                  />
                  <Route
                    path="/user/wishlist"
                    element={
                      <ProtectedRoute requireUser={true}>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user/orders"
                    element={
                      <ProtectedRoute requireUser={true}>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user/orders/:id"
                    element={
                      <ProtectedRoute requireUser={true}>
                        <OrderDetail />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/add-product"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AddAC />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/add-ac"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AddAC />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/edit-product/:id"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <EditProduct />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/manage-products"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <ManageACs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/manage-acs"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <ManageACs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/leads"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Leads />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders/:id"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminOrderDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/manage-services"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <ManageServices />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/tickets"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Tickets />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/manage-faqs"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <ManageFAQs />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
              <Chatbot />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
