// src/App.jsx
import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importa los componentes de las páginas del admin
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductForm from './pages/ProductForm';
import Trash from './pages/Trash';
import SalesDashboard from './pages/SalesDashboard'; // Importa la nueva página


// Importa el componente de seguridad
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Este estado controla si el usuario ha iniciado sesión o no.
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  const router = createBrowserRouter([
    // Ruta para la página de Login
    {
      path: '/login',
      element: <Login setIsAuthenticated={setIsAuthenticated} />,
    },
    // Rutas protegidas del panel de administración
    {
      path: '/',
      element: <ProtectedRoute isAuthenticated={isAuthenticated} />,
      children: [
        { index: true, element: <Dashboard setIsAuthenticated={setIsAuthenticated} /> },
        { path: 'sales', element: <SalesDashboard /> }, // <-- AÑADE ESTA RUTA
        { path: 'add-product', element: <ProductForm /> },
        { path: 'edit-product/:id', element: <ProductForm /> },
        { path: 'trash', element: <Trash /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;