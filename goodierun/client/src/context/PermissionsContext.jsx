import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { roles } from '../mockdata/siteData';

const PermissionsContext = createContext(null);

export const PermissionsProvider = ({ children }) => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState(null);

  useEffect(() => {
    console.log('PermissionsProvider: User role changed', user?.role);
    if (user?.role) {
      const rolePermissions = roles[user.role];
      console.log('Role permissions:', rolePermissions);
      setUserPermissions(rolePermissions);
    } else {
      setUserPermissions(null);
    }
  }, [user?.role]);

  const hasAccess = (module, level = 'read') => {
    console.log('Checking access:', { module, level, userPermissions });
    if (!userPermissions) return false;
    
    // Admin has full access
    if (userPermissions.modules.includes('all')) return true;
    
    // Check if user has access to the module
    if (!userPermissions.modules.includes(module)) return false;
    
    // Check permission level
    const modulePermission = userPermissions.permissions[module];
    if (modulePermission === 'write') return true;
    if (modulePermission === 'read' && level === 'read') return true;
    
    return false;
  };

  const getVisibleModules = () => {
    if (!userPermissions) return [];
    return userPermissions.modules;
  };

  const canAccessField = (module, field) => {
    if (!userPermissions) return false;
    
    // Admin has full access
    if (userPermissions.modules.includes('all')) return true;
    
    // Check module access first
    if (!userPermissions.modules.includes(module)) return false;
    
    // Check field-level permissions if defined
    const fieldPermission = userPermissions.permissions[`${module}.${field}`];
    if (fieldPermission !== undefined) {
      return fieldPermission !== 'hidden';
    }
    
    // Default to module-level permission
    const modulePermission = userPermissions.permissions[module];
    return modulePermission !== 'hidden';
  };

  console.log('Current permissions state:', { userPermissions });

  return (
    <PermissionsContext.Provider value={{
      hasAccess,
      getVisibleModules,
      canAccessField,
      userPermissions,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

// Higher-order component for protecting routes based on permissions
export const withPermissions = (WrappedComponent, requiredModule, requiredLevel = 'read') => {
  return function PermissionGuard(props) {
    const { hasAccess } = usePermissions();
    
    if (!hasAccess(requiredModule, requiredLevel)) {
      return (
        <div className="p-4">
          <p className="text-red-600">
            You do not have permission to access this page.
          </p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
};

export default PermissionsContext;
