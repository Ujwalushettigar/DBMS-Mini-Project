import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/common/Alert';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const role = user?.role;
      navigate(role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate & Official Login"
        subtitle="Sign in with your registered credentials to access recruitment services"
        crumbs={[{ label: 'Login' }]}
      />

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-5">
        <section className="gov-card md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="gov-card-header !text-base">
              <Info size={18} /> Instructions for Sign In
            </h2>
            <ul className="list-disc space-y-1.5 px-8 py-4 text-sm text-slate-700">
              <li>Use the email address you registered with.</li>
              <li>New candidates must register before logging in.</li>
              <li>Never share your credentials with anyone.</li>
              <li>Log out after use on public/shared terminals.</li>
            </ul>
          </div>

          <details className="border-t border-line px-4 py-3 text-xs text-slate-600" open>
            <summary className="cursor-pointer font-semibold text-gov-700">
              Demo Credentials (Academic Evaluation)
            </summary>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded border border-line">
                <div>
                  <p className="font-semibold text-gov-800">Admin Account</p>
                  <p className="text-[11px] text-slate-500 font-mono">admin@gov.in</p>
                </div>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@gov.in', 'Admin@123')}
                  className="gov-btn gov-btn-outline !py-1 !px-2 text-xs"
                >
                  Use
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded border border-line">
                <div>
                  <p className="font-semibold text-gov-800">Candidate Account</p>
                  <p className="text-[11px] text-slate-500 font-mono">rahul.sharma@example.com</p>
                </div>
                <button
                  type="button"
                  onClick={() => fillCredentials('rahul.sharma@example.com', 'Candidate@123')}
                  className="gov-btn gov-btn-outline !py-1 !px-2 text-xs"
                >
                  Use
                </button>
              </div>
            </div>
          </details>
        </section>

        <section className="gov-card md:col-span-3">
          <h1 className="gov-card-header !text-lg">
            <LogIn size={20} /> Login
          </h1>
          <form onSubmit={onSubmit} className="space-y-4 p-5" noValidate>
            <p className="text-xs text-slate-500">Fields marked * are mandatory</p>
            {error && <Alert type="error">{error}</Alert>}

            <FormField label="Email address" htmlFor="email" required>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="gov-input"
                placeholder="registered.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="gov-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>

            <button type="submit" disabled={submitting} className="gov-btn gov-btn-primary w-full">
              {submitting ? 'Signing in...' : 'Login'}
            </button>

            <p className="text-center text-sm text-slate-600">
              New candidate?{' '}
              <Link to="/register" className="gov-link font-semibold">
                Create an account
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Login;
