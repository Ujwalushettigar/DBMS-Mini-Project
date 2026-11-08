import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setTestAccount = (testEmail, testRole) => {
    setEmail(testEmail);
    setPassword('Password@123');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded bg-blue-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Portal Authentication</h1>
          <p className="text-xs text-slate-500">Sign in with your registered candidate or admin account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official / Registered Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded shadow-sm text-xs transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Academic Viva Demo Quick Fill */}
        <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
          <p className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider text-center">
            DBMS Evaluation Quick Sign-In
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTestAccount('admin.recruitment@gov.in', 'admin')}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-[11px] text-slate-700 font-medium text-center"
            >
              Sign In as Admin
            </button>
            <button
              type="button"
              onClick={() => setTestAccount('rohan.sharma@example.com', 'candidate')}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-[11px] text-slate-700 font-medium text-center"
            >
              Sign In as Candidate
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          New candidate aspirant?{' '}
          <Link to="/register" className="text-blue-900 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

