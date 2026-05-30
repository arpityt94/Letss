import React from 'react';
import { FileText, AlertTriangle, HelpCircle } from 'lucide-react';

export default function TermsView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-wider">
          Terms & <span className="text-yellow-500">Conditions</span>
        </h1>
        <div className="h-1.5 w-16 bg-yellow-500 mx-auto rounded-full"></div>
        <p className="text-xs text-slate-500 font-mono">Last updated: May 2026</p>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
        
        <div className="flex items-center space-x-2.5 text-yellow-500">
          <FileText className="h-6 w-6" />
          <h2 className="font-display font-bold text-lg text-slate-100">1. Acceptance of Service Terms</h2>
        </div>
        <p>
          By signing up on Let's Success 2.0 (Learn • Earn • Success) or participating in our High Commission affiliate network, you represent that you are at least 18 years old and agree to follow our payment verification steps and withdrawal compliance schedules.
        </p>

        <h2 className="font-display font-bold text-base text-slate-100 mt-6 border-b border-slate-900 pb-1.5">
          2. No Commission Double Submission or Cheating
        </h2>
        <p>
          Affiliates are strictly forbidden from reusing transaction UTR references or uploading counterfeit screenshots. Submitting dummy screenshots will lead to immediate lockouts and permanent forfeiture of any unpaid wallet balances. Admin marpit792@gmail.com reserves full authority to audit transactions.
        </p>

        <h2 className="font-display font-bold text-base text-slate-100 mt-6 border-b border-slate-900 pb-1.5">
          3. Lifetime Non-Refundable Fee Structure
        </h2>
        <p>
          Purchased packages are digital skills resources that grant instant video access and unlock promotional affiliate links. Under no circumstances can fees be refunded after verification approval.
        </p>

        <h2 className="font-display font-bold text-base text-slate-100 mt-6 border-b border-slate-900 pb-1.5">
          4. Income Representation disclaimer
        </h2>
        <p>
          Let's Success 2.0 makes no empty projections of passive or guaranteed wealth. Student results depend on active studying, hard work on lead generation masterclasses, and ethical marketing efforts.
        </p>

      </div>
    </div>
  );
}
