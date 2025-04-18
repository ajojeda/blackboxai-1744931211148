import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useScopedAccess } from '../../context/ScopedAccessContext';
import mockApi from '../../services/mockApi';

const UserManagement = () => {
  const { user } = useAuth();
  const {
    currentScope,
    isSysAdmin,
    isSiteAdmin,
    hasPermission,
    canAssignRole,
    filterToScope
  } = useScopedAccess();

  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    siteId: '',
    departmentId: '',
    roleId: '',
    siteAdmin: false,
    sysAdmin: false
  });

  // Initialize data on component mount
  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Load data based on user's access level
        const [usersData, sitesData, rolesData] = await Promise.all([
          mockApi.users.list({}, currentScope.role),
          isSysAdmin() ? mockApi.site.list() : 
          isSiteAdmin() ? [currentScope.site] :
          [currentScope.site],
          mockApi.roles.list({}, currentScope.role)
        ]);
        
        if (mounted) {
          setUsers(usersData);
          setSites(sitesData);
          setRoles(rolesData);
        }
      } catch (err) {
        console.error('Failed to initialize user management:', err);
        if (mounted) {
          setError('Failed to load initial data. Please refresh the page.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      mounted = false;
    };
  }, [currentScope]);

  // Load departments when site is selected
  useEffect(() => {
    let mounted = true;

    const fetchDepartments = async () => {
      if (!formData.siteId) {
        setDepartments([]);
        return;
      }

      try {
        let deps;
        if (isSysAdmin()) {
          deps = await mockApi.site.getDepartments(formData.siteId);
        } else if (isSiteAdmin() && currentScope.site.id === parseInt(formData.siteId)) {
          deps = await mockApi.site.getDepartments(formData.siteId);
        } else {
          deps = [currentScope.department];
        }
        
        if (mounted) {
          setDepartments(deps);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
        if (mounted) {
          setError('Failed to load departments. Please try selecting the site again.');
        }
      }
    };

    fetchDepartments();

    return () => {
      mounted = false;
    };
  }, [formData.siteId, currentScope]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Validate role assignment permission
      const roleToAssign = roles.find(r => r.id === parseInt(formData.roleId));
      if (!roleToAssign || !canAssignRole(roleToAssign)) {
        throw new Error('You do not have permission to assign this role');
      }

      // Only sysAdmin can create other sysAdmins
      if (formData.sysAdmin && !isSysAdmin()) {
        throw new Error('Only system administrators can create system admin accounts');
      }

      // Only sysAdmin and siteAdmin can create siteAdmins
      if (formData.siteAdmin && !isSysAdmin() && !isSiteAdmin()) {
        throw new Error('You do not have permission to create site admin accounts');
      }

      // Create user with proper scoping
      await mockApi.users.create({
        ...formData,
        siteId: parseInt(formData.siteId),
        departmentId: parseInt(formData.departmentId),
        roleId: parseInt(formData.roleId)
      }, currentScope.role);

      setSuccessMessage('User created successfully!');
      
      // Refresh users list
      const updatedUsers = await mockApi.users.list({}, currentScope.role);
      setUsers(updatedUsers);
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        siteId: '',
        departmentId: '',
        roleId: '',
        siteAdmin: false,
        sysAdmin: false
      });
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPermission('User Management', 'Create User')) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8 max-w-lg">
          <div className="mb-4 text-red-500">
            <i className="fas fa-lock text-5xl"></i>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access user management. Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with access level indicator */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSysAdmin() ? 'Managing all sites and departments' :
             isSiteAdmin() ? `Managing ${currentScope.site.name}` :
             `Managing ${currentScope.department.name}`}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-sm font-medium">
          {isSysAdmin() ? (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              System Admin
            </span>
          ) : isSiteAdmin() ? (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Site Admin
            </span>
          ) : (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Department Manager
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            {successMessage}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create User Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site
              </label>
              <select
                value={formData.siteId}
                onChange={(e) => setFormData({
                  ...formData,
                  siteId: e.target.value,
                  departmentId: '',
                  roleId: ''
                })}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={!isSysAdmin() && !isSiteAdmin()}
              >
                <option value="">Select a site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({
                  ...formData,
                  departmentId: e.target.value,
                  roleId: ''
                })}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={!formData.siteId || (!isSysAdmin() && !isSiteAdmin())}
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={!formData.departmentId}
              >
                <option value="">Select a role</option>
                {roles.filter(role => canAssignRole(role)).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                    {role.protected ? ' (Protected)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin flags - only visible to appropriate admins */}
            {(isSysAdmin() || isSiteAdmin()) && (
              <div className="space-y-2">
                {isSysAdmin() && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sysAdmin"
                      checked={formData.sysAdmin}
                      onChange={(e) => setFormData({ ...formData, sysAdmin: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="sysAdmin" className="ml-2 text-sm text-gray-700">
                      System Administrator
                    </label>
                  </div>
                )}
                {(isSysAdmin() || isSiteAdmin()) && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="siteAdmin"
                      checked={formData.siteAdmin}
                      onChange={(e) => setFormData({ ...formData, siteAdmin: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      disabled={!isSysAdmin() && currentScope.site.id !== parseInt(formData.siteId)}
                    />
                    <label htmlFor="siteAdmin" className="ml-2 text-sm text-gray-700">
                      Site Administrator
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 rounded bg-blue-600 text-white font-medium
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const userSite = sites.find(s => s.id === user.siteId);
                  const userDept = departments.find(d => d.id === user.departmentId);
                  const userRole = roles.find(r => r.id === user.roleId);

                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userSite?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userDept?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userRole?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {user.sysAdmin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              System Admin
                            </span>
                          )}
                          {user.siteAdmin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Site Admin
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
