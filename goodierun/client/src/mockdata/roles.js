// Sample role definitions with granular permissions and admin flags
export const roles = [
  {
    id: 1,
    name: 'System Administrator',
    siteId: null, // Can access all sites
    departmentId: null, // Can access all departments
    sysAdmin: true,
    siteAdmin: false,
    protected: true, // Cannot be assigned through UI
    permissions: {
      // Core System Modules
      'System Administration': {
        visible: true,
        actions: {
          'Manage System Settings': true,
          'View System Logs': true,
          'Configure System': true,
          'Manage Integrations': true
        }
      },
      'Site Management': {
        visible: true,
        actions: {
          'Create Site': true,
          'Edit Site': true,
          'Delete Site': true,
          'View Site': true,
          'Configure Site Settings': true,
          'Manage Site Appearance': true,
          'View Site Analytics': true
        },
        fields: {
          'name': 'read/write',
          'address': 'read/write',
          'contact': 'read/write',
          'settings': 'read/write',
          'billing': 'read/write'
        }
      },
      'Department Management': {
        visible: true,
        actions: {
          'Create Department': true,
          'Edit Department': true,
          'Delete Department': true,
          'View Department': true,
          'Configure Department Settings': true
        }
      },
      'User Management': {
        visible: true,
        actions: {
          'Create User': true,
          'Edit User': true,
          'Delete User': true,
          'View User': true,
          'Reset Password': true,
          'Assign Roles': true,
          'Manage Permissions': true
        },
        fields: {
          'username': 'read/write',
          'email': 'read/write',
          'role': 'read/write',
          'department': 'read/write',
          'permissions': 'read/write',
          'status': 'read/write'
        }
      },
      'Role Management': {
        visible: true,
        actions: {
          'Create Roles': true,
          'Edit Roles': true,
          'Delete Roles': true,
          'View Roles': true,
          'Assign Permissions': true
        }
      },
      // Business Modules
      'ERP': {
        visible: true,
        actions: {
          'Access ERP': true,
          'Manage Resources': true,
          'View Reports': true,
          'Configure Settings': true
        },
        subModules: {
          'Finance': { visible: true, fullAccess: true },
          'HR': { visible: true, fullAccess: true },
          'Inventory': { visible: true, fullAccess: true },
          'Procurement': { visible: true, fullAccess: true }
        }
      },
      'CMMS': {
        visible: true,
        actions: {
          'Access CMMS': true,
          'Manage Assets': true,
          'Schedule Maintenance': true,
          'View Reports': true,
          'Configure Settings': true
        },
        subModules: {
          'Asset Management': { visible: true, fullAccess: true },
          'Maintenance Planning': { visible: true, fullAccess: true },
          'Work Orders': { visible: true, fullAccess: true },
          'Inventory Management': { visible: true, fullAccess: true }
        }
      },
      'Security': {
        visible: true,
        actions: {
          'Access Security Module': true,
          'Manage Access Controls': true,
          'View Security Logs': true,
          'Configure Security Settings': true
        },
        subModules: {
          'Access Control': { visible: true, fullAccess: true },
          'Surveillance': { visible: true, fullAccess: true },
          'Incident Management': { visible: true, fullAccess: true },
          'Compliance': { visible: true, fullAccess: true }
        }
      }
    }
  },
  {
    id: 2,
    name: 'Site Administrator',
    siteId: 1,
    departmentId: null, // Can access all departments within site
    sysAdmin: false,
    siteAdmin: true,
    protected: false,
    permissions: {
      'Site Management': {
        visible: true,
        actions: {
          'Edit Site': true,
          'View Site': true,
          'Configure Site Settings': true,
          'Manage Site Appearance': true,
          'View Site Analytics': true
        },
        fields: {
          'name': 'read/write',
          'address': 'read/write',
          'contact': 'read/write',
          'settings': 'read/write',
          'billing': 'read'
        },
        scopedToSite: true
      },
      'Department Management': {
        visible: true,
        actions: {
          'Create Department': true,
          'Edit Department': true,
          'Delete Department': true,
          'View Department': true,
          'Configure Department Settings': true
        },
        scopedToSite: true
      },
      'User Management': {
        visible: true,
        actions: {
          'Create User': true,
          'Edit User': true,
          'Delete User': true,
          'View User': true,
          'Reset Password': true,
          'Assign Roles': true
        },
        fields: {
          'username': 'read/write',
          'email': 'read/write',
          'role': 'read/write',
          'department': 'read/write',
          'status': 'read/write'
        },
        scopedToSite: true
      },
      'Role Management': {
        visible: true,
        actions: {
          'Create Roles': true,
          'Edit Roles': true,
          'View Roles': true,
          'Assign Permissions': true
        },
        scopedToSite: true
      },
      'ERP': {
        visible: true,
        actions: {
          'Access ERP': true,
          'View Reports': true
        },
        subModules: {
          'Finance': { visible: true, scopedToSite: true },
          'HR': { visible: true, scopedToSite: true },
          'Inventory': { visible: true, scopedToSite: true }
        },
        scopedToSite: true
      },
      'CMMS': {
        visible: true,
        actions: {
          'Access CMMS': true,
          'Manage Assets': true,
          'Schedule Maintenance': true,
          'View Reports': true
        },
        subModules: {
          'Asset Management': { visible: true, scopedToSite: true },
          'Maintenance Planning': { visible: true, scopedToSite: true },
          'Work Orders': { visible: true, scopedToSite: true }
        },
        scopedToSite: true
      }
    }
  },
  {
    id: 3,
    name: 'Department Manager',
    siteId: 1,
    departmentId: 1,
    sysAdmin: false,
    siteAdmin: false,
    protected: false,
    permissions: {
      'Department Management': {
        visible: true,
        actions: {
          'Edit Department': true,
          'View Department': true,
          'Configure Department Settings': true
        },
        scopedToDepartment: true
      },
      'User Management': {
        visible: true,
        actions: {
          'Create User': true,
          'Edit User': true,
          'View User': true,
          'Reset Password': true,
          'Assign Roles': true
        },
        fields: {
          'username': 'read/write',
          'email': 'read/write',
          'role': 'read/write',
          'department': 'read',
          'status': 'read/write'
        },
        scopedToDepartment: true,
        roleAssignmentRules: {
          canAssignRoles: true,
          restrictedToSameDepartment: true,
          excludedRoles: ['Site Administrator', 'System Administrator']
        }
      },
      'CMMS': {
        visible: true,
        actions: {
          'Access CMMS': true,
          'Manage Assets': true,
          'Schedule Maintenance': true,
          'View Reports': true
        },
        subModules: {
          'Asset Management': { visible: true, scopedToDepartment: true },
          'Maintenance Planning': { visible: true, scopedToDepartment: true },
          'Work Orders': { visible: true, scopedToDepartment: true }
        },
        scopedToDepartment: true
      }
    }
  },
  {
    id: 4,
    name: 'Staff User',
    siteId: 1,
    departmentId: 1,
    sysAdmin: false,
    siteAdmin: false,
    protected: false,
    permissions: {
      'User Management': {
        visible: true,
        actions: {
          'View User': true
        },
        fields: {
          'username': 'read',
          'email': 'read',
          'role': 'read',
          'department': 'read',
          'status': 'read'
        },
        scopedToDepartment: true
      },
      'CMMS': {
        visible: true,
        actions: {
          'Access CMMS': true,
          'View Assets': true,
          'View Maintenance Schedule': true
        },
        subModules: {
          'Asset Management': { visible: true, readOnly: true, scopedToDepartment: true },
          'Work Orders': { visible: true, readOnly: true, scopedToDepartment: true }
        },
        scopedToDepartment: true
      }
    }
  }
];

export default roles;
