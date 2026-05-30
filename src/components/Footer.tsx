import React from 'react';
import { Crown, Mail, MapPin, Shield, HelpCircle, FileText, CheckSquare } from 'lucide-react';
import { SystemSettings } from '../types.js';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  settings?: SystemSettings;
}

export default function Footer({ setCurrentTab, settings }: FooterProps) {
  const logoText = settings?.logoText || "Let's Success 2.0";
  const tagline = settings?.tagline || "Learn • Earn • Success";

  return (
    <footer className="relative bg-slate-950/80 border-t border-cyan-500/10 pt-16 pb-8 px-4 sm:px-6 z-10 overflow-hidden">
      {/* Background soft glow effects */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[250px] h-[250px] bg-yellow-500/3 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-1.5 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-slate-900 border border-yellow-500/40 p-1.5 rounded-lg">
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg sm:text-l tracking-wider text-slate-100 uppercase">
                {logoText}
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase -mt-0.5">
                {tagline}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Empowering minds through digital education. Master high-income skills & leverage our High Commission affiliate ecosystem to grow dynamically.
          </p>
          <div className="flex items-center space-x-3 text-slate-500 font-mono text-xs">
            <span>Admin Support:</span>
            <a href="mailto:marpit792@gmail.com" className="text-cyan-400 hover:underline">
              marpit792@gmail.com
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="font-display font-bold text-sm text-slate-200 tracking-wider uppercase border-b border-slate-800 pb-1.5">
            Navigation
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            {['Home', 'About Us', 'Packages', 'Blog', 'Contact', 'FAQ'].map((link) => {
              const tabId = link === 'About Us' ? 'about' : (link === 'Blog' ? 'blogs' : link.toLowerCase());
              return (
                <li key={link}>
                  <button
                    onClick={() => setCurrentTab(tabId)}
                    className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                  >
                    {link}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Premium Programs */}
        <div className="space-y-4">
          <h4 className="font-display font-bold text-sm text-slate-200 tracking-wider uppercase border-b border-slate-800 pb-1.5">
            Packages
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            {[
              { id: 'packages', name: 'Startup Package' },
              { id: 'packages', name: 'Foundation Package' },
              { id: 'packages', name: 'Branding Mastery' },
              { id: 'packages', name: 'Affiliate Premium' },
              { id: 'packages', name: 'Finance Premium' }
            ].map((pkg, idx) => (
              <li key={idx}>
                <button
                  onClick={() => setCurrentTab(pkg.id)}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  {pkg.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Agreements */}
        <div className="space-y-4">
          <h4 className="font-display font-bold text-sm text-slate-200 tracking-wider uppercase border-b border-slate-800 pb-1.5">
            Legal & Support
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <button
                onClick={() => setCurrentTab('privacy')}
                className="flex items-center space-x-2 hover:text-cyan-400 transition-colors text-left"
              >
                <Shield className="h-3.5 w-3.5 text-cyan-500" />
                <span>Privacy Policy</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentTab('terms')}
                className="flex items-center space-x-2 hover:text-cyan-400 transition-colors text-left"
              >
                <FileText className="h-3.5 w-3.5 text-yellow-500" />
                <span>Terms & Conditions</span>
              </button>
            </li>
            <li className="flex items-center space-x-2 pt-2 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              <span>Support Location: India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright area */}
      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
        <p>© 2026 {logoText}. All rights preserved.</p>
        <p className="mt-2 sm:mt-0">
          Created with <span className="text-yellow-500">♥</span> • {tagline}
        </p>
      </div>
    </footer>
  );
}
