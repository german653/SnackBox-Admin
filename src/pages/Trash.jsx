import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaTrashRestore, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';

const Trash = () => {
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchDeletedProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').eq('is_deleted', true); // Corregido: is_deleted
    if (error) {
      showNotification('Error al cargar la papelera.', 'error');
    } else {
      setDeletedProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  const handleRestore = async (id) => {
    const { error } = await supabase.from('products').update({ is_deleted: false }).eq('id', id); // Corregido: is_deleted
    if (error) {
      showNotification('Error al restaurar el producto.', 'error');
    } else {
      showNotification('Producto restaurado con éxito.');
      fetchDeletedProducts();
    }
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsModalOpen(true);
  };

  const confirmPermanentDelete = async () => {
    // Borrar la imagen del Storage
    if (productToDelete.image_urls && productToDelete.image_urls.length > 0) {
      const fileNames = productToDelete.image_urls.map(url => url.split('/').pop());
      const { error: storageError } = await supabase.storage.from('snackbox-products').remove(fileNames); // BUCKET CAMBIADO
      if (storageError) {
        showNotification('Error al borrar la imagen del producto.', 'error');
      }
    }
    
    // Borrar el producto de la base de datos
    const { error: dbError } = await supabase.from('products').delete().eq('id', productToDelete.id);
    if (dbError) {
      showNotification('Error al borrar el producto permanentemente.', 'error');
    } else {
      showNotification('Producto eliminado para siempre.');
      fetchDeletedProducts();
    }
    setIsModalOpen(false);
    setProductToDelete(null);
  };

  return (
    <div className="bg-admin-light min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-admin-primary font-semibold mb-6">
          <FaArrowLeft /> Volver al listado
        </Link>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-admin-primary">Papelera de Reciclaje</h1>
          {loading ? <p>Cargando...</p> : deletedProducts.length === 0 ? (
            <p className="text-gray-500">La papelera está vacía.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {deletedProducts.map(p => (
                <li key={p.id} className="p-4 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <img src={p.image_urls?.[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    <span className="ml-4 font-medium text-gray-800">{p.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => handleRestore(p.id)} className="flex items-center text-sm font-semibold text-green-600 hover:text-green-800">
                      <FaTrashRestore className="mr-2" /> Restaurar
                    </button>
                    <button onClick={() => openDeleteModal(p)} className="flex items-center text-sm font-semibold text-red-600 hover:text-red-800">
                      <FaTrash className="mr-2" /> Borrar para siempre
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmPermanentDelete}
        message={`¿Estás seguro de que quieres borrar "${productToDelete?.name}" PERMANENTEMENTE? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default Trash;