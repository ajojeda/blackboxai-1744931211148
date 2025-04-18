# GoodieRun Platform - Implementation Plan

## Project Structure
```
/goodierun
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Route-based page components
│   │   ├── layouts/      # Layout components (Dashboard, Auth)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React context providers
│   │   ├── services/     # API service layer
│   │   ├── utils/        # Helper functions
│   │   └── styles/       # Global styles and Tailwind config
│   └── public/           # Static assets
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── routes/       # Express route handlers
│   │   ├── middleware/   # Custom middleware (auth, validation)
│   │   ├── services/     # Business logic layer
│   │   ├── utils/        # Helper functions
│   │   └── validators/   # Request validation schemas
├── mockdata/             # Mock data layer
│   ├── users.js         # User records
│   ├── sites.js         # Site configurations
│   ├── departments.js   # Department structures
│   ├── roles.js         # Role definitions
│   └── permissions.js   # Permission mappings
└── config/              # Shared configuration
    └── constants.js     # Environment toggles and constants
```

## Implementation Phases

### Phase 1: Project Setup
1. Initialize project structure
2. Set up Express backend with basic routing
3. Create React frontend with Vite
4. Configure Tailwind CSS
5. Set up mock data structure

### Phase 2: Authentication System
1. Implement JWT-based auth system
2. Create login page
3. Set up protected routes
4. Implement auth middleware

### Phase 3: Mock Data Layer
1. Create mock data structures for:
   - Users (with site, department, role relations)
   - Sites
   - Departments
   - Roles
   - RolePermissions
2. Implement data access layer
3. Add environment toggle for mock/real DB

### Phase 4: Frontend Structure
1. Create dashboard layout
2. Implement collapsible sidebar
3. Set up React Router
4. Create basic page components
5. Implement role-based menu system

### Phase 5: Permission System
1. Implement permission checking
2. Create role-based access control
3. Add field-level permissions
4. Integrate with sidebar menu

## Technical Specifications

### Authentication
- JWT-based authentication
- Token storage in localStorage
- Protected route HOC
- Auth context provider

### Data Structure
```typescript
interface User {
  id: string;
  username: string;
  password: string; // Hashed
  siteId: string;
  departmentId: string;
  roleId: string;
}

interface Site {
  id: string;
  name: string;
  domain: string;
}

interface Department {
  id: string;
  name: string;
  siteId: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  resource: string;
  access: 'read' | 'write' | 'none';
}
```

### API Routes
- /api/auth/login
- /api/auth/verify
- /api/users
- /api/sites
- /api/departments
- /api/roles
- /api/permissions

Would you like me to proceed with this implementation plan?
