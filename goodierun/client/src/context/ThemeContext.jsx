import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

export const defaultTheme = {
  name: 'GoodieRun Default',
  primary: '#743895',
  secondary: '#9A79A9',
  mainGrey: '#7E7383',
  accentGrey: '#636466',
  logoUrl: '/assets/default-logo.png',
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const { user, getCurrentSite } = useAuth();

  useEffect(() => {
    const loadSiteAppearance = async () => {
      console.log('Loading site appearance for user:', user);
      const currentSite = getCurrentSite();
      console.log('Current site:', currentSite);

      if (user?.siteId) {
        try {
          console.log('Fetching appearance for site:', user.siteId);
          const appearance = await api.site.getAppearance(user.siteId);
          console.log('Received site appearance:', appearance);
          setTheme({
            ...defaultTheme,
            ...appearance,
          });
        } catch (error) {
          console.error('Failed to load site appearance:', error);
          setTheme(defaultTheme);
        }
      } else if (user?.isAdmin) {
        console.log('Admin user, using default theme');
        setTheme(defaultTheme);
      }
    };

    loadSiteAppearance();
  }, [user?.siteId, user?.isAdmin, getCurrentSite]);

  // Generate CSS variables for the theme
  useEffect(() => {
    console.log('Updating CSS variables with theme:', theme);
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--main-grey', theme.mainGrey);
    root.style.setProperty('--accent-grey', theme.accentGrey);

    // Add Tailwind dynamic classes
    const style = document.createElement('style');
    style.textContent = `
      .bg-primary { background-color: ${theme.primary} !important; }
      .text-primary { color: ${theme.primary} !important; }
      .border-primary { border-color: ${theme.primary} !important; }
      .bg-secondary { background-color: ${theme.secondary} !important; }
      .text-secondary { color: ${theme.secondary} !important; }
      .border-secondary { border-color: ${theme.secondary} !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  const updateTheme = async (newTheme) => {
    console.log('Updating theme:', newTheme);
    if (!user?.siteId) {
      console.log('No site ID available, cannot update theme');
      return;
    }

    try {
      await api.site.updateAppearance(user.siteId, newTheme);
      console.log('Theme updated successfully');
      setTheme({
        ...theme,
        ...newTheme,
      });
    } catch (error) {
      console.error('Failed to update site appearance:', error);
      throw error;
    }
  };

  console.log('Current theme state:', theme);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
