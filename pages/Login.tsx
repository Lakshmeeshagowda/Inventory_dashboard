
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Mail, Phone, KeyRound, ArrowRight, Loader2, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, signup, checkUser } = useContext(AuthContext);
  
  const [step, setStep] = useState<'IDENTIFIER' | 'PASSWORD' | 'SIGNUP'>('IDENTIFIER');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(true);

  const handleCheckIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const identifier = useEmail ? email : phoneNumber;
    if (!identifier) {
      setError(useEmail ? 'Please enter an email' : 'Please enter a phone number');
      setIsLoading(false);
      return;
    }

    try {
      const result = await checkUser(useEmail ? email : null, useEmail ? null : phoneNumber);
      
      if (result.exists) {
        setStep('PASSWORD');
      } else {
        setStep('SIGNUP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(useEmail ? email : null, useEmail ? null : phoneNumber, password);
      
      if (!result.success) {
        setError(result.message);
      }
      // If success, AuthContext handles navigation
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signup(useEmail ? email : null, useEmail ? null : phoneNumber, password, confirmPassword);
      
      if (!result.success) {
        setError(result.message);
      }
      // If success, AuthContext handles navigation
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleBack = () => {
    setStep('IDENTIFIER');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2">
                <Leaf className="text-cyan-400" size={40}/>
                <h1 className="text-4xl font-bold text-white">AgriFerti</h1>
            </div>
        </div>
        
        <div className="bg-slate-800/50 p-8 rounded-2xl shadow-2xl shadow-cyan-500/10 backdrop-blur-sm border border-slate-700 relative overflow-hidden">
          
          {/* Step 1: Email/Phone Input */}
          {step === 'IDENTIFIER' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome to AgriFerti</h2>
              <p className="text-gray-400 text-center mb-6 text-sm">Sign in or create an account</p>
              
              <form onSubmit={handleCheckIdentifier}>
                {/* Toggle between Email and Phone */}
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => { setUseEmail(true); setError(''); }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${useEmail ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                  >
                    <Mail size={18} className="inline mr-2" />Email
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseEmail(false); setError(''); }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${!useEmail ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                  >
                    <Phone size={18} className="inline mr-2" />Phone
                  </button>
                </div>

                {/* Email or Phone Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {useEmail ? 'Email Address' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {useEmail ? <Mail size={18} className="text-gray-400" /> : <Phone size={18} className="text-gray-400" />}
                    </div>
                    <input
                      type={useEmail ? 'email' : 'tel'}
                      placeholder={useEmail ? 'your@email.com' : '9876543210'}
                      value={useEmail ? email : phoneNumber}
                      onChange={(e) => useEmail ? setEmail(e.target.value) : setPhoneNumber(e.target.value)}
                      className="w-full pl-10 bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-600"
                      required
                    />
                  </div>
                </div>
                
                {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 py-1 rounded border border-red-500/20">{error}</p>}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" size={20}/> : <span className="flex items-center">Continue <ArrowRight size={18} className="ml-2"/></span>}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Password Input (Login) */}
          {step === 'PASSWORD' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400 text-center mb-6 text-sm">
                Sign in to <span className="text-cyan-400 font-semibold">{useEmail ? email : phoneNumber}</span>
              </p>

              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-600"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 py-1 rounded border border-red-500/20">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 flex items-center justify-center mb-3"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" size={20}/> : 'Login'}
                </button>
                
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Use different {useEmail ? 'email' : 'phone number'}
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Signup Form */}
          {step === 'SIGNUP' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <h2 className="text-2xl font-bold text-center text-white mb-2">Create Account</h2>
              <p className="text-gray-400 text-center mb-6 text-sm">
                <span className="text-cyan-400 font-semibold">{useEmail ? email : phoneNumber}</span> is new here
              </p>

              <form onSubmit={handleSignup}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-600"
                      required
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Minimum 6 characters</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-600"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 py-1 rounded border border-red-500/20">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 flex items-center justify-center mb-3"
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" size={20}/> : <span className="flex items-center"><User size={18} className="mr-2" /> Create Account</span>}
                </button>
                
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Back
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
