import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('grems_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('grems_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('grems_token');
      if (savedToken) {
        try {
          const res = await authAPI.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data.user);
            localStorage.setItem('grems_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[GREMS Auth] Session restoration notice:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success && res.data) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('grems_token', receivedToken);
      localStorage.setItem('grems_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (candidateData) => {
    const res = await authAPI.register(candidateData);
    if (res.success && res.data) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('grems_token', receivedToken);
      localStorage.setItem('grems_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore network failure on logout
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('grems_token');
      localStorage.removeItem('grems_user');
    }
  };

  const isAdmin = user?.role === 'admin';
  const isCandidate = user?.role === 'candidate';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin,
        isCandidate,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

