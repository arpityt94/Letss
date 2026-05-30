import React from 'react';
import { CheckCircle, Award, Eye, Play, Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Package } from '../types.js';

interface PackagesViewProps {
  packages: Package[];
  user: any;
  setCurrentTab: (tab: string) => void;
  openLoginModal: () => void;
  setSelectedPackageForPurhase?: (pkgId: string) => void;
}

export default function PackagesView({
  packages,
  user,
  setCurrentTab,
  openLoginModal,
  setSelectedPackageForPurhase
}: PackagesViewProps) {

  const handlePurchaseClick = (pkgId: string) => {
    if (!user) {
      alert("Kindly Sign In or Register first to purchase packages and generate commission codes!");
      openLoginModal();
    } else {
      if (setSelectedPackageForPurhase) {
        setSelectedPackageForPurhase(pkgId);
      }
      setCurrentTab('dashboard');
    }
  };

  const getPackageGradient = (color: string) => {
    switch (color) {
      case 'cyan': return 'from-cyan-400 to-teal-500';
      case 'gold': return 'from-yellow-400 to-amber-500';
      case 'emerald': return 'from-emerald-400 to-green-500';
      case 'rose': return 'from-rose-400 to-pink-500';
      case 'violet': return 'from-violet-400 to-purple-500';
      default: return 'from-cyan-400 to-purple-500';
    }
  };

  const getPackageShadow = (color: string) => {
    switch (color) {
      case 'cyan': return 'shadow-[0_0_20px_rgba(6,182,212,0.15)]';
      case 'gold': return 'shadow-[0_0_20px_rgba(234,179,8,0.15)]';
      case 'emerald': return 'shadow-[0_0_20px_rgba(16,185,129,0.15)]';
      case 'rose': return 'shadow-[0_0_20px_rgba(244,63,94,0.15)]';
      case 'violet': return 'shadow-[0_0_20px_rgba(139,92,246,0.15)]';
      default: return 'shadow-none';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-4">
        <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-wider">
          Explore Our <span className="text-yellow-500">Premium Packages</span>
        </h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-yellow-500 to-cyan-400 mx-auto rounded-full"></div>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Unlock lifetime dynamic access to premium digital video modules. Complete courses, earn prestigious skills credentials, and leverage <strong>80% direct commissions</strong>!
        </p>
      </div>

      {/* RATING NOTE */}
      <div className="glass-panel p-4.5 rounded-2xl border-cyan-500/10 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4 max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="h-6 w-6 text-cyan-400 flex-shrink-0 animate-pulse" />
          <p className="text-xs sm:text-sm text-slate-300">
            <strong>Referral Commission Blueprint:</strong> Referrer gets exactly <strong>80% direct payout</strong> instantly on our manual ledger system. Approved daily!
          </p>
        </div>
        <div className="flex items-center space-x-1 font-mono text-cyan-300 font-bold text-xs">
          <span>Self-Verification Activated</span>
        </div>
      </div>

      {/* 5 PACKAGES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {packages.map((pkg) => {
          const isUserActivePackage = user?.activePackageId === pkg.id;
          const gradient = getPackageGradient(pkg.color);
          const shadowStyle = getPackageShadow(pkg.color);

          return (
            <div 
              key={pkg.id}
              className={`glass-panel ${shadowStyle} rounded-3xl p-6 relative flex flex-col justify-between hover:translate-y-[-6px] transition-all duration-300 group`}
            >
              {pkg.popularityText && (
                <span className="absolute -top-3.5 right-6 bg-yellow-500 text-slate-950 text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full shadow-lg">
                  {pkg.popularityText}
                </span>
              )}

              <div className="space-y-6">
                {/* Header branding */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                      Skill Level Bundle
                    </span>
                  </div>
                  <h3 className="font-display font-black text-2xl text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {pkg.name}
                  </h3>
                </div>

                {/* PRICING AREA */}
                <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-2xl">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    One-Time Lifetime Fee
                  </div>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">₹{pkg.price}</span>
                    <span className="text-xs text-slate-500 font-mono">inclusive of GST</span>
                  </div>
                  
                  {/* Comm Calculation preview */}
                  <div className="text-xs font-mono text-cyan-300 mt-2 flex items-center justify-between border-t border-slate-800/40 pt-1.5">
                    <span>Direct Affiliate Reward (80%):</span>
                    <span className="font-extrabold text-white">₹{(pkg.price * 0.8).toFixed(2)}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-800"></div>

                {/* COURSE STREAMS */}
                <div className="space-y-3">
                  <span className="text-xs font-mono tracking-wider text-slate-500 uppercase">
                    Unlocked Curriculum:
                  </span>
                  <ul className="space-y-2">
                    {pkg.courses.map((course, i) => (
                      <li key={i} className="flex items-start space-x-2.5 text-sm text-slate-300">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{course}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* BUY ACTION */}
              <div className="mt-8 pt-4">
                {isUserActivePackage ? (
                  <div className="w-full text-center py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-sm">
                    ✓ Your Active Package
                  </div>
                ) : user?.activePackageId && (packages.find(p => p.id === user.activePackageId)?.price || 0) > pkg.price ? (
                  <div className="w-full text-center py-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 font-bold text-sm">
                    ✓ Unlocked (Included in Bundle)
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchaseClick(pkg.id)}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-slate-200 hover:text-slate-950 text-sm font-extrabold hover:bg-gradient-to-r hover:from-cyan-400 hover:to-cyan-500 transition-all duration-300 cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>{user?.activePackageId ? 'Upgrade to This Package' : 'Buy Now & Learn'}</span>
                  </button>
                )}
                
                <p className="text-center text-[10px] text-slate-500 font-mono mt-2">
                  No monthly renewal • Zero hosting fees
                </p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
