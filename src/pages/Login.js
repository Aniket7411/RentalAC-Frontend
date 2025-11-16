import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password, formData.role);
    
    if (result.success) {
      if (formData.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center pt-10 pb-6 sm:pt-14 sm:pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-dark">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-light">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary-blue hover:text-primary-blue-light">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-text-dark rounded-lg focus:outline-none focus:ring-primary-blue focus:border-primary-blue focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1">
                Password
              </label>
              <PasswordInput
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                name="password"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-dark mb-1">
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg text-text-dark focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
              >
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-blue hover:text-primary-blue-light">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-blue hover:bg-primary-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm text-text-light">
            <p>Demo Credentials:</p>
            <p className="mt-1">
              User: <span className="font-mono">user@example.com</span> / <span className="font-mono">password</span>
            </p>
            <p className="mt-1">
              Vendor: <span className="font-mono">vendor@example.com</span> / <span className="font-mono">password</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

