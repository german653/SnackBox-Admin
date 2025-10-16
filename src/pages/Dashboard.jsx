import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSignOutAlt, FaChartLine } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';

const Dashboard = ({ setIsAuthenticated }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
      
    if (error) {
      showNotification('Error al cargar productos.', 'error');
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleToggleStock = async (id, currentStatus) => {
    const { error } = await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
    if (error) {
      showNotification('Error al cambiar la disponibilidad.', 'error');
    } else {
      showNotification(`Disponibilidad actualizada.`);
      fetchProducts();
    }
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const { error } = await supabase.from('products').update({ is_deleted: true }).eq('id', productToDelete.id);
    if (error) {
      showNotification('Error al mover a la papelera.', 'error');
    } else {
      showNotification(`"${productToDelete.name}" movido a la papelera.`);
      fetchProducts();
    }
    setIsModalOpen(false);
    setProductToDelete(null);
  };

  return (
    <div className="min-h-screen bg-admin-light">
      {/* --- CABECERA REESTRUCTURADA --- */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          
          {/* Grupo de Acciones a la Izquierda */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/sales" className="text-gray-600 font-semibold flex items-center gap-2 hover:text-admin-primary transition-colors text-sm sm:text-base">
              <FaChartLine /> <span>Ventas</span>
            </Link>
            <Link to="/add-product" className="bg-admin-secondary text-white font-semibold px-3 py-2 sm:px-4 rounded-lg flex items-center gap-2 hover:bg-orange-500 transition-colors text-sm sm:text-base">
              <FaPlus /> <span>Añadir</span>
            </Link>
          </div>

          {/* Título (ahora en el centro) */}
          <h1 className="text-xl sm:text-2xl font-bold text-admin-primary order-first w-full text-center md:order-none md:w-auto">
            Mis Productos
          </h1>

          {/* Grupo de Utilidades a la Derecha */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/trash" className="text-gray-500 hover:text-red-500 p-2" title="Papelera">
              <FaTrash size={20} />
            </Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-admin-primary p-2" title="Cerrar Sesión">
              <FaSignOutAlt size={20} />
            </button>
          </div>

        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {loading ? <p className="p-4">Cargando productos...</p> : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={p.image_urls?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div className="ml-4">
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-sm text-gray-500">{p.categories?.name || 'Sin categoría'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {p.promo_price && p.promo_price < p.price ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-gray-400 line-through">${p.price}</span>
                          <span className="text-red-500 font-bold">${p.promo_price}</span>
                        </div>
                      ) : (
                        <span>${p.price}</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center font-bold ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {p.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button onClick={() => handleToggleStock(p.id, p.in_stock)} className="transform hover:scale-110 transition-transform">
                        {p.in_stock ? <FaToggleOn size={28} className="text-green-500" /> : <FaToggleOff size={28} className="text-gray-300" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/edit-product/${p.id}`} className="text-blue-600 hover:text-blue-900 mr-4"><FaEdit /></Link>
                      <button onClick={() => openDeleteModal(p)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        message={`¿Mover "${productToDelete?.name}" a la papelera?`}
      />
    </div>
  );
};

export default Dashboard;