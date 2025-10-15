// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    // Si el usuario no está autenticado, lo redirige a la página de login.
    return <Navigate to="/login" replace />;
  }
  // Si está autenticado, muestra la página que corresponde (Dashboard, etc.).
  return <Outlet />;
};

export default ProtectedRoute;