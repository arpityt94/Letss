import React from 'react';
import { 
  Award, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Tv, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight, 
  Globe, 
  Smartphone, 
  FileCheck, 
  MessageSquare, 
  Video, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Percent
} from 'lucide-react';
import { Package, SystemSettings } from '../types.js';

interface HomeViewProps {
  packages: Package[];
  setCurrentTab: (tab: string) => void;
  openLoginModal: () => void;
  user: any;
  settings: SystemSettings;
}

const SUCCESS_STORIES = [
  {
    name: "Rohan Sharma",
    age: "21 Years",
    earnings: "₹4,85,000",
    package: "Branding Mastery Package",
    quote: "Let's Success 2.0 changed my life entirely. I learned Instagram Mastery and Video Editing, and immediately started helping local businesses while earning massive 80% direct commissions! Handled completely from my phone.",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Aman Preet Singh",
    age: "19 Years",
    earnings: "₹2,40,000",
    package: "Finance Premium Package",
    quote: "Hindi Recorded courses are clear & direct. Within 3 weeks of studying lead generation, I got my first client. The automatic commissions withdrawal is approved on the same day by Marpit Admin!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Priya Patel",
    age: "23 Years",
    earnings: "₹9,12,000",
    package: "Affiliate Package",
    quote: "Building dynamic WordPress landing pages of high value with Google Ads is a superpower. Best for students looking to establish real premium digital agencies. Highly recommended!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
  }
];

