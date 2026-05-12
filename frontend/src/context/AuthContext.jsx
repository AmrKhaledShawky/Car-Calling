import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiCall } from '../utils/api.js';
import { getAuthorizedRoute } from '../utils/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = (nextUser, token, refreshToken) => {
    if (token) {
      localStorage.setItem('token', token);
    }

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const data = await apiCall('/auth/me');
          if (data.success) {
            persistAuth(data.data.user, token, localStorage.getItem('refreshToken'));
          } else {
            clearAuth();
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          if (error.status === 401 && /deactivated/i.test(error.message || '')) {
            toast.error(error.message);
          }
          clearAuth();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        persistAuth(data.data.user, data.token, data.refreshToken);
        toast.success('Login successful!');
        return {
          success: true,
          user: data.data.user,
          redirectTo: getAuthorizedRoute(data.data.user?.role),
        };
      } else {
        toast.error(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Network error. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      if (data.success) {
        persistAuth(data.data.user, data.token, data.refreshToken);
        toast.success('Registration successful!');
        return {
          success: true,
          user: data.data.user,
          redirectTo: getAuthorizedRoute(data.data.user?.role),
        };
      } else {
        toast.error(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.message || 'Network error. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    clearAuth();
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    const data = await apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (data.success && data.data?.user) {
      persistAuth(data.data.user, localStorage.getItem('token'), localStorage.getItem('refreshToken'));
    }

    return data;
  };

  const value = {
    user,
    loading,
    login,
    register,
    updateProfile,
    logout,
    clearSession: clearAuth,
    isAuthenticated: !!user,
    getAuthorizedRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
