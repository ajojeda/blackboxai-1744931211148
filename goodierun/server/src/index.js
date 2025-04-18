const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { findUserByCredentials, getUserRole } = require('../../mockdata');

const app = express();

// Environment variables (in a real app, these would be in .env)
const JWT_SECRET = 'your-secret-key';
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const user = findUserByCredentials(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const role = getUserRole(user.id);
  
  // Create JWT token
  const token = jwt.sign(
    { 
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      siteId: user.siteId,
      departmentId: user.departmentId
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: {
        id: role.id,
        name: role.name,
        permissions: role.permissions
      }
    }
  });
});

// Protected route example
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = req.user;
  res.json({ user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
