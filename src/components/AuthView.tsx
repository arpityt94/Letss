import React from 'react';
import { Mail, Lock, User as UserIcon, Award, ShieldAlert, Sparkles, Key, ArrowRight, Eye, EyeOff, Phone } from 'lucide-react';
import { User } from '../types.js';

interface AuthViewProps {
  onAuthSuccess: (token: string, user: User) => void;
  isRegisterInitial?: boolean;
}

export default function AuthView({
  onAuthSuccess,
  isRegisterInitial = false
}: AuthViewProps) {
  const [isRegister, setIsRegister] = React.useState(isRegisterInitial);
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Form fields
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [referralCode, setReferralCode] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  // Extract referral code from URL query parameter ?ref=CODE
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referral');
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister 
        ? { name, email, password, mobileNumber: mobileNumber.trim(), referralCode: referralCode.trim() || undefined }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server rejected authentication request.');
      }

      // On Success
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error executing action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border-cyan-500/10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl"></div>

        {/* CROWN BRAND HEAD */}
        <div className="text-center space-y-2 mb-8">
          <span className="inline-flex text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
            Let's Success 2.0 Auth Gate
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-100 uppercase">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegister 
              ? 'Get instant 80% direct commissions & professional digital courses' 
              : 'Sign in to access courses, check wallets or withdraw rewards'}
          </p>
        </div>

        {/* FEEDBACK ERROR */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs flex items-center space-x-2.5 mb-6">
            <ShieldAlert className="h-5.5 w-5.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* NAME FIELD */}
          {isRegister && (
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <UserIcon className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 transition-colors"
                />
              </div>
            </div>
          )}

          {/* MOBILE NUMBER FIELD */}
          {isRegister && (
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Mobile / Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 transition-colors"
                />
              </div>
            </div>
          )}

          {/* EMAIL FIELD */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 transition-colors"
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl pl-11 pr-11 py-2.5 text-sm text-slate-100 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* REFERRAL CODE (INVITATION) - REGISTER ONLY */}
          {isRegister && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-mono text-slate-400 uppercase">
                  Referral / Sponsor Code
                </label>
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Optional</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Key className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="SUCCESSADMIN"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 font-mono tracking-wider transition-colors placeholder:text-slate-600"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Code of sponsor who invited you. Auto-fills from invite link.
              </p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-uppercase hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer mt-4"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register & Master Skills' : 'Sign In Now'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* TOGGLE MODE LINK */}
        <div className="text-center mt-6 border-t border-slate-900 pt-4 text-xs">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
            }}
            className="text-slate-400 hover:text-cyan-400 font-medium cursor-pointer"
          >
            {isRegister 
              ? 'Already registered? Return to Login page →' 
              : 'New to Success 2.0? Register dynamic account →'}
          </button>
        </div>

      </div>
    </div>
  );
}
