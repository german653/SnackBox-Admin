// admin-snackbox/src/pages/SalesDashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileInvoiceDollar, FaCalendarDay, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';

const SalesDashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  
  // --- ESTADO PARA CONTROLAR EL DESPLIEGUE ---
  // Guarda el ID de la venta que está actualmente abierta.
  const [expandedSale, setExpandedSale] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select(`*, sale_items (quantity, price_at_sale, products ( name, image_urls ))`)
      .order('created_at', { ascending: false });

    if (error) {
      showNotification('Error al cargar las ventas.', 'error');
    } else {
      setSales(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // --- FUNCIÓN PARA MOSTRAR/OCULTAR DETALLES ---
  const toggleSaleDetails = (saleId) => {
    // Si la venta clickeada ya está abierta, la cerramos (poniendo el estado en null).
    // Si no, la abrimos (poniendo su ID en el estado).
    setExpandedSale(expandedSale === saleId ? null : saleId);
  };

  const openDeleteModal = (sale) => {
    setSaleToDelete(sale);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!saleToDelete) return;

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', saleToDelete.id);

    if (error) {
      showNotification('Error al eliminar la venta.', 'error');
    } else {
      showNotification('Venta eliminada con éxito.');
      fetchSales();
    }

    setIsModalOpen(false);
    setSaleToDelete(null);
  };

  const salesToday = sales.filter(sale => 
    new Date(sale.created_at).toLocaleDateString() === new Date().toLocaleDateString()
  );

  const totalRevenueToday = salesToday.reduce((acc, sale) => acc + sale.total_amount, 0);

  return (
    <div className="bg-admin-light min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-admin-primary font-semibold mb-6">
          <FaArrowLeft /> Volver a Productos
        </Link>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-admin-primary">Historial de Ventas</h1>
          
          {/* Resumen del día (sin cambios) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-100 p-4 rounded-lg flex items-center gap-4">
              <FaFileInvoiceDollar className="text-green-600 text-3xl"/>
              <div>
                <p className="text-gray-600">Ventas de Hoy</p>
                <p className="text-2xl font-bold text-green-700">{salesToday.length}</p>
              </div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg flex items-center gap-4">
              <FaCalendarDay className="text-blue-600 text-3xl"/>
              <div>
                <p className="text-gray-600">Ingresos de Hoy</p>
                <p className="text-2xl font-bold text-blue-700">${totalRevenueToday.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {loading ? <p>Cargando ventas...</p> : sales.length === 0 ? (
            <p className="text-gray-500">Aún no se han registrado ventas.</p>
          ) : (
            <div className="space-y-4">
              {sales.map(sale => (
                <div key={sale.id} className="border rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                  {/* --- Contenedor principal de la venta (ahora clickeable) --- */}
                  <div 
                    onClick={() => toggleSaleDetails(sale.id)} 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex-grow">
                      <p className="font-bold text-gray-800">{sale.customer_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(sale.created_at).toLocaleString()} - {sale.payment_method}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-lg text-admin-secondary">${sale.total_amount}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(sale); }} 
                        className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Eliminar Venta"
                      >
                        <FaTrash />
                      </button>
                      {/* --- Icono de flecha que indica el estado --- */}
                      <span className="text-gray-400">
                        {expandedSale === sale.id ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </div>
                  </div>
                  {/* --- Contenedor de detalles que se muestra condicionalmente --- */}
                  {expandedSale === sale.id && (
                    <div className="p-4 bg-gray-50 border-t">
                      <h4 className="font-semibold mb-2 text-gray-700">Productos del pedido:</h4>
                      <ul className="space-y-3">
                        {sale.sale_items.map(item => (
                          <li key={item.products.name} className="flex items-center gap-4 text-sm">
                            <img src={item.products.image_urls?.[0]} alt={item.products.name} className="w-12 h-12 rounded-md object-cover bg-gray-200"/>
                            <span className="font-semibold text-gray-800 flex-grow">{item.products.name}</span>
                            <span className="text-gray-600">(x{item.quantity})</span>
                            <span className="ml-auto font-medium text-gray-700">${(item.price_at_sale * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        message={`¿Estás seguro de que quieres eliminar la venta de "${saleToDelete?.customer_name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default SalesDashboard;