// Mock data with relationships between entities
const sites = [
  {
    id: 'site1',
    name: 'Main Factory',
    domain: 'factory.goodierun.com',
    status: 'active'
  },
  {
    id: 'site2',
    name: 'Distribution Center',
    domain: 'dc.goodierun.com',
    status: 'active'
  }
];

const departments = [
  {
    id: 'dept1',
    name: 'Operations',
    siteId: 'site1'
  },
  {
    id: 'dept2',
    name: 'Maintenance',
    siteId: 'site1'
  },
  {
    id: 'dept3',
    name: 'Logistics',
    siteId: 'site2'
  }
];

const permissions = {
  READ: 'read',
  WRITE: 'write',
  NONE: 'none'
};

const roles = [
  {
    id: 'role1',
    name: 'Site Admin',
    permissions: {
      users: permissions.WRITE,
      departments: permissions.WRITE,
      maintenance: permissions.WRITE,
      inventory: permissions.WRITE,
      reports: permissions.WRITE
    }
  },
  {
    id: 'role2',
    name: 'Department Manager',
    permissions: {
      users: permissions.READ,
      departments: permissions.READ,
      maintenance: permissions.WRITE,
      inventory: permissions.WRITE,
      reports: permissions.READ
    }
  },
  {
    id: 'role3',
    name: 'Operator',
    permissions: {
      users: permissions.NONE,
      departments: permissions.READ,
      maintenance: permissions.READ,
      inventory: permissions.READ,
      reports: permissions.READ
    }
  }
];

const users = [
  {
    id: 'user1',
    username: 'admin',
    password: 'admin123', // In a real app, this would be hashed
    email: 'admin@goodierun.com',
    firstName: 'Admin',
    lastName: 'User',
    siteId: 'site1',
    departmentId: 'dept1',
    roleId: 'role1',
    status: 'active'
  },
  {
    id: 'user2',
    username: 'manager',
    password: 'manager123',
    email: 'manager@goodierun.com',
    firstName: 'Department',
    lastName: 'Manager',
    siteId: 'site1',
    departmentId: 'dept2',
    roleId: 'role2',
    status: 'active'
  },
  {
    id: 'user3',
    username: 'operator',
    password: 'operator123',
    email: 'operator@goodierun.com',
    firstName: 'Regular',
    lastName: 'Operator',
    siteId: 'site2',
    departmentId: 'dept3',
    roleId: 'role3',
    status: 'active'
  }
];

// Helper functions to simulate database operations
const findUserByCredentials = (username, password) => {
  return users.find(user => 
    user.username === username && 
    user.password === password && 
    user.status === 'active'
  );
};

const getUserRole = (userId) => {
  const user = users.find(u => u.id === userId);
  return user ? roles.find(r => r.id === user.roleId) : null;
};

const getUserSite = (userId) => {
  const user = users.find(u => u.id === userId);
  return user ? sites.find(s => s.id === user.siteId) : null;
};

const getUserDepartment = (userId) => {
  const user = users.find(u => u.id === userId);
  return user ? departments.find(d => d.id === user.departmentId) : null;
};

module.exports = {
  sites,
  departments,
  roles,
  users,
  permissions,
  findUserByCredentials,
  getUserRole,
  getUserSite,
  getUserDepartment
};
