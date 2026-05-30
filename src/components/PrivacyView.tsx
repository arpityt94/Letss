import React from 'react';
import { ShieldCheck, Eye, Lock } from 'lucide-react';

export default function PrivacyView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-wider">
          Privacy <span className="text-cyan-400">Policy</span>
        </h1>
        <div className="h-1.5 w-16 bg-cyan-400 mx-auto rounded-full"></div>
        <p className="text-xs text-slate-500 font-mono">Last updated: May 2026</p>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
        
        <div className="flex items-center space-x-2.5 text-yellow-500">
          <ShieldCheck className="h-6 w-6" />
          <h2 className="font-display font-bold text-lg text-slate-100">1. Data Storage and Shield</h2>
        </div>
        <p>
          At Let's Success 2.0, we take privacy seriously. We store your registered credentials securely on our transactional server database, using bcrypt cryptographic hashes for user passwords. We never share, trade, or expose your information to third-party ad frameworks unless explicitly requested.
        </p>

        <h2 className="font-display font-bold text-base text-slate-100 mt-6 border-b border-slate-900 pb-1.5">
          2. Manual Payment Proofs & Upload Integrity
        </h2>
        <p>
          Manual payment verification screenshots uploaded are strictly viewel by our designated panel of admins (marpit792@gmail.com) for the sole purpose of approving purchased packages. Once verified, screenshot files stay preserved as compliance proof.
        </p>

        <h2 className="font-display font-bold text-base text-slate-100 mt-6 border-b border-slate-900 pb-1.5">
          3. Browser Storage and Cookie policy
        </h2>
        <p>
          We employ local browser storage or secure JSON Web Tokens (JWT) inside browser storage to persist user sessions. Standard tracking markers might also be utilized to analyze statistics or track your unique referral code parameters correctly when guests load your referral URL.
        </p>

        <h2 className="font-display font-bold text-base text-slate-100 mt-6 border-b border-slate-900 pb-1.5">
          4. Contact desk
        </h2>
        <p>
          You have full rights to inspect, update or completely scrub your registered email profiles. For any telemetry inquiries, write directly to: <span className="text-cyan-400 font-mono">marpit792@gmail.com</span>.
        </p>

      </div>
    </div>
  );
}
