import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import BrowseACs from './pages/BrowseACs';
import ACDetail from './pages/ACDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import ServiceRequest from './pages/user/ServiceRequest';
import AdminLogin from './pages/admin/AdminLogin';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AddAC from './pages/admin/AddAC';
import ManageACs from './pages/admin/ManageACs';
import Leads from './pages/admin/Leads';
import ManageServices from './pages/admin/ManageServices';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow pt-16 md:pt-20">
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<BrowseACs />} />
              <Route path="/ac/:id" element={<ACDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/service-request" element={<ServiceRequest />} />
              <Route path="/admin/login" element={<AdminLogin />} />

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
                path="/admin/add-ac"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddAC />
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
                path="/admin/manage-services"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ManageServices />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
