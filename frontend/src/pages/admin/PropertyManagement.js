import React, { useState, useEffect } from 'react';
import { propertyAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const PropertyManagement = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', property_type: 'sale', category: 'residential',
    price: '', city: '', district: '', address: '', area_sqm: '', rooms: '',
    images: []
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const params = user?.role === 'franchise_admin' ? { franchise_id: user.franchise_id } : {};
      const response = await propertyAPI.getAll({ ...params, limit: 100 });
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let propertyId;
      if (editingProperty) {
        await propertyAPI.update(editingProperty.id, formData);
        propertyId = editingProperty.id;
      } else {
        const response = await propertyAPI.create(formData);
        propertyId = response.data.property_id;
      }
      
      setShowForm(false);
      setEditingProperty(null);
      setFormData({ 
        title: '', description: '', property_type: 'sale', category: 'residential', 
        price: '', city: '', district: '', address: '', area_sqm: '', rooms: '', images: []
      });
      loadProperties();
      
      alert('İlan başarıyla kaydedildi!');
    } catch (error) {
      console.error('Failed to save property:', error);
      alert('Kaydetme başarısız: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleImageUpload = async (e, propertyId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await propertyAPI.uploadImage(propertyId, file);
      }
      
      alert(`${files.length} resim başarıyla yüklendi!`);
      loadProperties();
      
      // Update form if editing
      if (editingProperty && editingProperty.id === propertyId) {
        const response = await propertyAPI.getById(propertyId);
        setFormData({ ...formData, images: response.data.images || [] });
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Resim yükleme başarısız: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('İlanı silmek istediğinize emin misiniz?')) return;
    try {
      await propertyAPI.delete(id);
      loadProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Silme başarısız');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      property_type: property.property_type,
      category: property.category,
      price: property.price,
      city: property.city,
      district: property.district,
      address: property.address,
      area_sqm: property.area_sqm || '',
      rooms: property.rooms || '',
      images: property.images || []
    });
    setShowForm(true);
  };

  const handleRemoveImage = async (imageUrl) => {
    if (!editingProperty) return;
    
    const updatedImages = formData.images.filter(img => img !== imageUrl);
    
    try {
      await propertyAPI.update(editingProperty.id, { images: updatedImages });
      setFormData({ ...formData, images: updatedImages });
      alert('Resim kaldırıldı!');
      loadProperties();
    } catch (error) {
      console.error('Failed to remove image:', error);
      alert('Resim kaldırma başarısız');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">İlan Yönetimi</h1>
          <button 
            onClick={() => { 
              setShowForm(true); 
              setEditingProperty(null); 
              setFormData({ 
                title: '', description: '', property_type: 'sale', category: 'residential', 
                price: '', city: '', district: '', address: '', area_sqm: '', rooms: '', images: []
              }); 
            }} 
            className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition"
            data-testid="add-property-button"
          >
            Yeni İlan Ekle
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{editingProperty ? 'İlan Düzenle' : 'Yeni İlan'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  placeholder="Başlık *" 
                  className="px-4 py-2 border rounded" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  required 
                />
                <input 
                  type="number" 
                  placeholder="Fiyat *" 
                  className="px-4 py-2 border rounded" 
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                  required 
                />
                <select 
                  className="px-4 py-2 border rounded" 
                  value={formData.property_type} 
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                >
                  <option value="sale">Satılık</option>
                  <option value="rent">Kiralık</option>
                </select>
                <select 
                  className="px-4 py-2 border rounded" 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="residential">Konut</option>
                  <option value="commercial">Ticari</option>
                  <option value="land">Arsa</option>
                  <option value="tourism">Turizm</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Şehir *" 
                  className="px-4 py-2 border rounded" 
                  value={formData.city} 
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="İlçe *" 
                  className="px-4 py-2 border rounded" 
                  value={formData.district} 
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Adres *" 
                  className="px-4 py-2 border rounded col-span-2" 
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                  required 
                />
                <input 
                  type="number" 
                  placeholder="Alan (m²)" 
                  className="px-4 py-2 border rounded" 
                  value={formData.area_sqm} 
                  onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })} 
                />
                <input 
                  type="text" 
                  placeholder="Oda Sayısı (örn: 2+1)" 
                  className="px-4 py-2 border rounded" 
                  value={formData.rooms} 
                  onChange={(e) => setFormData({ ...formData, rooms: e.target.value })} 
                />
              </div>
              
              <textarea 
                placeholder="Açıklama *" 
                className="w-full px-4 py-2 border rounded mb-4" 
                rows="4" 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                required
              ></textarea>

              {/* Image Section for Editing */}
              {editingProperty && (
                <div className="mb-4 p-4 bg-gray-50 rounded">
                  <h3 className="font-bold text-lg mb-3">İlan Görselleri</h3>
                  
                  {/* Existing Images */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={`${process.env.REACT_APP_BACKEND_URL}${img}`}
                            alt={`Property ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload New Images */}
                  <div>
                    <label className="block mb-2 text-sm font-semibold">Yeni Resim Ekle:</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, editingProperty.id)}
                      disabled={uploadingImages}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                    {uploadingImages && <p className="text-sm text-gray-600 mt-2">Resimler yükleniyor...</p>}
                  </div>
                </div>
              )}

              {!editingProperty && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ℹ️ <strong>Not:</strong> İlanı önce kaydedin, sonra resim ekleyebilirsiniz.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  type="submit" 
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                  data-testid="save-property-button"
                >
                  Kaydet
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowForm(false); setEditingProperty(null); }} 
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {properties.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Henüz ilan yok</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Resim</th>
                  <th className="text-left p-4">Başlık</th>
                  <th className="text-left p-4">Konum</th>
                  <th className="text-left p-4">Fiyat</th>
                  <th className="text-left p-4">Durum</th>
                  <th className="text-left p-4">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b">
                    <td className="p-4">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={`${process.env.REACT_APP_BACKEND_URL}${property.images[0]}`}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          Resim Yok
                        </div>
                      )}
                    </td>
                    <td className="p-4">{property.title}</td>
                    <td className="p-4">{property.city}, {property.district}</td>
                    <td className="p-4">{property.price.toLocaleString('tr-TR')} TRY</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${property.active ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                        {property.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleEdit(property)} 
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(property.id)} 
                        className="text-red-600 hover:text-red-800"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;
