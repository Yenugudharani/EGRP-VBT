import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserRole } from './types';

const PrivateRoute: React.FC<{ children: React.ReactElement, role: UserRole }> = ({ children, role }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (currentUser.role !== role) {
    // If user is logged in but tries to access wrong role route, redirect to their own dashboard
    if (currentUser.role === UserRole.STUDENT) return <Navigate to="/student" replace />;
    if (currentUser.role === UserRole.FACULTY) return <Navigate to="/faculty" replace />;
    if (currentUser.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/student" 
        element={
          <PrivateRoute role={UserRole.STUDENT}>
            <StudentDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/faculty" 
        element={
          <PrivateRoute role={UserRole.FACULTY}>
            <FacultyDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <PrivateRoute role={UserRole.ADMIN}>
            <AdminDashboard />
          </PrivateRoute>
        } 
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <MainRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;