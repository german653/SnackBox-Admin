import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';

const ProductForm = () => {
  const [product, setProduct] = useState({ name: '', description: '', price: '', promo_price: '', stock: 0, in_stock: true, category_id: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCategories();

    if (id) {
      const fetchProduct = async () => {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setProduct(data);
          setExistingImages(data.image_urls || []);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) return;
    const { data, error } = await supabase.from('categories').insert({ name: newCategory.trim() }).select().single();
    if (error) {
      showNotification('La categoría ya existe o hubo un error.', 'error');
    } else {
      setCategories(prev => [...prev, data]);
      setProduct(prev => ({ ...prev, category_id: data.id }));
      setNewCategory('');
      showNotification('Categoría añadida.');
    }
  };

  const uploadImages = async (files) => {
    const uploadPromises = files.map(file => {
      const fileName = `${uuidv4()}-${file.name}`;
      return supabase.storage.from('snackbox-products').upload(fileName, file);
    });
    const results = await Promise.all(uploadPromises);
    const urls = [];
    for (const result of results) {
        if (result.error) throw result.error;
        const { data: urlData } = supabase.storage.from('snackbox-products').getPublicUrl(result.data.path);
        urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let finalImageUrls = [...existingImages];
    if (imageFiles.length > 0) {
      try {
        const newUrls = await uploadImages(Array.from(imageFiles));
        finalImageUrls = [...finalImageUrls, ...newUrls];
      } catch (error) {
        showNotification('Error al subir las imágenes.', 'error'); setLoading(false); return;
      }
    }
    
    const productData = { 
      ...product, 
      image_urls: finalImageUrls,
      promo_price: product.promo_price || null 
    };

    const { error } = id
      ? await supabase.from('products').update(productData).eq('id', id)
      : await supabase.from('products').insert(productData);
      
    if (error) {
      showNotification('Error al guardar el producto: ' + error.message, 'error');
    } else {
      showNotification(`Producto ${id ? 'actualizado' : 'creado'} con éxito.`); navigate('/');
    }
    setLoading(false);
  };
  
  const handleRemoveExistingImage = (urlToRemove) => {
    setExistingImages(prev => prev.filter(url => url !== urlToRemove));
  };

  return (
    <div className="bg-admin-light min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-gray-600 font-semibold mb-6"><FaArrowLeft /> Volver</Link>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          <h1 className="text-2xl font-bold text-admin-primary">{id ? 'Editar Producto' : 'Añadir Producto'}</h1>
          <input name="name" value={product.name} onChange={handleChange} placeholder="Nombre del producto" className="w-full p-3 border rounded-md" required />
          <textarea name="description" value={product.description || ''} onChange={handleChange} placeholder="Descripción" className="w-full p-3 border rounded-md" rows="4"></textarea>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input type="number" step="0.01" name="price" value={product.price} onChange={handleChange} placeholder="Precio Original" className="w-full p-3 border rounded-md" required />
            <input type="number" step="0.01" name="promo_price" value={product.promo_price || ''} onChange={handleChange} placeholder="Precio Promoción (Opcional)" className="w-full p-3 border rounded-md" />
          </div>

          <input type="number" name="stock" value={product.stock} onChange={handleChange} placeholder="Cantidad en Stock" className="w-full p-3 border rounded-md" required />

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
            <div className="flex gap-2">
              <select name="category_id" value={product.category_id} onChange={handleChange} className="flex-grow p-3 border rounded-md" required>
                <option value="" disabled>Selecciona una categoría</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="mt-2 flex gap-2">
              <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="O crea una nueva" className="flex-grow p-2 border rounded-md"/>
              <button type="button" onClick={handleAddNewCategory} className="bg-gray-200 px-4 rounded-md font-semibold">Crear</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Imágenes</label>
            <input type="file" onChange={e => setImageFiles(e.target.files)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-orange-50 file:text-admin-secondary" multiple />
            <div className="mt-4 flex flex-wrap gap-4">
              {existingImages.map(url => (
                <div key={url} className="relative"><img src={url} alt="Previa" className="w-24 h-24 rounded-lg object-cover" /><button type="button" onClick={() => handleRemoveExistingImage(url)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FaTrash size={12} /></button></div>
              ))}
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input type="checkbox" name="in_stock" checked={product.in_stock} onChange={handleChange} id="in_stock" className="h-5 w-5 rounded text-admin-secondary focus:ring-admin-secondary" />
            <label htmlFor="in_stock" className="ml-3 block text-sm font-bold text-gray-700">Disponible (mostrar en tienda)</label>
          </div>

          <div className="pt-8 mt-6 border-t"><button type="submit" disabled={loading} className="w-full bg-admin-primary hover:bg-admin-secondary text-white font-bold py-3 rounded-lg">{loading ? 'Guardando...' : 'Guardar Producto'}</button></div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;