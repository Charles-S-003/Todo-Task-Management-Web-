import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('No token received');
        }

        // Verify token and get user data
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Token verification failed');
        }

        const data = await response.json();
        
        // Call the success handler
        onAuthSuccess(token, data.user);
        
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
        
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth/error', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, onAuthSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-6 text-center text-xl font-medium text-gray-900">
            Completing authentication...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we sign you in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;