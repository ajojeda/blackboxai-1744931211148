Areimport roles from '../mockdata/roles';
import { sites } from '../mockdata/sites';
import { users, departments } from '../mockdata/siteData';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if user has access to site
const hasAccessToSite = (user, siteId) => {
  if (user.sysAdmin) return true;
  if (user.siteAdmin) return user.siteId === siteId;
  return user.siteId === siteId;
};

// Helper function to check if user has access to department
const hasAccessToDepartment = (user, siteId, departmentId) => {
  if (user.sysAdmin) return true;
  if (user.siteAdmin && user.siteId === siteId) return true;
  return user.siteId === siteId && user.departmentId === departmentId;
};

// Helper function to check if user can assign role
const canAssignRole = (user, role) => {
  if (user.sysAdmin) return true;
  if (role.protected) return false;
  
  if (user.siteAdmin) {
    return role.siteId === user.siteId && !role.sysAdmin;
  }

  const userRole = roles.find(r => r.id === user.roleId);
  const userManagementPerms = userRole?.permissions?.['User Management'];
  
  if (!userManagementPerms?.actions?.['Assign Roles']) {
    return false;
  }

  const rules = userManagementPerms.roleAssignmentRules;
  if (!rules?.canAssignRoles) {
    return false;
  }

  if (rules.restrictedToSameDepartment && role.departmentId !== user.departmentId) {
    return false;
  }

  if (rules.excludedRoles?.includes(role.name)) {
    return false;
  }

  return role.siteId === user.siteId && role.departmentId === user.departmentId;
};

