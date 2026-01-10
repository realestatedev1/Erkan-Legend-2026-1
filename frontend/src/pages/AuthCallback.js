import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processOAuthCallback } = useCustomerAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment (hash)
        const hash = location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('No session_id found in URL');
          navigate('/giris', { replace: true });
          return;
        }

        // Process the OAuth session
        const customer = await processOAuthCallback(sessionId);
        console.log('OAuth successful:', customer);
        
        // Redirect to home or intended destination
        navigate('/', { replace: true, state: { user: customer } });
      } catch (error) {
        console.error('OAuth processing error:', error);
        navigate('/giris', { 
          replace: true, 
          state: { error: 'Giriş başarısız oldu. Lütfen tekrar deneyin.' } 
        });
      }
    };

    processAuth();
  }, [location.hash, navigate, processOAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Giriş yapılıyor...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
