import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useScopedAccess } from '../../context/ScopedAccessContext';
import mockApi from '../../services/mockApi';

const UserAssignmentManagement = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    userId: '',
    siteId: '',
    departmentId: '',
    roleId: ''
  });

  useEffect(() => {
    loadInitialData();
  }, [currentScope]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load data based on user's access level
      const [usersData, sitesData] = await Promise.all([
        mockApi.users.list({}, currentScope.role),
        isSysAdmin() ? mockApi.site.list() : 
        isSiteAdmin() ? [currentScope.site] :
        [currentScope.site]
      ]);

      setUsers(usersData);
      setSites(sitesData);
      setError(null);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load departments when site is selected
  useEffect(() => {
    if (formData.siteId) {
      const loadDepartments = async () => {
        try {
          let deps;
          if (isSysAdmin()) {
            deps = await mockApi.site.getDepartments(formData.siteId);
          } else if (isSiteAdmin() && currentScope.site.id === parseInt(formData.siteId)) {
            deps = await mockApi.site.getDepartments(formData.siteId);
          } else {
            deps = [currentScope.department];
          }
          setDepartments(deps);
        } catch (err) {
          console.error('Failed to load departments:', err);
          setError(err.message);
        }
      };
      loadDepartments();
    } else {
      setDepartments([]);
    }
  }, [formData.siteId, currentScope]);

  // Load roles when department is selected
  useEffect(() => {
    if (formData.siteId && formData.departmentId) {
      const loadRoles = async () => {
        try {
          const rolesData = await mockApi.roles.list({
            siteId: parseInt(formData.siteId),
            departmentId: parseInt(formData.departmentId)
          }, currentScope.role);
          
          // Filter roles based on assignment permissions
          const assignableRoles = rolesData.filter(role => canAssignRole(role));
          setRoles(assignableRoles);
        } catch (err) {
          console.error('Failed to load roles:', err);
          setError(err.message);
        }
      };
      loadRoles();
    } else {
      setRoles([]);
    }
  }, [formData.siteId, formData.departmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate role assignment permission
      const roleToAssign = roles.find(r => r.id === parseInt(formData.roleId));
      if (!roleToAssign || !canAssignRole(roleToAssign)) {
        throw new Error('You do not have permission to assign this role');
      }

      await mockApi.users.update(
        formData.userId,
        {
          siteId: parseInt(formData.siteId),
          departmentId: parseInt(formData.departmentId),
          roleId: parseInt(formData.roleId)
        },
        currentScope.role
      );

      await loadInitialData();
      setFormData({
        userId: '',
        siteId: '',
        departmentId: '',
        roleId: ''
      });
      setSelectedUser(null);
      setError(null);
    } catch (err) {
      console.error('Failed to assign user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('User Management', 'Assign Roles')) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center text-yellow-700">
          <i className="fas fa-lock mr-2"></i>
          You do not have permission to assign roles.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with access level indicator */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Assignment Management</h1>
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
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700">User</label>
              <select
                id="user"
                value={formData.userId}
                onChange={(e) => {
                  const selectedUser = users.find(u => u.id === e.target.value);
                  setSelectedUser(selectedUser);
                  setFormData({
                    ...formData,
                    userId: e.target.value
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                    {user.sysAdmin ? ' (System Admin)' : 
                     user.siteAdmin ? ' (Site Admin)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="site" className="block text-sm font-medium text-gray-700">Site</label>
              <select
                id="site"
                value={formData.siteId}
                onChange={(e) => setFormData({
                  ...formData,
                  siteId: e.target.value,
                  departmentId: '',
                  roleId: ''
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                disabled={!isSysAdmin() && !isSiteAdmin()}
              >
                <option value="">Select a site</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <select
                id="department"
                value={formData.departmentId}
                onChange={(e) => setFormData({
                  ...formData,
                  departmentId: e.target.value,
                  roleId: ''
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                disabled={!formData.siteId || (!isSysAdmin() && !isSiteAdmin())}
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="role"
                value={formData.roleId}
                onChange={(e) => setFormData({
                  ...formData,
                  roleId: e.target.value
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                disabled={!formData.departmentId}
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option 
                    key={role.id} 
                    value={role.id}
                    disabled={!canAssignRole(role)}
                  >
                    {role.name}
                    {role.protected ? ' (Protected)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  userId: '',
                  siteId: '',
                  departmentId: '',
                  roleId: ''
                });
                setSelectedUser(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Assign User
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md mt-6">
        <ul className="divide-y divide-gray-200">
          {users.map(user => {
            const userSite = sites.find(s => s.id === user.siteId);
            const userDepartment = departments.find(d => d.id === user.departmentId);
            const userRole = roles.find(r => r.id === user.roleId);

            return (
              <li key={user.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                      {user.sysAdmin && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          System Admin
                        </span>
                      )}
                      {user.siteAdmin && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Site Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {userSite?.name} → {userDepartment?.name} → {userRole?.name}
                    </p>
                  </div>
                  {canAssignRole(userRole) && (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setFormData({
                          userId: user.id,
                          siteId: user.siteId || '',
                          departmentId: user.departmentId || '',
                          roleId: user.roleId || ''
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default UserAssignmentManagement;