const mockApi = {
  auth: {
    login: async (username, password) => {
      await delay(500);
      const user = users.find(u => u.username === username && u.password === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Get user's role and associated permissions
      const userRole = roles.find(r => r.id === user.roleId);
      if (!userRole) {
        throw new Error('User role not found');
      }

      return {
        user: {
          ...user,
          role: userRole,
          site: sites.find(s => s.id === userRole.siteId),
          department: departments.find(d => d.id === userRole.departmentId),
          permissions: userRole.permissions,
          sysAdmin: userRole.sysAdmin,
          siteAdmin: userRole.siteAdmin
        },
        token: 'mock-jwt-token'
      };
    },

    getCurrentScope: async () => {
      await delay(200);
      const user = users[0]; // Mock current user
      const userRole = roles.find(r => r.id === user.roleId);
      return {
        site: sites.find(s => s.id === userRole.siteId),
        department: departments.find(d => d.id === userRole.departmentId),
        role: userRole
      };
    }
  },

  roles: {
    create: async (roleData, user) => {
      await delay(500);
      // Only sysAdmin and siteAdmin can create roles
      if (!user.sysAdmin && !user.siteAdmin) {
        throw new Error('Unauthorized to create roles');
      }

      // siteAdmin can only create roles for their site
      if (user.siteAdmin && roleData.siteId !== user.siteId) {
        throw new Error('Cannot create roles for other sites');
      }

      if (!roleData.siteId || !roleData.name) {
        throw new Error('Missing required fields');
      }

      const newRole = {
        id: Date.now(),
        ...roleData,
        protected: false, // Only sysAdmin can create protected roles
        sysAdmin: false, // Cannot create sysAdmin roles through API
        siteAdmin: user.siteAdmin // siteAdmin flag based on creator's privileges
      };

      roles.push(newRole);
      return { success: true, role: newRole };
    },

    update: async (roleId, roleData, user) => {
      await delay(500);
      const role = roles.find(r => r.id === roleId);
      if (!role) throw new Error('Role not found');

      // Check access permissions
      if (!user.sysAdmin) {
        if (role.protected || role.sysAdmin) {
          throw new Error('Cannot modify protected or system admin roles');
        }
        if (user.siteAdmin && role.siteId !== user.siteId) {
          throw new Error('Cannot modify roles from other sites');
        }
        if (!user.siteAdmin && role.siteId !== user.siteId) {
          throw new Error('Cannot modify roles outside your scope');
        }
      }

      const updatedRole = {
        ...role,
        ...roleData,
        // Preserve critical flags
        protected: role.protected,
        sysAdmin: role.sysAdmin,
        siteAdmin: role.siteAdmin
      };

      const index = roles.findIndex(r => r.id === roleId);
      roles[index] = updatedRole;
      return { success: true, role: updatedRole };
    },

    remove: async (roleId, user) => {
      await delay(500);
      const role = roles.find(r => r.id === roleId);
      if (!role) throw new Error('Role not found');

      // Check access permissions
      if (!user.sysAdmin) {
        if (role.protected || role.sysAdmin) {
          throw new Error('Cannot delete protected or system admin roles');
        }
        if (user.siteAdmin && role.siteId !== user.siteId) {
          throw new Error('Cannot delete roles from other sites');
        }
        if (!user.siteAdmin && role.siteId !== user.siteId) {
          throw new Error('Cannot delete roles outside your scope');
        }
      }

      const index = roles.findIndex(r => r.id === roleId);
      roles.splice(index, 1);
      return { success: true };
    },

    list: async (filters = {}, user) => {
      await delay(300);
      let filteredRoles = [...roles];

      // Filter based on user's access level
      if (!user.sysAdmin) {
        if (user.siteAdmin) {
          // Site admins can see all roles in their site
          filteredRoles = filteredRoles.filter(r => r.siteId === user.siteId);
        } else {
          // Regular users can only see roles in their department
          filteredRoles = filteredRoles.filter(r => 
            r.siteId === user.siteId && 
            r.departmentId === user.departmentId
          );
        }
      }

      // Apply additional filters
      if (filters.siteId) {
        filteredRoles = filteredRoles.filter(r => r.siteId === filters.siteId);
      }
      if (filters.departmentId) {
        filteredRoles = filteredRoles.filter(r => r.departmentId === filters.departmentId);
      }

      return filteredRoles;
    },

    get: async (roleId, user) => {
      await delay(300);
      const role = roles.find(r => r.id === roleId);
      if (!role) throw new Error('Role not found');

      // Check access permissions
      if (!user.sysAdmin) {
        if (user.siteAdmin && role.siteId !== user.siteId) {
          throw new Error('Cannot access roles from other sites');
        }
        if (!user.siteAdmin && (role.siteId !== user.siteId || role.departmentId !== user.departmentId)) {
          throw new Error('Cannot access roles outside your scope');
        }
      }

      return role;
    }
  },

  users: {
    create: async (userData, user) => {
      await delay(500);
      // Validate site and department access
      if (!hasAccessToSite(user, userData.siteId)) {
        throw new Error('Unauthorized to create users for this site');
      }
      if (!hasAccessToDepartment(user, userData.siteId, userData.departmentId)) {
        throw new Error('Unauthorized to create users for this department');
      }

      // Validate role assignment
      const roleToAssign = roles.find(r => r.id === userData.roleId);
      if (!roleToAssign || !canAssignRole(user, roleToAssign)) {
        throw new Error('Unauthorized to assign this role');
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        sysAdmin: false, // Cannot create sysAdmin users through API
        siteAdmin: user.siteAdmin && userData.siteId === user.siteId // siteAdmin only within same site
      };

      users.push(newUser);
      return { success: true, user: newUser };
    },

    update: async (userId, userData, user) => {
      await delay(500);
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) throw new Error('User not found');

      // Check access permissions
      if (!hasAccessToSite(user, targetUser.siteId)) {
        throw new Error('Unauthorized to modify users from this site');
      }
      if (!hasAccessToDepartment(user, targetUser.siteId, targetUser.departmentId)) {
        throw new Error('Unauthorized to modify users from this department');
      }

      // Check role change permission if role is being updated
      if (userData.roleId && userData.roleId !== targetUser.roleId) {
        const newRole = roles.find(r => r.id === userData.roleId);
        if (!newRole || !canAssignRole(user, newRole)) {
          throw new Error('Unauthorized to assign this role');
        }
      }

      const updatedUser = {
        ...targetUser,
        ...userData,
        // Preserve admin flags
        sysAdmin: targetUser.sysAdmin,
        siteAdmin: targetUser.siteAdmin
      };

      const index = users.findIndex(u => u.id === userId);
      users[index] = updatedUser;
      return { success: true, user: updatedUser };
    },

    list: async (filters = {}, user) => {
      await delay(300);
      let filteredUsers = [...users];

      // Filter based on user's access level
      if (!user.sysAdmin) {
        if (user.siteAdmin) {
          // Site admins can see all users in their site
          filteredUsers = filteredUsers.filter(u => u.siteId === user.siteId);
        } else {
          // Regular users can only see users in their department
          filteredUsers = filteredUsers.filter(u => 
            u.siteId === user.siteId && 
            u.departmentId === user.departmentId
          );
        }
      }

      // Apply additional filters
      if (filters.siteId) {
        filteredUsers = filteredUsers.filter(u => u.siteId === filters.siteId);
      }
      if (filters.departmentId) {
        filteredUsers = filteredUsers.filter(u => u.departmentId === filters.departmentId);
      }

      return filteredUsers;
    },

    remove: async (userId, user) => {
      await delay(500);
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) throw new Error('User not found');

      // Check access permissions
      if (!hasAccessToSite(user, targetUser.siteId)) {
        throw new Error('Unauthorized to delete users from this site');
      }
      if (!hasAccessToDepartment(user, targetUser.siteId, targetUser.departmentId)) {
        throw new Error('Unauthorized to delete users from this department');
      }

      // Cannot delete sysAdmin users through API
      if (targetUser.sysAdmin) {
        throw new Error('Cannot delete system administrator accounts');
      }

      const index = users.findIndex(u => u.id === userId);
      users.splice(index, 1);
      return { success: true };
    }
  }
};

export default mockApi;
