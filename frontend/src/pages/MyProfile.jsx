import React, { useEffect, useState } from 'react';
import { candidateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { User, Shield, CheckCircle2, Save } from 'lucide-react';

export const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await candidateAPI.getMyProfile();
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        setAlert({ type: 'error', message: err.message || 'Error loading profile' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      const res = await candidateAPI.update(profile.candidate_id, profile);
      if (res.success && res.data) {
        setProfile(res.data);
        setAlert({ type: 'success', message: 'Candidate personal information updated successfully.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update candidate record.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving candidate dossier from PostgreSQL..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-base">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Candidate Profile Information</h1>
            <p className="text-xs text-slate-500">
              Registration No: <strong className="font-mono text-blue-950">{profile?.candidate_number}</strong> • Linked Email: {profile?.email || user?.email}
            </p>
          </div>
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-5 text-xs">
        {/* Row 1: Full name & DOB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              name="full_name"
              required
              value={profile?.full_name || ''}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
            <input
              type="date"
              name="date_of_birth"
              required
              value={profile?.date_of_birth ? profile.date_of_birth.split('T')[0] : ''}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        {/* Row 2: Gender & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
            <select
              name="gender"
              value={profile?.gender || 'Male'}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category / Quota *</label>
            <select
              name="category"
              value={profile?.category || 'General'}
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
              value={profile?.phone_number || ''}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        {/* Row 3: Address */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Address *</label>
          <textarea
            name="address"
            required
            rows="2"
            value={profile?.address || ''}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
          ></textarea>
        </div>

        {/* Row 4: City, State, Pincode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">City *</label>
            <input
              type="text"
              name="city"
              required
              value={profile?.city || ''}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">State *</label>
            <input
              type="text"
              name="state"
              required
              value={profile?.state || ''}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pincode *</label>
            <input
              type="text"
              name="pincode"
              required
              value={profile?.pincode || ''}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MyProfile;

