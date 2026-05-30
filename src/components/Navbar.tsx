import React from 'react';
import { Crown, Menu, X, Wallet, Award, BookOpen, Settings, LogOut } from 'lucide-react';
import { User, SystemSettings } from '../types.js';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openLoginModal: () => void;
  settings: SystemSettings;
}

export default function Navbar({
  user,
  onLogout,
  currentTab,
  setCurrentTab,
  openLoginModal,
  settings
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'packages', label: 'Packages' },
    { id: 'blogs', label: 'Blog' },
    { id: 'contact', label: 'Contact' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-cyan-500/15 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO with Lion Crown style */}
        <div 
          onClick={() => setCurrentTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 to-yellow-500 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-slate-900 border border-yellow-500/40 p-1.5 rounded-lg">
              <Crown className="h-5 w-5 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col animate-fade-in">
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-slate-100 uppercase">
              {settings.logoText}
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase -mt-1">
              {settings.tagline}
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1.5">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentTab(link.id);
                setIsOpen(false);
              }}
              className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                currentTab === link.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* User / CTA Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 font-semibold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-200"
              >
                <Award className="h-4 w-4" />
                <span>My Dashboard</span>
              </button>
              
              {user.role === 'admin' && (
                <button
                  onClick={() => setCurrentTab('admin')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-semibold text-sm shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all duration-200"
                >
                  Admin Panel
                </button>
              )}

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 border border-slate-800 transition-all duration-200"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={openLoginModal}
                className="px-4.5 py-2 rounded-lg text-slate-300 hover:text-white font-medium text-sm transition-all duration-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setCurrentTab('register');
                }}
                className="flex items-center space-x-1 px-4.5 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 hover:from-yellow-400 hover:to-amber-500 font-extrabold text-sm shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all duration-200"
              >
                <span>Join Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2.5">
          {user && (
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 text-xs font-bold shadow-md"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800/80 flex flex-col space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentTab(link.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                currentTab === link.id
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {link.label}
            </button>
          ))}
          
          <div className="border-t border-slate-800/80 my-2 pt-3">
            {user ? (
              <div className="space-y-2 px-2">
                <div className="text-xs text-slate-400 px-2 pb-1 font-mono">
                  Logged in as: <span className="text-cyan-400 font-semibold">{user.name}</span>
                </div>
                
                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      setCurrentTab('admin');
                      setIsOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-bold text-sm"
                  >
                    Admin Panel
                  </button>
                )}

                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/5 font-bold text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-2">
                <button
                  onClick={() => {
                    openLoginModal();
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-800 text-slate-300 font-medium text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('register');
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-extrabold text-sm"
                >
                  Join {settings.logoText}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
