import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
        <i className={`${icon} text-white text-xl`}></i>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, getCurrentSite, getCurrentDepartment } = useAuth();
  const { hasAccess } = usePermissions();
  const { theme } = useTheme();
  const currentSite = getCurrentSite();
  const currentDepartment = getCurrentDepartment();

  const [stats, setStats] = useState({
    activeTasks: 0,
    completedTasks: 0,
    activeUsers: 0,
    departments: 0,
  });

  useEffect(() => {
    // In a real app, this would fetch actual statistics from the API
    setStats({
      activeTasks: 5,
      completedTasks: 12,
      activeUsers: 8,
      departments: 3,
    });
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {currentSite 
            ? `Managing ${currentDepartment ? currentDepartment.name : 'all departments'} at ${currentSite.name}`
            : 'System Administrator'}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Tasks"
          value={stats.activeTasks}
          icon="fas fa-tasks"
          color={`bg-${theme.primary}`}
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon="fas fa-check-circle"
          color={`bg-${theme.secondary}`}
        />
        {hasAccess('users', 'read') && (
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon="fas fa-users"
            color="bg-blue-500"
          />
        )}
        {hasAccess('departments', 'read') && (
          <StatCard
            title="Departments"
            value={stats.departments}
            icon="fas fa-building"
            color="bg-purple-500"
          />
        )}
      </div>

      {/* Quick Actions */}
      {hasAccess('tasks', 'write') && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
              <i className="fas fa-plus"></i>
              <span>Create New Task</span>
            </button>
            {hasAccess('reports', 'write') && (
              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                <i className="fas fa-file-alt"></i>
                <span>Generate Report</span>
              </button>
            )}
            {user?.isSiteManager && (
              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                <i className="fas fa-user-plus"></i>
                <span>Invite Team Member</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                type: 'task',
                action: 'completed',
                user: 'John Doe',
                time: '2 hours ago',
                description: 'Completed maintenance check on Gate A',
              },
              {
                type: 'user',
                action: 'joined',
                user: 'Sarah Smith',
                time: '4 hours ago',
                description: 'Joined the Operations team',
              },
              {
                type: 'report',
                action: 'generated',
                user: 'Mike Johnson',
                time: '6 hours ago',
                description: 'Generated monthly performance report',
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full ${theme.primary} flex items-center justify-center`}>
                  <i className={`fas fa-${activity.type === 'task' ? 'check' : activity.type === 'user' ? 'user' : 'file'} text-white`}></i>
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.description}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
