import React, { useEffect, useState } from 'react';
import { candidateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';
import { User, Save } from 'lucide-react';

export function MyProfile() {
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
    setProfile((prev) => ({ ...prev, [name]: value }));
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

  if (loading) return <LoadingSpinner label="Retrieving candidate dossier from PostgreSQL..." />;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Candidate Profile Dossier"
        subtitle="Manage your personal information, demographic category, and permanent address"
        crumbs={[{ label: 'Dashboard', to: '/candidate/dashboard' }, { label: 'My Profile' }]}
      />

      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <User size={18} />
            <span>Official Applicant Dossier</span>
          </div>
          <span className="font-mono text-xs font-bold text-gov-800 bg-gov-50 border border-line px-2 py-0.5 rounded">
            {profile?.candidate_number}
          </span>
        </div>

        <div className="p-6">
          {alert && (
            <div className="mb-4">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 text-sm" noValidate>
            <p className="text-xs text-slate-500 border-b border-line pb-2">
              Fields marked * are mandatory. Keep your contact details up to date for SMS and email alerts.
            </p>

            {/* Personal Details */}
            <div className="space-y-4">
              <h2 className="gov-section-title !text-sm">Personal & Demographic Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Legal Name" htmlFor="full_name" required hint="As registered in Matriculation Certificate">
                  <input
                    id="full_name"
                    type="text"
                    name="full_name"
                    required
                    value={profile?.full_name || ''}
                    onChange={handleChange}
                    className="gov-input"
                  />
                </FormField>

                <FormField label="Date of Birth" htmlFor="date_of_birth" required>
                  <input
                    id="date_of_birth"
                    type="date"
                    name="date_of_birth"
                    required
                    value={profile?.date_of_birth ? profile.date_of_birth.split('T')[0] : ''}
                    onChange={handleChange}
                    className="gov-input"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Gender" htmlFor="gender" required>
                  <select
                    id="gender"
                    name="gender"
                    value={profile?.gender || 'Male'}
                    onChange={handleChange}
                    className="gov-input"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </FormField>

                <FormField label="Category / Quota" htmlFor="category" required>
                  <select
                    id="category"
                    name="category"
                    value={profile?.category || 'General'}
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
                    value={profile?.phone_number || ''}
                    onChange={handleChange}
                    className="gov-input"
                  />
                </FormField>
              </div>
            </div>

            {/* Permanent Address */}
            <div className="space-y-4">
              <h2 className="gov-section-title !text-sm">Permanent Residential Address</h2>
              <FormField label="Address Line" htmlFor="address" required>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={2}
                  value={profile?.address || ''}
                  onChange={handleChange}
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
                    value={profile?.city || ''}
                    onChange={handleChange}
                    className="gov-input"
                  />
                </FormField>

                <FormField label="State / UT" htmlFor="state" required>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    required
                    value={profile?.state || ''}
                    onChange={handleChange}
                    className="gov-input"
                  />
                </FormField>

                <FormField label="Postal Pincode" htmlFor="pincode" required>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    required
                    value={profile?.pincode || ''}
                    onChange={handleChange}
                    className="gov-input"
                  />
                </FormField>
              </div>
            </div>

            <div className="pt-4 border-t border-line flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="gov-btn gov-btn-primary"
              >
                <Save size={16} />
                <span>{saving ? 'Updating Dossier...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default MyProfile;
