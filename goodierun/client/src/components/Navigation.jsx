import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScopedAccess } from '../context/ScopedAccessContext';
import { useTheme } from '../context/ThemeContext';

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isModuleVisible, currentScope } = useScopedAccess();
  const { theme } = useTheme();

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = sessionStorage.getItem('sidebarCollapsed');
    return stored ? JSON.parse(stored) : false;
  });

  // Expanded menu sections
  const [expandedSections, setExpandedSections] = useState({});

  // Save collapse state to session storage
  useEffect(() => {
    sessionStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const navigationItems = [
    {
      id: 'dashboard',
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'fas fa-th-large',
      module: 'Dashboard'
    },
    {
      id: 'sites',
      label: 'Sites',
      icon: 'fas fa-building',
      module: 'Site Management',
      children: [
        { path: '/admin/sites', label: 'All Sites', icon: 'fas fa-list', module: 'Site Management' },
        { path: '/admin/sites/new', label: 'Add Site', icon: 'fas fa-plus', module: 'Site Management' }
      ]
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: 'fas fa-tasks',
      module: 'Tasks',
      children: [
        { path: '/tasks', label: 'All Tasks', icon: 'fas fa-list', module: 'Tasks' },
        { path: '/tasks/new', label: 'New Task', icon: 'fas fa-plus', module: 'Tasks' },
        { path: '/tasks/calendar', label: 'Calendar', icon: 'fas fa-calendar', module: 'Tasks' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'fas fa-chart-bar',
      module: 'Reports',
      children: [
        { path: '/reports/daily', label: 'Daily Reports', icon: 'fas fa-sun', module: 'Reports' },
        { path: '/reports/weekly', label: 'Weekly Reports', icon: 'fas fa-calendar-week', module: 'Reports' },
        { path: '/reports/monthly', label: 'Monthly Reports', icon: 'fas fa-calendar-alt', module: 'Reports' }
      ]
    }
  ];

  const adminItems = [
    {
      id: 'roles',
      path: '/admin/roles',
      label: 'Role Management',
      icon: 'fas fa-user-shield',
      module: 'Role Management'
    },
    {
      id: 'user-assignments',
      path: '/admin/user-assignments',
      label: 'User Assignments',
      icon: 'fas fa-user-cog',
      module: 'User Management'
    },
    {
      id: 'appearance',
      path: '/admin/appearance',
      label: 'Site Appearance',
      icon: 'fas fa-palette',
      module: 'Site Management'
    }
  ];

  const isVisible = (item) => {
    return isModuleVisible(item.module);
  };

  const isActive = (path) => location.pathname === path;

  const getLinkStyle = (isActivePath) => `
    flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} 
    px-3 py-2 rounded-lg transition-colors relative group
    ${isActivePath 
      ? 'border-l-4 border-white bg-white/10 text-white' 
      : 'text-gray-300 hover:bg-white/5 border-l-4 border-transparent'
    }
  `;

  const renderMenuItem = (item) => {
    if (!isVisible(item)) return null;

    if (item.children) {
      const isExpanded = expandedSections[item.id];
      const hasActiveChild = item.children.some(child => isActive(child.path));

      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleSection(item.id)}
            className={`w-full ${getLinkStyle(hasActiveChild)}`}
          >
            <i className={item.icon}></i>
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-sm`}></i>
              </>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {item.label}
              </span>
            )}
          </button>
          {isExpanded && (
            <div className={`space-y-1 ${isCollapsed ? 'px-2' : 'pl-4'}`}>
              {item.children.map(child => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={getLinkStyle(isActive(child.path))}
                >
                  <i className={child.icon}></i>
                  {!isCollapsed && <span>{child.label}</span>}
                  {isCollapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {child.label}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={getLinkStyle(isActive(item.path))}
      >
        <i className={item.icon}></i>
        {!isCollapsed && <span>{item.label}</span>}
        {isCollapsed && (
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className={`mt-4 px-4 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} bg-[#1F1F1F] min-h-screen`}>
      {/* Current Scope Info */}
      {currentScope && !isCollapsed && (
        <div className="mb-6 px-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-gray-100">
              {currentScope.site?.name}
            </h2>
            <p className="text-xs text-gray-400">
              {currentScope.department?.name}
            </p>
            <p className="text-xs text-gray-400">
              {currentScope.role?.name}
            </p>
          </div>
        </div>
      )}

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="mb-4 p-2 rounded-lg hover:bg-white/5 w-full flex items-center justify-center"
      >
        <i className={`fas fa-bars text-gray-300 ${isCollapsed ? '' : 'rotate-90'}`}></i>
      </button>

      <div className="space-y-2">
        {/* Main Navigation */}
        {navigationItems.map(renderMenuItem)}

        {/* Admin Section */}
        {adminItems.some(item => isModuleVisible(item.module)) && (
          <>
            <div className={`mt-6 mb-2 ${isCollapsed ? 'px-0' : 'px-3'}`}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administration
                </h3>
              )}
            </div>
            {adminItems.map(renderMenuItem)}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
