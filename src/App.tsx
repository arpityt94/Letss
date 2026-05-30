import React from 'react';
import { Crown, BookOpen, AlertCircle, Sparkles, LogOut, LayoutGrid, X } from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import PackagesView from './components/PackagesView';
import ContactView from './components/ContactView';
import FAQView from './components/FAQView';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import AdminView from './components/AdminView';
import PrivacyView from './components/PrivacyView';
import TermsView from './components/TermsView';
import BlogsView from './components/BlogsView';

import { User, Package, Course, SystemSettings } from './types';

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(localStorage.getItem('lets_success_token'));
  const [currentTab, setCurrentTab] = React.useState<string>('home');
  
  // Dynamic server variables
  const [packages, setPackages] = React.useState<Package[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [settings, setSettings] = React.useState<SystemSettings>({
    logoText: "Let's Success",
    tagline: "Learn • Earn • Success",
    heroHeaderFirst: "Learn Skills.",
    heroHeaderHighlight: "Build Income.",
    heroHeaderLast: "Create Success.",
    heroSubtext: "“Learn Skills • Earn Commissions • Achieve Success”",
    heroParagraph: "Empowering digital entrepreneurs with practical video courses, Hindi recorded workshops, and a hyper-profitable direct referral commission ecosystem.",
    bannerImageUrl: "",
    maintenanceMode: false
  });
  const [loading, setLoading] = React.useState(true);

  // Authentication Popup
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [isRegisterInModal, setIsRegisterInModal] = React.useState(false);

  // Gating target selected for buy
  const [preselectedPackageForPurchase, setPreselectedPackageForPurchase] = React.useState<string | null>(null);

  // FETCH CORE GENERAL DATA (PACKS & COURSES) ON LOAD
  const fetchGeneralContent = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      
      const setRes = await fetch('/api/settings');
      if (setRes.headers.get('content-type')?.includes('application/json')) {
        const setData = await setRes.json();
        if (setRes.ok && setData.settings) {
          setSettings(setData.settings);
        }
      } else {
        console.warn("Expected JSON from /api/settings but received:", setRes.status);
      }

      const pacRes = await fetch('/api/packages');
      if (pacRes.headers.get('content-type')?.includes('application/json')) {
        const pacData = await pacRes.json();
        if (pacRes.ok && pacData.packages) {
          setPackages(pacData.packages);
        }
      } else {
        console.warn("Expected JSON from /api/packages but received:", pacRes.status);
      }

      const couRes = await fetch('/api/courses');
      if (couRes.headers.get('content-type')?.includes('application/json')) {
        const couData = await couRes.json();
        if (couRes.ok && couData.courses) {
          setCourses(couData.courses);
        }
      } else {
        console.warn("Expected JSON from /api/courses but received:", couRes.status);
      }
    } catch (err) {
      console.error("Error during basic layout retrieval", err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // CHECK LOGGED IN SESSION WITH SERVER ON START
  const verifySession = async (savedToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn("Session verification received non-JSON response:", response.status);
        return;
      }

      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
      } else {
        console.warn("Session verification warning: server did not return user details.", data?.error || '');
      }
    } catch (err) {
      console.error("Session verification failed with network anomaly, keeping session:", err);
    }
  };

  React.useEffect(() => {
    fetchGeneralContent();

    if (token) {
      verifySession(token);
    }

    // Scroll back to page top on tab change
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [currentTab]);

  const handleAuthSuccess = (newToken: string, authenticatedUser: User) => {
    localStorage.setItem('lets_success_token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    
    // Redirect cleanly
    if (preselectedPackageForPurchase) {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lets_success_token');
    setToken(null);
    setUser(null);
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Background decoration elements */}
      <div className="absolute top-0 right-10 w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-5 w-[350px] h-[350px] bg-yellow-500/3 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10">
        
        {/* TOP LEVEL NAVIGATION BRAND BAR */}
        <Navbar 
          user={user}
          onLogout={handleLogout}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          openLoginModal={() => {
            setIsRegisterInModal(false);
            setAuthModalOpen(true);
          }}
          settings={settings}
        />

        {/* LOADING SHIM */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
            <p className="text-xs text-slate-500 font-mono mt-3">Booting Let's Success 2.0 Engine...</p>
          </div>
        )}

        {/* PAGE SCREEN CONTENT */}
        {!loading && (
          <main className="py-8">
            {settings.maintenanceMode && (!user || user.role !== 'admin') ? (
              <div className="max-w-xl mx-auto text-center px-4 py-16 space-y-6">
                <div className="inline-flex bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-3xl text-yellow-500 mb-2 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A1.5 1.5 0 0019 21l2.5-2.5a1.5 1.5 0 000-2.12l-5.83-5.83M11.42 15.17l-4.65-4.65M11.42 15.17L12 11.5M6.77 10.52L1.5 15.75a1.5 1.5 0 000 2.12l2.5 2.5A1.5 1.5 0 006.12 21l5.23-5.23m-4.58-5.25L4.5 13.5m4.35-7.75l-4-4m12.35 11.35l4-4" />
                  </svg>
                </div>
                <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-100 uppercase tracking-tight">
                  Under Maintenance
                </h2>
                <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full"></div>
                <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                  We are currently updating {settings.logoText} to introduce new high-value features. 
                  Don't worry, your wallet balances, course access, and affiliate tracks are entirely safe!
                </p>
                <p className="text-slate-500 font-mono text-xs">
                  Expected uptime: Very soon. Standard study schedules will resume immediately.
                </p>
                <div className="pt-6">
                  <button 
                    onClick={() => {
                      setIsRegisterInModal(false);
                      setAuthModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer font-bold font-mono text-xs uppercase transition tracking-wider"
                  >
                    Admin Login
                  </button>
                </div>
              </div>
            ) : (
              <>
                {currentTab === 'home' && (
                  <HomeView 
                    packages={packages}
                    user={user}
                    setCurrentTab={setCurrentTab}
                    openLoginModal={() => {
                      setIsRegisterInModal(false);
                      setAuthModalOpen(true);
                    }}
                    settings={settings}
                  />
                )}

                {currentTab === 'about' && <AboutView />}

                {currentTab === 'packages' && (
                  <PackagesView 
                    packages={packages}
                    user={user}
                    setCurrentTab={setCurrentTab}
                    openLoginModal={() => {
                      setIsRegisterInModal(false);
                      setAuthModalOpen(true);
                    }}
                    setSelectedPackageForPurhase={(pkgId) => {
                      setPreselectedPackageForPurchase(pkgId);
                    }}
                  />
                )}

                {currentTab === 'contact' && <ContactView />}

                {currentTab === 'faq' && <FAQView />}

                {currentTab === 'privacy' && <PrivacyView />}

                {currentTab === 'terms' && <TermsView />}

                {currentTab === 'blogs' && (
                  <BlogsView 
                    user={user}
                    token={token}
                    setCurrentTab={setCurrentTab}
                    openLoginModal={() => {
                      setIsRegisterInModal(false);
                      setAuthModalOpen(true);
                    }}
                  />
                )}

                {/* REGISTER GATED PAGE */}
                {currentTab === 'register' && (
                  <AuthView 
                    onAuthSuccess={handleAuthSuccess}
                    isRegisterInitial={true}
                  />
                )}

                {/* DASHBOARD VIEW */}
                {currentTab === 'dashboard' && user && token && (
                  <DashboardView 
                    user={user}
                    packages={packages}
                    courses={courses}
                    token={token}
                    onProfileUpdated={(updated) => setUser(updated)}
                    selectedPackageForPurhase={preselectedPackageForPurchase || undefined}
                    clearPreselectedPackage={() => setPreselectedPackageForPurchase(null)}
                  />
                )}

                {/* ADMIN CONSOLE GATED VIEW */}
                {currentTab === 'admin' && user && token && user.role === 'admin' && (
                  <AdminView 
                    token={token}
                    packages={packages}
                    courses={courses}
                    refreshCourses={() => fetchGeneralContent(true)}
                    settings={settings}
                    onSettingsUpdated={(updatedSettings) => setSettings(updatedSettings)}
                  />
                )}
              </>
            )}
          </main>
        )}

      </div>

      {/* FOOTER BAR */}
      <Footer setCurrentTab={setCurrentTab} settings={settings} />

      {/* AUTH POPUP / SIGN-IN MODAL BOX */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => {
                setAuthModalOpen(false);
                setIsRegisterInModal(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition cursor-pointer z-[110]"
            >
              <X className="h-5 w-5" />
            </button>
            
            <AuthView 
              onAuthSuccess={handleAuthSuccess}
              isRegisterInitial={isRegisterInModal}
            />
          </div>
        </div>
      )}

    </div>
  );
}
