import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { ScopedAccessProvider } from './context/ScopedAccessContext';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import SiteAppearanceSettings from './pages/admin/SiteAppearanceSettings';
import UserManagement from './pages/admin/UserManagement';
import SiteManagement from './pages/admin/SiteManagement';
import RoleManagement from './pages/admin/RoleManagement';
import UserAssignmentManagement from './pages/admin/UserAssignmentManagement';
import ScopedAccessRoute from './components/ScopedAccessRoute';

// Layout Components
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Navigation />

        {/* Content Area */}
        <div className="flex-1">
          {/* Top Navigation */}
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-end h-16 px-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <button 
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            <ErrorBoundary>
              <Routes>
                <Route path="/dashboard" element={
                  <ErrorBoundary>
                    <ScopedAccessRoute
                      component={Dashboard}
                      module="Dashboard"
                      action="View Dashboard"
                    />
                  </ErrorBoundary>
                } />
                <Route path="/admin/appearance" element={
                  <ErrorBoundary>
                    <ScopedAccessRoute
                      component={SiteAppearanceSettings}
                      module="Site Management"
                      action="Edit Site"
                    />
                  </ErrorBoundary>
                } />
                <Route path="/admin/users" element={
                  <ErrorBoundary>
                    <ScopedAccessRoute
                      component={UserManagement}
                      module="User Management"
                      action="View User"
                    />
                  </ErrorBoundary>
                } />
                <Route path="/admin/sites" element={
                  <ErrorBoundary>
                    <ScopedAccessRoute
                      component={SiteManagement}
                      module="Site Management"
                      action="View Site"
                    />
                  </ErrorBoundary>
                } />
                <Route path="/admin/roles" element={
                  <ErrorBoundary>
                    <ScopedAccessRoute
                      component={RoleManagement}
                      module="Role Management"
                      action="View Roles"
                    />
                  </ErrorBoundary>
                } />
                <Route path="/admin/user-assignments" element={
                  <ErrorBoundary>
                    <ScopedAccessRoute
                      component={UserAssignmentManagement}
                      module="User Management"
                      action="Manage Assignments"
                    />
                  </ErrorBoundary>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or you don't have permission to access it.</p>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                } />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
};

// Auth Components
const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="mb-6">
            <i className="fas fa-user-circle text-6xl text-blue-600"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Sign in to your account
          </h2>
          <p className="text-sm text-gray-600">
            Enter your credentials to access the platform
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded" role="alert">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400"></i>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { isAuthenticated, isLoading, restoreSession } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await restoreSession();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScopedAccessProvider>
        <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <DashboardLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        </Routes>
      </ScopedAccessProvider>
    </Router>
  );
};

export default App;
