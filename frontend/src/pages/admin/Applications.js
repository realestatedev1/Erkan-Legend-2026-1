import React, { useState, useEffect } from 'react';
import { careerAPI, franchiseApplicationAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const Applications = () => {
  const { user } = useAuth();
  const [careerApplications, setCareerApplications] = useState([]);
  const [franchiseApplications, setFranchiseApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('career');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'super_admin') loadApplications();
  }, [user]);

  const loadApplications = async () => {
    try {
      const [careerRes, franchiseRes] = await Promise.all([
        careerAPI.getApplications(),
        franchiseApplicationAPI.getApplications()
      ]);
      setCareerApplications(careerRes.data || []);
      setFranchiseApplications(franchiseRes.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Erişim yok</div></div>;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Başvurular</h1>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab('career')} className={`px-6 py-3 rounded ${activeTab === 'career' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}>Kariyer Başvuruları ({careerApplications.length})</button>
          <button onClick={() => setActiveTab('franchise')} className={`px-6 py-3 rounded ${activeTab === 'franchise' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}>Franchise Başvuruları ({franchiseApplications.length})</button>
        </div>

        {activeTab === 'career' && (
          <div className="bg-white rounded-lg shadow-md">
            {careerApplications.length === 0 ? (
              <div className="p-8 text-center text-gray-600">Henüz başvuru yok</div>
            ) : (
              <div className="divide-y">
                {careerApplications.map((app) => (
                  <div key={app.id} className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{app.name}</h3>
                        <p className="text-sm text-gray-600">{app.email} • {app.phone}</p>
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">{app.position}</span>
                    </div>
                    {app.experience && <p className="text-sm text-gray-700 mt-2"><strong>Deneyim:</strong> {app.experience}</p>}
                    {app.education && <p className="text-sm text-gray-700"><strong>Eğitim:</strong> {app.education}</p>}
                    {app.cover_letter && <p className="text-gray-700 mt-3">{app.cover_letter}</p>}
                    <p className="text-xs text-gray-500 mt-2">{new Date(app.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'franchise' && (
          <div className="bg-white rounded-lg shadow-md">
            {franchiseApplications.length === 0 ? (
              <div className="p-8 text-center text-gray-600">Henüz başvuru yok</div>
            ) : (
              <div className="divide-y">
                {franchiseApplications.map((app) => (
                  <div key={app.id} className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{app.name}</h3>
                        <p className="text-sm text-gray-600">{app.email} • {app.phone}</p>
                      </div>
                      <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded">{app.city}</span>
                    </div>
                    {app.experience && <p className="text-sm text-gray-700 mt-2"><strong>Deneyim:</strong> {app.experience}</p>}
                    {app.investment_amount && <p className="text-sm text-gray-700"><strong>Yatırım Bütçesi:</strong> {app.investment_amount}</p>}
                    {app.message && <p className="text-gray-700 mt-3">{app.message}</p>}
                    <p className="text-xs text-gray-500 mt-2">{new Date(app.created_at).toLocaleString('tr-TR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
