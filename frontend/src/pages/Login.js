import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/admin');
    } catch (err) {
      setError('Kullanıcı adı veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <img 
            src="/logo.jpg" 
            alt="Legend Cities" 
            className="h-20 w-auto mx-auto mb-4"
          />
          <h2 className="text-3xl font-bold text-gray-800">Admin Girişi</h2>
          <p className="text-gray-600 mt-2">Legend Cities Yönetim Paneli</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-testid="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Kullanıcı Adı</label>
            <input
              type="text"
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              data-testid="login-username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Şifre</label>
            <input
              type="password"
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              data-testid="login-password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 transition font-semibold disabled:bg-gray-400"
            disabled={loading}
            data-testid="login-submit"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo Kullanıcılar:</p>
          <p className="mt-2">Super Admin: admin / LegendCities2025!</p>
          <p>Franchise: etiler / franchise123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
