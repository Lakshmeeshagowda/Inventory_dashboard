
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Phone, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { requestOtp, verifyLoginOtp } = useContext(AuthContext);
  
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await requestOtp(phoneNumber);
    
    setIsLoading(false);
    if (result.success) {
      setStep('OTP');
    } else {
      setError(result.message || 'Failed to send OTP');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await verifyLoginOtp(phoneNumber, otp);
    
    setIsLoading(false);
    if (!success) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleBack = () => {
    setStep('PHONE');
    setOtp('');
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
          {/* Step 1: Phone Number Input */}
          {step === 'PHONE' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400 text-center mb-6 text-sm">Enter your mobile number to login</p>
              
              <form onSubmit={handlePhoneSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="phone">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
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
                  {isLoading ? <Loader2 className="animate-spin mr-2" size={20}/> : <span className="flex items-center">Get OTP <ArrowRight size={18} className="ml-2"/></span>}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: OTP Input */}
          {step === 'OTP' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <h2 className="text-2xl font-bold text-center text-white mb-2">Verify OTP</h2>
              <p className="text-gray-400 text-center mb-6 text-sm">
                Enter the code sent to <br/> <span className="text-cyan-400 font-semibold">{phoneNumber}</span>
              </p>

              <form onSubmit={handleOtpSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="otp">
                    One Time Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-10 bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 tracking-widest text-center font-mono text-lg"
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
                  {isLoading ? <Loader2 className="animate-spin mr-2" size={20}/> : 'Verify & Login'}
                </button>
                
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Change Phone Number
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
