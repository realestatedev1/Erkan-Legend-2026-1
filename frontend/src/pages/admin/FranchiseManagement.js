import React, { useState, useEffect } from 'react';
import { franchiseAPI, authAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const FranchiseManagement = () => {
  const { user } = useAuth();
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState(null);
  const [formData, setFormData] = useState({ office_name: '', address: '', city: '', district: '', phone: '', email: '', manager_name: '' });

  useEffect(() => {
    if (user?.role === 'super_admin') loadFranchises();
  }, [user]);

  const loadFranchises = async () => {
    try {
      const response = await franchiseAPI.getAll(false);
      setFranchises(response.data || []);
    } catch (error) {
      console.error('Failed to load franchises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFranchise) {
        await franchiseAPI.update(editingFranchise.id, formData);
      } else {
        await franchiseAPI.create(formData);
      }
      setShowForm(false);
      setEditingFranchise(null);
      setFormData({ office_name: '', address: '', city: '', district: '', phone: '', email: '', manager_name: '' });
      loadFranchises();
    } catch (error) {
      console.error('Failed to save franchise:', error);
      alert('Kaydetme başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ofisi silmek istediğinize emin misiniz?')) return;
    try {
      await franchiseAPI.delete(id);
      loadFranchises();
    } catch (error) {
      console.error('Failed to delete franchise:', error);
      alert('Silme başarısız');
    }
  };

  if (user?.role !== 'super_admin') {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Erişim yok</div></div>;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Franchise Yönetimi</h1>
          <button onClick={() => { setShowForm(true); setEditingFranchise(null); setFormData({ office_name: '', address: '', city: '', district: '', phone: '', email: '', manager_name: '' }); }} className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition">Yeni Ofis Ekle</button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{editingFranchise ? 'Ofis Düzenle' : 'Yeni Ofis'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Ofis Adı" className="px-4 py-2 border rounded" value={formData.office_name} onChange={(e) => setFormData({ ...formData, office_name: e.target.value })} required />
                <input type="text" placeholder="Adres" className="px-4 py-2 border rounded" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
                <input type="text" placeholder="Şehir" className="px-4 py-2 border rounded" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                <input type="text" placeholder="İlçe" className="px-4 py-2 border rounded" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} required />
                <input type="tel" placeholder="Telefon" className="px-4 py-2 border rounded" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                <input type="email" placeholder="Email" className="px-4 py-2 border rounded" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <input type="text" placeholder="Yetkili Isim" className="px-4 py-2 border rounded" value={formData.manager_name} onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })} required />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Kaydet</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingFranchise(null); }} className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">Iptal</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {franchises.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Henüz ofis yok</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Ofis Adı</th>
                  <th className="text-left p-4">Konum</th>
                  <th className="text-left p-4">Iletisim</th>
                  <th className="text-left p-4">Yetkili</th>
                  <th className="text-left p-4">Işlemler</th>
                </tr>
              </thead>
              <tbody>
                {franchises.map((franchise) => (
                  <tr key={franchise.id} className="border-b">
                    <td className="p-4">{franchise.office_name}</td>
                    <td className="p-4">{franchise.city}, {franchise.district}</td>
                    <td className="p-4">{franchise.phone}<br /><span className="text-sm text-gray-600">{franchise.email}</span></td>
                    <td className="p-4">{franchise.manager_name}</td>
                    <td className="p-4">
                      <button onClick={() => { setEditingFranchise(franchise); setFormData({ office_name: franchise.office_name, address: franchise.address, city: franchise.city, district: franchise.district, phone: franchise.phone, email: franchise.email, manager_name: franchise.manager_name }); setShowForm(true); }} className="text-blue-600 hover:text-blue-800 mr-3">Düzenle</button>
                      <button onClick={() => handleDelete(franchise.id)} className="text-red-600 hover:text-red-800">Sil</button>
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

export default FranchiseManagement;
