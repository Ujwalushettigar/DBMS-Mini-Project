import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const publicLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/examinations', label: 'Examinations' },
];

export function MainNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboard = user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard';

  const linkClass = ({ isActive }) =>
    `block border-b-4 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition ${
      isActive ? 'border-saffron-500 bg-gov-800 text-white' : 'border-transparent text-white/90 hover:bg-gov-600'
    }`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="no-print bg-gov-700 text-white shadow" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-4">
        <span className="py-3 text-sm font-semibold uppercase md:hidden">Menu</span>
        <button
          className="py-3 text-white md:hidden focus:outline-none focus:ring-2 focus:ring-saffron-500 rounded p-1"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <ul className={`${open ? 'flex' : 'hidden'} w-full flex-col md:flex md:flex-row md:items-center`}>
          {publicLinks.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            </li>
          ))}
          {user ? (
            <>
              <li className="md:ml-auto">
                <NavLink to={dashboard} className={linkClass} onClick={() => setOpen(false)}>
                  <span className="inline-flex items-center gap-2">
                    <LayoutDashboard size={16} /> Dashboard
                  </span>
                </NavLink>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 border-b-4 border-transparent px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white/90 hover:bg-gov-600 transition text-left"
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="md:ml-auto">
                <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default MainNav;
