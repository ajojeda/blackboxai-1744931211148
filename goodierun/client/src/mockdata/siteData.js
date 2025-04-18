// Mock site data with appearance configurations
export const siteAppearances = {
  stadiumA: {
    name: 'Stadium A',
    primary: '#0047AB',
    secondary: '#F0C808',
    mainGrey: '#999999',
    accentGrey: '#444444',
    logoUrl: '/assets/stadiumA-logo.png',
  },
  stadiumB: {
    name: 'Stadium B',
    primary: '#006400',
    secondary: '#FFD700',
    mainGrey: '#888888',
    accentGrey: '#333333',
    logoUrl: '/assets/stadiumB-logo.png',
  },
};

// Mock departments data
export const departments = {
  stadiumA: [
    { id: 'sa-ops', name: 'Operations', siteId: 'stadiumA' },
    { id: 'sa-food', name: 'Food & Beverage', siteId: 'stadiumA' },
    { id: 'sa-maint', name: 'Maintenance', siteId: 'stadiumA' },
  ],
  stadiumB: [
    { id: 'sb-ops', name: 'Operations', siteId: 'stadiumB' },
    { id: 'sb-food', name: 'Food & Beverage', siteId: 'stadiumB' },
    { id: 'sb-maint', name: 'Maintenance', siteId: 'stadiumB' },
  ],
};

// Role definitions with module and field-level permissions
export const roles = {
  ADMIN: {
    name: 'Administrator',
    modules: ['all'],
    permissions: {
      all: 'write',
    },
  },
  SITE_MANAGER: {
    name: 'Site Manager',
    modules: ['dashboard', 'reports', 'users', 'tasks', 'departments'],
    permissions: {
      dashboard: 'write',
      reports: 'write',
      users: 'read',
      tasks: 'write',
      departments: 'write',
      'users.personal': 'read',
      'users.role': 'hidden',
    },
  },
  DEPT_MANAGER: {
    name: 'Department Manager',
    modules: ['dashboard', 'tasks', 'reports'],
    permissions: {
      dashboard: 'read',
      tasks: 'write',
      reports: 'read',
      'tasks.department': 'write',
      'reports.department': 'read',
    },
  },
  OPERATOR: {
    name: 'Operator',
    modules: ['dashboard', 'tasks'],
    permissions: {
      dashboard: 'read',
      tasks: 'write',
      'tasks.personal': 'write',
      'tasks.department': 'read',
    },
  },
};

// Mock users with site and department assignments
export const users = [
  {
    id: 'admin1',
    username: 'admin',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Admin',
    role: 'ADMIN',
    siteId: null, // System admin has access to all sites
    departmentId: null,
  },
  {
    id: 'sm-sa1',
    username: 'manager.stadiumA',
    password: 'manager123',
    firstName: 'John',
    lastName: 'Manager',
    role: 'SITE_MANAGER',
    siteId: 'stadiumA',
    departmentId: null,
  },
  {
    id: 'dm-sa-ops1',
    username: 'ops.manager.stadiumA',
    password: 'manager123',
    firstName: 'Sarah',
    lastName: 'Operations',
    role: 'DEPT_MANAGER',
    siteId: 'stadiumA',
    departmentId: 'sa-ops',
  },
  {
    id: 'op-sa-ops1',
    username: 'operator1.stadiumA',
    password: 'operator123',
    firstName: 'Mike',
    lastName: 'Operator',
    role: 'OPERATOR',
    siteId: 'stadiumA',
    departmentId: 'sa-ops',
  },
];

// Helper function to get departments by site
export const getDepartmentsBySite = (siteId) => {
  return departments[siteId] || [];
};

// Helper function to get site appearance
export const getSiteAppearance = (siteId) => {
  return siteAppearances[siteId] || null;
};

// Helper function to get user's accessible sites
export const getUserSites = (user) => {
  if (user.role === 'ADMIN') {
    return Object.keys(siteAppearances).map(siteId => ({
      id: siteId,
      ...siteAppearances[siteId],
    }));
  }
  if (user.siteId) {
    return [{
      id: user.siteId,
      ...siteAppearances[user.siteId],
    }];
  }
  return [];
};

// Helper function to get user's accessible departments
export const getUserDepartments = (user) => {
  if (user.role === 'ADMIN') {
    return Object.values(departments).flat();
  }
  if (user.role === 'SITE_MANAGER' && user.siteId) {
    return departments[user.siteId] || [];
  }
  if (user.departmentId) {
    const dept = Object.values(departments)
      .flat()
      .find(d => d.id === user.departmentId);
    return dept ? [dept] : [];
  }
  return [];
};
