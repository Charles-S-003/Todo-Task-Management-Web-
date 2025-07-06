import React, { useState } from 'react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store token and redirect or update UI
      console.log('Success:', data);
      
      // You can redirect to dashboard or update parent component
      window.location.reload(); // Simple refresh for now
      
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          .bg-grid-pattern {
            background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0);
            background-size: 20px 20px;
          }
        `}
      </style>
      
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                  <div className="w-8 h-8 bg-white rounded-lg"></div>
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                {isLogin ? 'Welcome Back' : 'Join Us'}
              </h2>
              <p className="text-purple-200/80 text-sm">
                {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm animate-shake">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                    {error}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {!isLogin && (
                  <div className="group">
                    <div className="relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required={!isLogin}
                        className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-purple-200/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 group-hover:border-purple-400/50"
                        placeholder="Full name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                )}
                
                <div className="group">
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-purple-200/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 group-hover:border-purple-400/50"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-purple-200/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 group-hover:border-purple-400/50"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    isLogin ? 'Sign in' : 'Sign up'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </button>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
                <span className="px-4 text-purple-200/80 text-sm font-medium">OR</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="group relative w-full py-4 px-6 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-semibold rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <div className="flex items-center justify-center pointer-events-none">
                  <div className="w-5 h-5 mr-3 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  Continue with Google
                </div>
              </button>

              {/* Toggle Button */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-300 hover:text-white text-sm font-medium transition-colors duration-300 hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </>
  );
};

export default Login;