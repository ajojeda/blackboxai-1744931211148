import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PermissionSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
  >
    <option value="hidden">Hidden</option>
    <option value="read">Read Only</option>
    <option value="read/write">Read/Write</option>
  </select>
);

const ModulePermissions = ({ module, actions, fields, permissions, onChange }) => {
  const handleActionChange = (action, value) => {
    onChange({
      ...permissions,
      actions: {
        ...permissions.actions,
        [action]: value === 'read/write'
      }
    });
  };

  const handleFieldChange = (field, value) => {
    onChange({
      ...permissions,
      fields: {
        ...permissions.fields,
        [field]: value
      }
    });
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{module}</h3>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={permissions.visible}
            onChange={(e) => onChange({ ...permissions, visible: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2">Visible</span>
        </label>
      </div>

      {permissions.visible && (
        <>
          <div className="space-y-4">
            <h4 className="font-medium">Actions</h4>
            {actions.map(action => (
              <div key={action} className="flex items-center justify-between">
                <span>{action}</span>
                <PermissionSelect
                  value={permissions.actions[action] ? 'read/write' : 'hidden'}
                  onChange={(value) => handleActionChange(action, value)}
                />
              </div>
            ))}
          </div>

          {fields && (
            <div className="space-y-4 mt-6">
              <h4 className="font-medium">Fields</h4>
              {fields.map(field => (
                <div key={field} className="flex items-center justify-between">
                  <span>{field}</span>
                  <PermissionSelect
                    value={permissions.fields?.[field] || 'hidden'}
                    onChange={(value) => handleFieldChange(field, value)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const RoleManagement = () => {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableModules, setAvailableModules] = useState({});
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [editingRole, setEditingRole] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    siteId: '',
    departmentId: '',
    permissions: {}
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [sitesData, modulesData] = await Promise.all([
        api.site.list(),
        api.roles.getAvailableModules()
      ]);
      setSites(sitesData);
      setAvailableModules(modulesData);

      // Initialize permissions structure
      const initialPermissions = {};
      Object.keys(modulesData).forEach(module => {
        initialPermissions[module] = {
          visible: false,
          actions: {},
          fields: {}
        };
        modulesData[module].actions.forEach(action => {
          initialPermissions[module].actions[action] = false;
        });
        if (modulesData[module].fields) {
          modulesData[module].fields.forEach(field => {
            initialPermissions[module].fields[field] = 'hidden';
          });
        }
      });

      setFormData(prev => ({
        ...prev,
        permissions: initialPermissions
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSite) {
      api.site.getDepartments(selectedSite)
        .then(setDepartments)
        .catch(err => setError(err.message));
    } else {
      setDepartments([]);
    }
  }, [selectedSite]);

  useEffect(() => {
    if (selectedSite && selectedDepartment) {
      api.roles.list({ siteId: selectedSite, departmentId: selectedDepartment })
        .then(setRoles)
        .catch(err => setError(err.message));
    } else {
      setRoles([]);
    }
  }, [selectedSite, selectedDepartment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const roleData = {
        ...formData,
        siteId: selectedSite,
        departmentId: selectedDepartment
      };

      if (editingRole) {
        await api.roles.update(editingRole.id, roleData);
      } else {
        await api.roles.create(roleData);
      }

      // Reset form and reload roles
      setFormData({
        name: '',
        siteId: '',
        departmentId: '',
        permissions: {}
      });
      setEditingRole(null);
      await loadInitialData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      setLoading(true);
      await api.roles.delete(roleId);
      await loadInitialData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Role Management</h1>
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
              <label htmlFor="site" className="block text-sm font-medium text-gray-700">Site</label>
              <select
                id="site"
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
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
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                disabled={!selectedSite}
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Role Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Permissions</h2>
            {Object.entries(availableModules).map(([module, { actions, fields }]) => (
              <ModulePermissions
                key={module}
                module={module}
                actions={actions}
                fields={fields}
                permissions={formData.permissions[module] || { visible: false, actions: {}, fields: {} }}
                onChange={(newPermissions) => {
                  setFormData({
                    ...formData,
                    permissions: {
                      ...formData.permissions,
                      [module]: newPermissions
                    }
                  });
                }}
              />
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  siteId: '',
                  departmentId: '',
                  permissions: {}
                });
                setEditingRole(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {editingRole ? 'Update' : 'Create'} Role
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md mt-6">
        <ul className="divide-y divide-gray-200">
          {roles.map(role => (
            <li key={role.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">
                    {sites.find(s => s.id === role.siteId)?.name} - {departments.find(d => d.id === role.departmentId)?.name}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditingRole(role);
                      setFormData(role);
                      setSelectedSite(role.siteId);
                      setSelectedDepartment(role.departmentId);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoleManagement;
