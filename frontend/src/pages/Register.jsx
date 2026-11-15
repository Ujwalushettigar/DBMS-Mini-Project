import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Info } from 'lucide-react';
import { Alert } from '../components/common/Alert';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';

export function Register() {
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
      setError(err?.response?.data?.message || err?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Candidate Registration"
        subtitle="One-time registration for online government recruitment examinations"
        crumbs={[{ label: 'Register' }]}
      />

      <div className="gov-card max-w-3xl mx-auto">
        <div className="gov-card-header">
          <UserPlus size={20} />
          <span>Candidate Registration Form</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          <div className="flex items-center justify-between border-b border-line pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Fields marked * are mandatory
            </span>
            <span className="text-xs text-slate-500">
              Already registered? <Link to="/login" className="gov-link font-semibold">Sign In</Link>
            </span>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          {/* Section 1: Account Information */}
          <div className="space-y-4">
            <h2 className="gov-section-title">1. Account Credentials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Email Address" htmlFor="email" required>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="aspirant@example.com"
                  className="gov-input"
                />
              </FormField>

              <FormField label="Password" htmlFor="password" required hint="At least 6 characters">
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="gov-input"
                />
              </FormField>

              <FormField label="Confirm Password" htmlFor="confirm_password" required>
                <input
                  id="confirm_password"
                  type="password"
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="gov-input"
                />
              </FormField>
            </div>
          </div>

          {/* Section 2: Personal Dossier */}
          <div className="space-y-4">
            <h2 className="gov-section-title">2. Personal & Demographic Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Full Legal Name" htmlFor="full_name" required hint="As per Matriculation Certificate">
                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="gov-input"
                />
              </FormField>

              <FormField label="Date of Birth" htmlFor="date_of_birth" required>
                <input
                  id="date_of_birth"
                  type="date"
                  name="date_of_birth"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="gov-input"
                />
              </FormField>

              <FormField label="Gender" htmlFor="gender" required>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="gov-input"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Social Category / Quota" htmlFor="category" required>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="gov-input"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                </select>
              </FormField>

              <FormField label="Mobile Phone Number" htmlFor="phone_number" required hint="10-digit mobile number">
                <input
                  id="phone_number"
                  type="tel"
                  name="phone_number"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="gov-input"
                />
              </FormField>
            </div>
          </div>

          {/* Section 3: Address */}
          <div className="space-y-4">
            <h2 className="gov-section-title">3. Permanent Residential Address</h2>
            <FormField label="Address Line" htmlFor="address" required>
              <textarea
                id="address"
                name="address"
                required
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="House / Flat No., Street, Locality"
                className="gov-input"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="City / District" htmlFor="city" required>
                <input
                  id="city"
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="gov-input"
                />
              </FormField>

              <FormField label="State / UT" htmlFor="state" required>
                <input
                  id="state"
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  className="gov-input"
                />
              </FormField>

              <FormField label="Postal Pincode" htmlFor="pincode" required>
                <input
                  id="pincode"
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  className="gov-input"
                />
              </FormField>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="gov-btn gov-btn-primary w-full"
            >
              {loading ? 'Submitting Registration...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
