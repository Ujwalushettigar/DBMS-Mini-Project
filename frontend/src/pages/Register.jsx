import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    category: 'General',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        category: formData.category,
        phone_number: formData.phone_number,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      });
      navigate('/candidate/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded bg-blue-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">New Candidate Registration</h1>
          <p className="text-xs text-slate-500">
            Create an official candidate profile for public recruitment examinations
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Section: Account Credentials */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
              1. Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="aspirant@example.com"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Personal Dossier */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
              2. Personal & Demographic Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="As per matriculation cert"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category / Quota *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  name="phone_number"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="10 digit mobile number"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Address Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
              3. Permanent Address
            </h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Address Line *</label>
              <textarea
                name="address"
                required
                rows="2"
                value={formData.address}
                onChange={handleChange}
                placeholder="House / Flat no, Street, Locality"
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6 digit PIN"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded shadow-sm text-xs transition disabled:opacity-50"
            >
              {loading ? 'Submitting Registration...' : 'Complete Registration'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="text-blue-900 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

