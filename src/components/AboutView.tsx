import React from 'react';
import { ShieldCheck, Mail, Users, Compass, Globe, Award } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-wider">
          About <span className="text-cyan-400">Our Platform</span>
        </h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-400 to-yellow-500 mx-auto rounded-full"></div>
        <p className="text-slate-300 font-mono text-sm tracking-widest uppercase mt-2">
          "Learn • Earn • Success"
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/5 rounded-full blur-3xl"></div>
        
        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-yellow-500">
          Empointing Minds Through Digital Education & Self-Financing
        </h2>
        
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          At Let's Success 2.0, our single mission is simple: to make modern, high-tier digital education accessible to every aspiring individual in India. We live in a highly technical era where traditional schooling often leaves youth without real, employable skills. We fill this gap with premium, actionable courses.
        </p>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Complementing our rich video library is a high-reward direct referral affiliate ecosystem, letting our students practice entrepreneurial marketing immediately relative to their learning. By giving a highly-competitive 80% commission margin, we assure that hard work translates into rapid self-financing and growth.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-sm">
          <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-xl flex items-center space-x-3">
            <Users className="h-5 w-5 text-cyan-400" />
            <div>
              <div className="font-bold text-slate-100">18,500+ Strong Base</div>
              <div className="text-xs text-slate-500 font-mono">Affiliates across states</div>
            </div>
          </div>
          <div className="bg-slate-900/60 p-4 border border-slate-800/80 rounded-xl flex items-center space-x-3">
            <Award className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="font-bold">₹4.8 Crore Distributed</div>
              <div className="text-xs text-slate-500 font-mono">Commission payments approved</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-100 border-l-4 border-cyan-400 pl-3">
          Our Core Ideals
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-2">
            <span className="text-yellow-500 font-mono font-bold">01 /</span>
            <h4 className="font-bold text-slate-200">Simplified Hindi Content</h4>
            <p className="text-xs text-slate-400">
              We translate abstract marketing models to easy, actionable recorded steps in beautiful local languages.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl space-y-2">
            <span className="text-cyan-400 font-mono font-bold">02 /</span>
            <h4 className="font-bold text-slate-200">Ethical Commissions</h4>
            <p className="text-xs text-slate-400">
              Direct commissions structure with manual ledger approvals guarantees full speed visibility.
            </p>
          </div>
          <div className="glass-panel p-6 rounded-2xl space-y-2">
            <span className="text-yellow-500 font-mono font-bold">03 /</span>
            <h4 className="font-bold text-slate-200">Dedicated Mentorship</h4>
            <p className="text-xs text-slate-400">
              Direct access to professional weekly zoom sessions with Top Earners in Indian market networks.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel border-yellow-500/20 p-8 rounded-3xl text-center space-y-4">
        <h3 className="font-display font-extrabold text-lg text-yellow-500">Need Immediate Assistance?</h3>
        <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Marpit Admin is fully active. Reach out to our central administration office regarding onboarding, course assignments or quick approvals.
        </p>
        <div className="inline-flex items-center space-x-2 bg-slate-900/85 px-4 py-2 border border-slate-800 rounded-lg">
          <Mail className="h-4 w-4 text-cyan-400" />
          <a href="mailto:marpit792@gmail.com" className="text-slate-100 font-mono text-sm hover:underline">
            marpit792@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
