import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import mockApi from '../services/mockApi';

const ScopedAccessContext = createContext();

export const useScopedAccess = () => {
  const context = useContext(ScopedAccessContext);
  if (!context) {
    throw new Error('useScopedAccess must be used within a ScopedAccessProvider');
  }
  return context;
};

export const ScopedAccessProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentScope, setCurrentScope] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's assigned scope (site → department → role)
  useEffect(() => {
    const loadUserScope = async () => {
      if (!user) {
        setCurrentScope(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const scope = await mockApi.auth.getCurrentScope();
        setCurrentScope(scope);
        setError(null);
      } catch (err) {
        console.error('Failed to load user scope:', err);
        setError('Failed to load user scope');
        setCurrentScope(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserScope();
  }, [user]);

  // Check if user has system-wide admin access
  const isSysAdmin = () => {
    return Boolean(currentScope?.role?.sysAdmin);
  };

  // Check if user has site-wide admin access
  const isSiteAdmin = () => {
    return Boolean(currentScope?.role?.siteAdmin);
  };

  // Check if user has permission for a specific action in a module
  const hasPermission = (module, action) => {
    // System admins have all permissions
    if (isSysAdmin()) return true;

    if (!currentScope?.role?.permissions?.[module]?.visible) {
      return false;
    }

    const modulePerms = currentScope.role.permissions[module];
    return modulePerms.actions?.[action] || false;
  };

  // Check field-level permission
  const getFieldPermission = (module, field) => {
    // System admins have full access to all fields
    if (isSysAdmin()) return 'read/write';

    if (!currentScope?.role?.permissions?.[module]?.visible) {
      return 'hidden';
    }

    const modulePerms = currentScope.role.permissions[module];
    return modulePerms.fields?.[field] || 'hidden';
  };

  // Check if a module is visible
  const isModuleVisible = (module) => {
    // System admins can see all modules
    if (isSysAdmin()) return true;

    return Boolean(currentScope?.role?.permissions?.[module]?.visible);
  };

  // Check if user can assign a specific role
  const canAssignRole = (role) => {
    // System admins can assign any role except protected ones
    if (isSysAdmin()) {
      return !role.protected;
    }

    // Site admins can assign roles within their site
    if (isSiteAdmin()) {
      return role.siteId === currentScope.site.id && !role.protected;
    }

    // Check regular user permissions
    const userManagementPerms = currentScope?.role?.permissions?.['User Management'];
    if (!userManagementPerms?.actions?.['Assign Roles']) {
      return false;
    }

    // Check role assignment rules
    const rules = userManagementPerms.roleAssignmentRules;
    if (!rules?.canAssignRoles) {
      return false;
    }

    // Enforce department restriction if applicable
    if (rules.restrictedToSameDepartment && role.departmentId !== currentScope.department.id) {
      return false;
    }

    // Check excluded roles
    if (rules.excludedRoles?.includes(role.name)) {
      return false;
    }

    return true;
  };

  // Check if data belongs to user's scope
  const isInScope = (data) => {
    if (!currentScope) return false;
    if (isSysAdmin()) return true;

    // Site admins can access anything in their site
    if (isSiteAdmin()) {
      return data.siteId === currentScope.site.id;
    }

    // Regular users are restricted to their department
    return (
      data.siteId === currentScope.site.id &&
      data.departmentId === currentScope.department.id
    );
  };

  // Filter data to only include items in current scope
  const filterToScope = (items) => {
    if (!currentScope || !Array.isArray(items)) return [];
    if (isSysAdmin()) return items;

    return items.filter(item => {
      if (isSiteAdmin()) {
        return item.siteId === currentScope.site.id;
      }
      return (
        item.siteId === currentScope.site.id &&
        item.departmentId === currentScope.department.id
      );
    });
  };

  // Get accessible sites for the current user
  const getAccessibleSites = () => {
    if (isSysAdmin()) return null; // Indicates all sites are accessible
    if (isSiteAdmin()) return [currentScope.site.id];
    return [currentScope.site.id];
  };

  // Get accessible departments for the current user
  const getAccessibleDepartments = () => {
    if (isSysAdmin()) return null; // Indicates all departments are accessible
    if (isSiteAdmin()) return null; // Indicates all departments in current site are accessible
    return [currentScope.department.id];
  };

  const value = {
    currentScope,
    loading,
    error,
    isSysAdmin,
    isSiteAdmin,
    hasPermission,
    getFieldPermission,
    isModuleVisible,
    canAssignRole,
    isInScope,
    filterToScope,
    getAccessibleSites,
    getAccessibleDepartments
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">
          <i className="fas fa-circle-notch fa-spin mr-2"></i>
          Loading access controls...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <ScopedAccessContext.Provider value={value}>
      {children}
    </ScopedAccessContext.Provider>
  );
};

export default ScopedAccessContext;