export default function HomeView({
  packages,
  setCurrentTab,
  openLoginModal,
  user,
  settings
}: HomeViewProps) {
  const [activeStory, setActiveStory] = React.useState(0);

  const prevStory = () => {
    setActiveStory((prev) => (prev === 0 ? SUCCESS_STORIES.length - 1 : prev - 1));
  };

  const nextStory = () => {
    setActiveStory((prev) => (prev === SUCCESS_STORIES.length - 1 ? 0 : prev + 1));
  };

  // Static stats values
  const stats = [
    { label: 'Active Affiliates', value: '18,500+', desc: 'Across India', icon: Users },
    { label: 'Ecosystem Earnings', value: '₹4.8 Crores+', desc: 'Distributed commissions', icon: TrendingUp },
    { label: 'Online Courses', value: '16+ Modules', desc: 'Practical video lessons', icon: BookOpen },
    { label: 'Weekly Lives', value: '3+ Meetings', desc: 'Direct support & QA', icon: Video },
  ];

  const whyChooseUs = [
    {
      title: "Quality Education",
      desc: "Courses recorded in simplified Hindi & English with real-world case studies and project worksheets.",
      icon: BookOpen,
      color: "border-cyan-500/30"
    },
    {
      title: "Weekly Live Trainings",
      desc: "Direct guidance by high earners. Learn high ticket closing, Instagram masterminds & run Google Ads interactive.",
      icon: Video,
      color: "border-yellow-500/30"
    },
    {
      title: "24x7 Student Support",
      desc: "Instant help desk ticket system & email assistance directly by marpit792@gmail.com to resolve dashboard queries.",
      icon: HelpCircle,
      color: "border-cyan-500/30"
    },
    {
      title: "Hindi Recorded Courses",
      desc: "No complicated technical barriers. Step-by-step guidance formatted for simplified vernacular learning curves.",
      icon: Tv,
      color: "border-yellow-500/30"
    },
    {
      title: "Affiliate Ecosystem",
      desc: "Generate your unique invitation links immediately. Perfect setup for building solid digital-age monthly commission caches.",
      icon: Globe,
      color: "border-cyan-500/30"
    },
    {
      title: "High Commission (80%)",
      desc: "Our platform distributes exactly 80% direct referral commission to sponsors. Earn up to ₹7,999 on a single package refer!",
      icon: Percent,
      color: "border-yellow-500/30"
    }
  ];

  const benefits = [
    { title: "Work From Anywhere", desc: "No physical boundaries. Operate from home, coffee shops, or travel freely.", icon: Globe },
    { title: "Smartphone Based Business", desc: "No complex desktop setups required. Build lead generation directly via social applications on iOS or Android.", icon: Smartphone },
    { title: "Step-by-Step Training", desc: "Perfect walkthrough tutorials ranging from absolute beginner foundations to running advanced paid campaigns.", icon: FileCheck },
    { title: "Recorded Webinars", desc: "Access the entire archive of past community meetups to review strategies at your absolute leisure.", icon: Video },
    { title: "Weekly Zoom Meetings", desc: "Gather with thousands of fellow digital marketers to optimize conversion tactics and share success notes.", icon: MessageSquare }
  ];

  const faqs = [
    { q: "What is Let's Success 2.0?", a: "Let's Success 2.0 is an advanced digital affiliate e-learning platform where you master professional digital skills like Instagram Growth, Video Editing, Facebook Ads, and Finance Trading, while earning 80% commissions by sharing these courses as an affiliate." },
    { q: "How does the High Commission affiliate system operate?", a: "Every member receives a unique referral code. When someone purchases any package using your code or link, you earn exactly 80% direct referral commission instantly! For example, referring the Affiliate Package (₹6999) pays you ₹5599.20 directly." },
    { q: "How do I upgrade my package over time?", a: "You can purchase high tier packages individually at any time by keying in your interest, uploading your manual screen-capture verification and getting approved by our admin team." },
    { q: "What is the minimum withdrawal request limit?", a: "There is absolutely no minimum limit! You can request withdrawal of any unlocked earnings directly to your UPI ID or Bank account. Payouts are reviewed and disbursed by Admin marpit792@gmail.com on a rolling basis." }
  ];

  return (
    <div className="space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 px-4 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center space-y-8 z-10 animate-fade-in">
          {/* Logo badge area */}
          <div className="inline-flex items-center space-x-2 bg-slate-900/90 border border-yellow-500/30 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            <Award className="h-4.5 w-4.5 text-yellow-500" />
            <span className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
              Join {settings.logoText}
            </span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl leading-tight tracking-tight text-white">
              {settings.heroHeaderFirst} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-yellow-500 animate-pulse">
                {settings.heroHeaderHighlight}
              </span> <br className="sm:hidden" />
              {settings.heroHeaderLast}
            </h1>
            <p className="font-sans font-medium text-lg sm:text-2xl text-slate-300 tracking-wide mt-2">
              {settings.heroSubtext}
            </p>
            <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {settings.heroParagraph}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => user ? setCurrentTab('dashboard') : setCurrentTab('register')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 text-slate-950 font-extrabold text-base shadow-[0_4px_30px_rgba(6,182,212,0.35)] hover:scale-102 transition-all duration-300 cursor-pointer"
            >
              <span>{user ? 'Go to Dashboard' : 'Join Register Now'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentTab('packages')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-yellow-500/35 hover:border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-500/5 font-bold text-base transition-all duration-300 cursor-pointer"
            >
              Explore Packages
            </button>
          </div>

          {/* Optional custom banner image */}
          {settings.bannerImageUrl && (
            <div className="relative mt-8 max-w-4xl mx-auto rounded-3xl overflow-hidden border border-cyan-500/20 shadow-[0_0_35px_rgba(6,182,212,0.18)] group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-yellow-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <img 
                src={settings.bannerImageUrl} 
                alt="Ecosystem Banner" 
                className="relative w-full max-h-[440px] object-cover rounded-3xl transition-transform duration-500 group-hover:scale-[1.005]" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Extra tagline indicator */}
          <div className="pt-8 text-xs font-mono text-slate-400 flex items-center justify-center space-x-6">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>80% Instant Commission</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              <span>Manual verification</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>No Minimum Withdrawal</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="glass-panel hover:border-cyan-500/30 p-6 rounded-2xl flex items-center space-x-4 transition-all duration-300"
              >
                <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/25">
                  <Icon className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-2xl text-slate-100">{stat.value}</div>
                  <div className="text-sm font-semibold text-slate-300">{stat.label}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{stat.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-500 uppercase tracking-wider">
            Why Choose <span className="text-cyan-400">Let's Success 2.0</span>
          </h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-400 to-yellow-500 mx-auto rounded-full"></div>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Unpacking the key differentiators that make us the most trusted learning setup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className={`glass-panel border-l-2 p-6 rounded-2xl ${item.color} hover:translate-y-[-4px] transition-all duration-300`}
              >
                <div className="bg-slate-900/80 p-3 rounded-xl w-12 h-12 flex items-center justify-center border border-slate-800">
                  <Icon className="h-5 w-5 text-yellow-500" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-200 mt-4 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. PACKAGES PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-100 uppercase tracking-widest">
            Affiliate <span className="text-yellow-500 border-b-2 border-yellow-500/30">Packages</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Choose a digital bundle that suits your trajectory. Get 80% instant commissions on referrals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.slice(0, 3).map((pkg) => (
            <div 
              key={pkg.id}
              className="glass-panel hover:border-yellow-500/25 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 relative group"
            >
              {pkg.popularityText && (
                <span className="absolute -top-3 right-4 bg-yellow-500 text-slate-950 text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full shadow-lg">
                  {pkg.popularityText}
                </span>
              )}
              
              <div className="space-y-4">
                <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase font-mono">
                  Skills Bundle
                </span>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-200">
                  {pkg.name}
                </h3>
                
                <div className="flex items-baseline space-x-1.5 py-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">₹{pkg.price}</span>
                  <span className="text-xs font-mono text-slate-400">One-Time Fee</span>
                </div>

                <div className="h-px bg-slate-800/80 my-3"></div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-500">Includes Courses:</span>
                  <ul className="space-y-1.5">
                    {pkg.courses.map((course, i) => (
                      <li key={i} className="flex items-center space-x-2 text-sm text-slate-300">
                        <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        <span>{course}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setCurrentTab('packages')}
                  className="w-full text-center py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 hover:text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-all duration-300 cursor-pointer"
                >
                  View Pack Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setCurrentTab('packages')}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 text-sm font-bold transition-all duration-200 cursor-pointer"
          >
            <span>Explore All 5 Packages</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section className="bg-slate-950/40 border-y border-slate-900/60 py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-bold font-mono tracking-widest text-cyan-400 uppercase">
              Core Benefits
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-100 leading-tight">
              Start Your Business From Any Corner.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              No need for costly tech or offices. Our structure runs completely online so you can construct freedom from your local space.
            </p>
            <div className="p-4 rounded-xl glass-panel border-cyan-500/10 flex items-center space-x-3 mt-6">
              <Shield className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <div className="text-xs font-mono text-slate-400">
                Managed securely with manual UTR screenshot uploads and swift admin withdrawals.
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl flex space-x-4">
                  <div className="text-yellow-500 flex-shrink-0 mt-1">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-slate-200 mb-1">{benefit.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. SUCCESS STORIES CAROUSEL */}
      <section className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-100 uppercase tracking-wide">
            Affiliate <span className="text-cyan-400">Hall of Fame</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-mono text-center">
            Real Student Success Stories & Commissions
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-10 relative overflow-hidden">
          {/* Light Ambient effect inside */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-yellow-500 rounded-full blur opacity-75"></div>
              <img 
                src={SUCCESS_STORIES[activeStory].avatar} 
                alt={SUCCESS_STORIES[activeStory].name} 
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-display font-black text-xl text-white">
                    {SUCCESS_STORIES[activeStory].name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {SUCCESS_STORIES[activeStory].age} • Verified Member
                  </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 px-3.5 py-1.5 rounded-lg text-yellow-500">
                  <div className="text-[10px] font-mono tracking-widest uppercase font-bold">Total Earnings</div>
                  <div className="font-display font-extrabold text-lg leading-none">{SUCCESS_STORIES[activeStory].earnings}</div>
                </div>
              </div>

              <div className="text-xs font-mono text-cyan-400">
                Purchased: {SUCCESS_STORIES[activeStory].package}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed italic">
                “{SUCCESS_STORIES[activeStory].quote}”
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={prevStory}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextStory}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-100 uppercase">
            Frequently Asked <span className="text-yellow-500">Questions</span>
          </h2>
          <div className="h-1 w-16 bg-yellow-500 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl space-y-2 hover:border-cyan-500/10 transition-colors">
              <h3 className="font-display font-bold text-base sm:text-lg text-slate-200 flex items-center space-x-2">
                <span className="text-cyan-400 font-mono">Q.</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => setCurrentTab('faq')}
            className="text-cyan-400 hover:underline text-sm font-semibold hover:text-cyan-300 font-mono"
          >
            Have more questions? Read our complete FAQ repository →
          </button>
        </div>
      </section>

    </div>
  );
}
