import { Navigate } from 'react-router-dom';
import { useScopedAccess } from '../context/ScopedAccessContext';

// Higher-order component to enforce scoped access
export const withScopedAccess = (WrappedComponent, requiredModule, requiredAction) => {
  return function ScopedComponent(props) {
    const { currentScope, hasPermission, isModuleVisible, loading, error } = useScopedAccess();

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading permissions...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
              <h2 className="text-2xl font-semibold text-gray-900">Access Error</h2>
              <p className="mt-2 text-gray-600">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!currentScope) {
      return <Navigate to="/login" replace />;
    }

    // Check module visibility first
    if (requiredModule && !isModuleVisible(requiredModule)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <i className="fas fa-lock text-4xl text-yellow-500 mb-4"></i>
              <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
              <p className="mt-2 text-gray-600">
                You do not have permission to view this page.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Check specific action permission
    if (requiredModule && requiredAction && !hasPermission(requiredModule, requiredAction)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <i className="fas fa-lock text-4xl text-yellow-500 mb-4"></i>
              <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
              <p className="mt-2 text-gray-600">
                You do not have permission to perform this action.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withScopedAccess;
