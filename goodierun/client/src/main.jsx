import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PermissionsProvider } from './context/PermissionsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <PermissionsProvider>
          <App />
        </PermissionsProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
