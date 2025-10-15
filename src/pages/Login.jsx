import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import { useNotification } from '../context/NotificationContext';
import logo from '../assets/logo.png'; // Asegúrate de tener el logo en src/assets

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showNotification('Email o contraseña incorrectos.', 'error');
    } else {
      sessionStorage.setItem('isAuthenticated', 'true'); // Guardar sesión
      setIsAuthenticated(true);
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-admin-light">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img src={logo} alt="SnackBox Logo" className="w-24 h-auto" />
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Panel de Administración</h1>
          <p className="text-gray-500">SnackBox</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-600 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-secondary"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-secondary"
              required
            />
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full py-3 mt-4 font-bold text-white bg-admin-primary rounded-lg hover:bg-admin-secondary transition-colors disabled:bg-gray-400">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;