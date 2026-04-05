import React, { useState } from 'react';
import { Car, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const API_URL = 'http://localhost:8080/api/auth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post(`${API_URL}/login`, {
          email: formData.email,
          password: formData.password
        });
        

        localStorage.setItem('jwt_token', response.data.token);
        navigate('/dashboard');

      } else {
        // logica de register
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Parolele nu se potrivesc!");
        }
        if (!formData.agreeTerms) {
          throw new Error("Trebuie să accepți directivele de operare.");
        }

        
        const nameParts = formData.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        const response = await axios.post(`${API_URL}/register`, {
          firstName: firstName,
          lastName: lastName,
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem('jwt_token', response.data.token);
        alert('Unitate înregistrată cu succes!');
        navigate('/dashboard');
      }
    } catch (err) {
      
      setError(err.response?.data?.message || err.message || 'A apărut o eroare în sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neon-dark text-gray-300 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      
      <div className="z-10 flex flex-col items-center mb-8">
        <Car className="text-neon-pink w-12 h-12 mb-2" />
        <h1 className="text-3xl font-bold text-neon-pink tracking-wider">NEON_FLEET_OS</h1>
        <p className="text-neon-cyan text-xs font-mono tracking-[0.2em] mt-2">
          {isLogin ? 'INITIALIZE SECURE CONNECTION' : 'INITIALIZE USER PROTOCOL'}
        </p>
      </div>

      
      <div className="z-10 w-full max-w-md bg-neon-panel border border-neon-pink/30 rounded-lg p-8 shadow-[0_0_30px_rgba(255,0,85,0.1)] relative">
        
        <h2 className="text-xl text-white font-semibold mb-6 flex items-center gap-2 border-l-2 border-neon-pink pl-3">
          {isLogin ? 'System Authentication' : 'Create New Account'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-sm font-mono">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          
          {!isLogin && (
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 tracking-wider">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="JOHANNES_DOE"
                  className="w-full bg-neon-dark border border-gray-800 rounded px-10 py-3 text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/50 transition-colors uppercase placeholder-gray-700"
                />
              </div>
            </div>
          )}

          
          <div>
            <label className="block text-xs font-mono text-gray-500 mb-1 tracking-wider">
              {isLogin ? 'TERMINAL ID / EMAIL' : 'WORK EMAIL'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@autofleet.ai"
                className="w-full bg-neon-dark border border-gray-800 rounded px-10 py-3 text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/50 transition-colors placeholder-gray-700"
              />
            </div>
          </div>

         
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-mono text-gray-500 tracking-wider">
                  {isLogin ? 'ACCESS KEY' : 'PASSWORD'}
                </label>
                {isLogin && (
                  <a href="#" className="text-[10px] font-mono text-neon-cyan hover:underline">FORGOT PASSWORD?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-neon-dark border border-gray-800 rounded pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/50 transition-colors tracking-widest"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-cyan"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

           
            {!isLogin && (
              <div className="flex-1">
                <label className="block text-xs font-mono text-gray-500 mb-1 tracking-wider">CONFIRM</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-neon-dark border border-gray-800 rounded pl-10 py-3 text-sm focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/50 transition-colors tracking-widest"
                  />
                </div>
              </div>
            )}
          </div>

         
          <div className="pt-2">
            {isLogin ? (
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="appearance-none w-4 h-4 border border-gray-600 rounded bg-neon-dark checked:bg-neon-pink/20 checked:border-neon-pink cursor-pointer transition-colors" />
                <span className="text-xs font-mono text-gray-500 group-hover:text-gray-300 transition-colors">PERSISTENT SESSION</span>
              </label>
            ) : (
              <label className="flex items-start gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 appearance-none w-4 h-4 min-w-[16px] border border-gray-600 rounded bg-neon-dark checked:bg-neon-pink/20 checked:border-neon-pink cursor-pointer transition-colors" 
                />
                <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors leading-tight">
                  I acknowledge the <span className="text-neon-cyan">Directives of Operation</span> and data encryption protocols.
                </span>
              </label>
            )}
          </div>

          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 bg-transparent border border-neon-pink text-neon-pink font-mono font-bold py-3 rounded hover:bg-neon-pink/10 hover:shadow-[0_0_15px_rgba(255,0,85,0.3)] transition-all duration-300 tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'PROCESSING...' : (isLogin ? 'INITIATE_LOGIN' : 'REGISTER_ENTITY →')}
          </button>

        </form>

        
        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <p className="text-xs font-mono text-gray-500">
            {isLogin ? 'NEW UNIT?' : 'ALREADY_HAVE_ACCOUNT?'}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-neon-cyan hover:text-white hover:underline transition-colors"
            >
              {isLogin ? 'REGISTER' : 'LOG_IN'}
            </button>
          </p>
        </div>

      </div>
      
      
      <div className="absolute bottom-4 text-center z-10">
        <p className="text-[10px] font-mono text-gray-600 tracking-widest">
          SYSTEM VERSION 4.0.2 // SECURED BY QUANTUM_SHIELD
        </p>
      </div>
    </div>
  );
};

export default AuthPage;