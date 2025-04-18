import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted');
    restoreSession();
  }, []);

  const login = async (username, password) => {
    console.log('Attempting login with:', username);
    try {
      const { user: userData, token } = await api.auth.login(username, password);
      console.log('Login successful:', userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('auth', JSON.stringify({
        username: userData.username,
        role: userData.role,
        siteId: userData.siteId,
        departmentId: userData.departmentId,
      }));

      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const logout = () => {
    console.log('Logging out');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
  };

  const restoreSession = async () => {
    console.log('Attempting to restore session');
    setIsLoading(true);
    try {
      const authData = localStorage.getItem('auth');
      const token = localStorage.getItem('token');

      if (authData && token) {
        console.log('Found stored auth data:', authData);
        const { username } = JSON.parse(authData);
        const users = await api.users.list();
        const userData = users.find(u => u.username === username);

        if (userData) {
          console.log('Session restored for user:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.log('No matching user found, logging out');
          logout();
        }
      } else {
        console.log('No stored auth data found');
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has access to a specific site
  const hasAccessToSite = (siteId) => {
    if (!user) return false;
    if (user.isAdmin) return true;
    return user.accessibleSites.some(site => site.id === siteId);
  };

  // Check if user has access to a specific department
  const hasAccessToDepartment = (departmentId) => {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (user.isSiteManager && user.accessibleDepartments.some(dept => dept.id === departmentId)) {
      return true;
    }
    return user.departmentId === departmentId;
  };

  // Get user's current site
  const getCurrentSite = () => {
    if (!user) return null;
    if (!user.siteId) return null;
    return user.accessibleSites.find(site => site.id === user.siteId) || null;
  };

  // Get user's current department
  const getCurrentDepartment = () => {
    if (!user) return null;
    if (!user.departmentId) return null;
    return user.accessibleDepartments.find(dept => dept.id === user.departmentId) || null;
  };

  console.log('Current auth state:', { user, isAuthenticated, isLoading });

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      hasAccessToSite,
      hasAccessToDepartment,
      getCurrentSite,
      getCurrentDepartment,
    }}>
      {!isLoading && children}
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

export default AuthContext;
