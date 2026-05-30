import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Award, 
  Copy, 
  Check, 
  BookOpen, 
  Lock, 
  Users, 
  Settings, 
  Bell, 
  Play, 
  CreditCard, 
  Upload, 
  Menu, 
  ChevronRight, 
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  QrCode
} from 'lucide-react';
import { User, Package, Course, PaymentSubmission, WithdrawalRequest, Notification } from '../types.js';
import { QRCodeSVG } from 'qrcode.react';

interface DashboardProps {
  user: User;
  packages: Package[];
  courses: Course[];
  token: string;
  onProfileUpdated: (updatedUser: User) => void;
  selectedPackageForPurhase?: string; // Preselected from packages page
  clearPreselectedPackage?: () => void;
}

export default function DashboardView({
  user,
  packages,
  courses,
  token,
  onProfileUpdated,
  selectedPackageForPurhase,
  clearPreselectedPackage
}: DashboardProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'purchase' | 'courses' | 'withdraw' | 'referrals' | 'settings'>('overview');
  
  // Stats and history fetched from API
  const [loading, setLoading] = React.useState(true);
  const [directReferrals, setDirectReferrals] = React.useState<any[]>([]);
  const [payments, setPayments] = React.useState<PaymentSubmission[]>([]);
  const [commissions, setCommissions] = React.useState<any[]>([]);
  const [withdrawals, setWithdrawals] = React.useState<WithdrawalRequest[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [notices, setNotices] = React.useState<any[]>([]);
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);

  // Clipboard Copied tooltip
  const [copied, setCopied] = React.useState(false);

  // Form states: Manual payment upload
  const [selectedPkgId, setSelectedPkgId] = React.useState(selectedPackageForPurhase || 'startup');
  const [utr, setUtr] = React.useState('');
  const [screenshotUrl, setScreenshotUrl] = React.useState('');
  const [paymentSubmitting, setPaymentSubmitting] = React.useState(false);
  const [paymentMsg, setPaymentMsg] = React.useState({ type: '', text: '' });

  // Form states: Profile Settings
  const [upiId, setUpiId] = React.useState(user.upiId || '');
  const [bankName, setBankName] = React.useState(user.bankName || '');
  const [bankAccount, setBankAccount] = React.useState(user.bankAccount || '');
  const [bankIfsc, setBankIfsc] = React.useState(user.bankIfsc || '');
  const [bankHolder, setBankHolder] = React.useState(user.bankHolder || '');
  const [settingsSaving, setSettingsSaving] = React.useState(false);
  const [settingsMsg, setSettingsMsg] = React.useState({ type: '', text: '' });

  // Form states: Withdrawal
  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [withdrawMethod, setWithdrawMethod] = React.useState<'upi' | 'bank'>('upi');
  const [withdrawSubmitting, setWithdrawSubmitting] = React.useState(false);
  const [withdrawMsg, setWithdrawMsg] = React.useState({ type: '', text: '' });

  // Course watch mode state
  const [currentWatchingCourse, setCurrentWatchingCourse] = React.useState<Course | null>(null);

  React.useEffect(() => {
    if (selectedPackageForPurhase) {
      setSelectedPkgId(selectedPackageForPurhase);
      setActiveTab('purchase');
      if (clearPreselectedPackage) {
        clearPreselectedPackage();
      }
    }
  }, [selectedPackageForPurhase]);

  const activePackage = packages.find(p => p.id === user.activePackageId);

  // Filter package selection to display only higher-cost options for upgrades
  const packagesToShow = activePackage 
    ? packages.filter(pkg => pkg.price > activePackage.price)
    : packages;

  // Safely auto-align selected package when list changes to exclude lower tiers
  React.useEffect(() => {
    if (packagesToShow.length > 0 && !packagesToShow.some(p => p.id === selectedPkgId)) {
      setSelectedPkgId(packagesToShow[0].id);
    }
  }, [packagesToShow, selectedPkgId]);

  // Keep the active tab out of purchase mode if finance premium tier is purchased
  React.useEffect(() => {
    if (user.activePackageId === 'finance' && activeTab === 'purchase') {
      setActiveTab('overview');
    }
  }, [user.activePackageId, activeTab]);

  const selectedPackage = packagesToShow.find(p => p.id === selectedPkgId) || packagesToShow[0] || packages[0];
  const paymentAmount = selectedPackage ? selectedPackage.price : 0;
  const upiLink = `upi://pay?pa=letssuccess@ptaxis&pn=${encodeURIComponent("Let's Success")}&cu=INR${paymentAmount ? `&am=${paymentAmount}` : ''}`;

  // FETCH DASHBOARD METRICS FROM SERVER
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Referrals & Histories
      const refRes = await fetch('/api/referrals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (refRes.headers.get('content-type')?.includes('application/json')) {
        const refData = await refRes.json();
        if (refRes.ok) {
          setDirectReferrals(refData.directReferrals || []);
          setPayments(refData.payments || []);
          setCommissions(refData.commissions || []);
          setWithdrawals(refData.withdrawals || []);
          setLeaderboard(refData.leaderboard || []);
        }
      } else {
        console.warn("Expected JSON from /api/referrals but received:", refRes.status);
      }

      // 2. Fetch Notifications and Notices
      const notifRes = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (notifRes.headers.get('content-type')?.includes('application/json')) {
        const notifData = await notifRes.json();
        if (notifRes.ok) {
          setNotifications(notifData.notifications || []);
          setNotices(notifData.notices || []);
        }
      } else {
        console.warn("Expected JSON from /api/notifications but received:", notifRes.status);
      }

      // 3. Re-fetch current user info for balance precision
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (meRes.headers.get('content-type')?.includes('application/json')) {
        const meData = await meRes.json();
        if (meRes.ok && meData.user) {
          onProfileUpdated(meData.user);
          setUpiId(meData.user.upiId || '');
          setBankName(meData.user.bankName || '');
          setBankAccount(meData.user.bankAccount || '');
          setBankIfsc(meData.user.bankIfsc || '');
          setBankHolder(meData.user.bankHolder || '');
        }
      } else {
        console.warn("Expected JSON from /api/auth/me but received:", meRes.status);
      }

    } catch (err) {
      console.error("Error drawing dashboard telemetry info", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  // Handle Clipboard Copy
  const copyReferralLink = () => {
    const link = `${window.location.protocol}//${window.location.host}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // HANDLE MANUAL SCREENSHOT/PAYMENT UPLOAD SUBMISSION
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentMsg({ type: '', text: '' });

    if (!screenshotUrl || !utr) {
      setPaymentMsg({ type: 'error', text: 'You must provide a valid transaction UTR Number and Payment screenshot proof.' });
      return;
    }

    setPaymentSubmitting(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: selectedPkgId,
          utr: utr.trim(),
          screenshotUrl
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server rejected manual verification uploading.');
      }

      setPaymentMsg({ type: 'success', text: `Verification slot opened! Package: ${packages.find(p=>p.id===selectedPkgId)?.name}. UTR: ${utr}. Admin will activate soon!` });
      setUtr('');
      setScreenshotUrl('');
      fetchDashboardData();
    } catch (err: any) {
      setPaymentMsg({ type: 'error', text: err.message });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // HANDLE PAYMENT SETTINGS UPI/BANK SAVE
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg({ type: '', text: '' });
    setSettingsSaving(true);

    try {
      const response = await fetch('/api/auth/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          upiId: upiId.trim() || undefined,
          bankName: bankName.trim() || undefined,
          bankAccount: bankAccount.trim() || undefined,
          bankIfsc: bankIfsc.trim() || undefined,
          bankHolder: bankHolder.trim() || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setSettingsMsg({ type: 'success', text: 'Fintech settlement and bank metadata updated successfully!' });
      onProfileUpdated(data.user);
    } catch (err: any) {
      setSettingsMsg({ type: 'error', text: err.message });
    } finally {
      setSettingsSaving(false);
    }
  };

  // HANDLE WITHDRAWAL SUBMIT
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg({ type: '', text: '' });

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawMsg({ type: 'error', text: 'Please input a valid amount to withdraw.' });
      return;
    }

    if (amount > user.balance) {
      setWithdrawMsg({ type: 'error', text: `Insufficient funds. Your withdrawable balance is ₹${user.balance.toFixed(2)}` });
      return;
    }

    if (withdrawMethod === 'upi' && !user.upiId) {
      setWithdrawMsg({ type: 'error', text: 'Update your UPI Address inside the Settings tab first.' });
      return;
    }

    if (withdrawMethod === 'bank' && (!user.bankAccount || !user.bankIfsc)) {
      setWithdrawMsg({ type: 'error', text: 'Update complete bank credentials inside Settings tab first.' });
      return;
    }

    setWithdrawSubmitting(true);
    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          method: withdrawMethod
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setWithdrawMsg({ type: 'success', text: `Withdraw ticket generated for ₹${amount.toFixed(2)}! Wallet balance updated.` });
      setWithdrawAmount('');
      fetchDashboardData();
    } catch (err: any) {
      setWithdrawMsg({ type: 'error', text: err.message });
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  // Helper: Find package name by user active package ID (reusing top-level defined activePackage in outer scope)

  // Filter courses unlocked by current user's active package or lower tier.
  // "give user to all below package courses if they buy upper package"
  const myUnlockedCourses = courses.filter(c => {
    if (!user.activePackageId) return false;
    if (c.packageId === user.activePackageId) return true;
    
    const activePkg = packages.find(p => p.id === user.activePackageId);
    if (!activePkg) return false;

    const coursePkg = packages.find(p => p.id === c.packageId);
    if (!coursePkg) return false;

    return coursePkg.price <= activePkg.price;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* 1. TOP NOTICE MARQUEES */}
      {notices.length > 0 && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-start space-x-3 text-slate-200">
          <Bell className="h-5.5 w-5.5 text-yellow-500 flex-shrink-0 animate-bounce" />
          <div className="space-y-1">
            <span className="font-display font-black text-xs uppercase tracking-wider text-yellow-500">
              Community Broadcast
            </span>
            {notices.map((notice) => (
              <div key={notice.id} className="text-sm">
                <strong>{notice.title}:</strong> {notice.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR TABS SELECTOR - 3 COLS */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* USER QUICK BRAND CARD */}
          <div className="glass-panel p-5 rounded-3xl text-center space-y-3 relative overflow-hidden">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center font-display font-extrabold text-2xl text-cyan-400 mx-auto">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className={`absolute bottom-0 right-1/4 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${user.activePackageId ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            </div>

            <div>
              <h3 className="font-display font-bold text-slate-100">{user.name}</h3>
              <p className="text-xs font-mono text-slate-500">{user.email}</p>
              {user.mobileNumber && (
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">📞 {user.mobileNumber}</p>
              )}
            </div>

            <div className="border-t border-slate-900 pt-3 flex flex-col items-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Current Status</span>
              {activePackage ? (
                <span className="text-xs font-bold text-cyan-400 mt-0.5 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/15">
                  {activePackage.name}
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-500 mt-0.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/15">
                  Pending Activation
                </span>
              )}
            </div>
          </div>

          {/* DETAILED TABS DRAWER */}
          <div className="glass-panel p-2.5 rounded-2xl flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 lg:space-y-1.5 scrollbar-thin">
            {[
              { id: 'overview', label: 'Overview Metrics', icon: Wallet },
              ...(user.activePackageId === 'finance'
                ? []
                : [
                    {
                      id: 'purchase',
                      label: user.activePackageId ? 'Upgrade Package' : 'Activate Package',
                      icon: CreditCard,
                    },
                  ]),
              { id: 'courses', label: 'My Skill Courses', icon: BookOpen },
              { id: 'withdraw', label: 'Wallet Cashout', icon: TrendingUp },
              { id: 'referrals', label: 'Affiliate Team', icon: Users },
              { id: 'settings', label: 'Payout Settings', icon: Settings }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setCurrentWatchingCourse(null);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap lg:whitespace-normal transition cursor-pointer w-full text-left ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <TabIcon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* QUICK PROPIN */}
          <div className="hidden lg:block glass-panel p-4.5 rounded-2xl border-yellow-500/10">
            <h5 className="text-xs font-bold text-yellow-500 mb-1">Direct Support Active</h5>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              Database changes persist securely on-server. Write support at <span className="text-cyan-400">marpit792@gmail.com</span> for manual approvals.
            </p>
          </div>
        </div>

        {/* WORKSPACE DETAILED PANEL - 9 COLS */}
        <div className="lg:col-span-9 space-y-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <p className="text-xs text-slate-500 font-mono mt-2">Syncing database state...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* ==========================================
                  TAB: OVERVIEW
              ========================================== */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* WALL STATS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden border-cyan-500/15">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/5 rounded-full blur-xl"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
                            Wallet Match Balance
                          </span>
                          <h2 className="text-3xl sm:text-4xl font-black text-cyan-400 mt-1">
                            ₹{user.balance.toFixed(2)}
                          </h2>
                        </div>
                        <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                          <Wallet className="h-5 w-5 text-cyan-400" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-4">
                        Instant payout ready for withdrawal request
                      </p>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border-yellow-500/15 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
                            Total Unlocked Earnings
                          </span>
                          <h2 className="text-3xl sm:text-4xl font-black text-yellow-500 mt-1">
                            ₹{user.totalEarnings.toFixed(2)}
                          </h2>
                        </div>
                        <div className="bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20">
                          <TrendingUp className="h-5 w-5 text-yellow-500" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-4 text-emerald-400 flex items-center space-x-1">
                        <ArrowUpRight className="h-3 w-3" />
                        <span>Based on 80% Direct Commissions</span>
                      </p>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-black">
                            Disbursed Payouts
                          </span>
                          <h2 className="text-3xl sm:text-4xl font-black text-slate-200 mt-1">
                            ₹{user.totalWithdrawn.toFixed(2)}
                          </h2>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <Check className="h-5 w-5 text-slate-400" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-4">
                        Sent securely to UPI/Bank
                      </p>
                    </div>
                  </div>

                  {/* COPIABLE REFERRAL CODE PANEL */}
                  <div className="glass-panel p-6 rounded-3xl space-y-4 border-l-4 border-yellow-500">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-display font-bold text-lg text-slate-200">
                          Your Exclusive Referral Hub
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-mono">
                          Invite prospects using your link or code to receive <strong>80% commission</strong> instantly!
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 font-mono text-cyan-400 text-xs">
                        <span>Direct Referral Active</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Referral Code</div>
                          <div className="text-sm font-bold font-mono text-yellow-500 tracking-widest">{user.referralCode}</div>
                        </div>
                        <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-lg border border-yellow-500/25">
                          ACTIVE
                        </span>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
                        <div className="truncate pr-4">
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Invitation Link</div>
                          <div className="text-xs font-mono text-slate-400 truncate">{`${window.location.protocol}//${window.location.host}/register?ref=${user.referralCode}`}</div>
                        </div>
                        <button
                          onClick={copyReferralLink}
                          className="p-2 ml-2 rounded-xl bg-slate-950 border border-slate-800 hover:text-cyan-400 transition flex-shrink-0 flex items-center justify-center cursor-pointer"
                          title="Copy to clipboard"
                        >
                          {copied ? <Check className="h-4.5 w-4.5 text-emerald-400" /> : <Copy className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RECENT NOTIFICATIONS & LEADERBOARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* SYSTEM LOGS NOTIFICATIONS */}
                    <div className="glass-panel p-5 rounded-3xl space-y-4">
                      <h4 className="font-display font-bold text-slate-200 uppercase tracking-wider text-sm border-b border-slate-900 pb-2 flex items-center space-x-2">
                        <Bell className="h-4.5 w-4.5 text-cyan-400" />
                        <span>My Message Logs</span>
                      </h4>
                      
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-500 font-mono">
                            No notifications received yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                              <div className="font-bold text-slate-300 flex justify-between">
                                <span className="text-cyan-400 uppercase tracking-widest text-[9px] font-mono">{notif.title}</span>
                                <span className="text-[9px] text-slate-500 font-mono">{new Date(notif.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-400 leading-relaxed font-sans">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* WEEKLY PLATFORM LEADERBOARD */}
                    <div className="glass-panel p-5 rounded-3xl space-y-4">
                      <h4 className="font-display font-bold text-slate-200 uppercase tracking-wider text-sm border-b border-slate-900 pb-2 flex items-center space-x-2">
                        <Award className="h-4.5 w-4.5 text-yellow-500" />
                        <span>Top Affiliates Standings</span>
                      </h4>

                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                        {leaderboard.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-500 font-mono">
                            Leaderboard initializing...
                          </div>
                        ) : (
                          leaderboard.map((leader, i) => (
                            <div 
                              key={i} 
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                                leader.name === user.name
                                  ? 'bg-cyan-500/10 border-cyan-500/20'
                                  : 'bg-slate-900/45 border-slate-900'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                                  i === 0 ? 'bg-yellow-500 text-slate-950' : i === 1 ? 'bg-slate-300 text-slate-950' : i === 2 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {i + 1}
                                </span>
                                <span className="font-semibold text-slate-300">{leader.name} {leader.name === user.name && '(You)'}</span>
                              </div>
                              <span className="font-mono text-cyan-400 font-bold">₹{leader.earnings.toFixed(2)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ==========================================
                  TAB: PURCHASE & PAYMENTS
              ========================================== */}
              {activeTab === 'purchase' && (
                <div className="space-y-8 animate-fade-in">
                  
                  <div className="text-left space-y-2">
                    <h3 className="font-display font-black text-2xl text-slate-100 uppercase">
                      {user.activePackageId ? 'Manual Package Upgrade' : 'Manual Package Verification'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      {user.activePackageId 
                        ? 'Select a higher-tier skill package below to upgrade. Transfer the incremental difference or package fee, upload payment screenshot + UTR, and your sponsor receives an instant 80% commission on approval!'
                        : 'Since no automatic gates are initially wired, follow our manual UPI verification flow. Transfer the fee corresponding to your desired package, upload the payment screenshot, submit the UTR, and your sponsor earns exactly 80%!'}
                    </p>
                  </div>

                  {/* UPI PAYMENT DETAILS */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    
                    {/* PAYMENT REQUISITE */}
                    <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-400/15 font-mono font-bold uppercase tracking-wider">
                          Direct UPI Payment Method
                        </span>
                        
                        <div className="space-y-3 pt-2 text-sm">
                          <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl space-y-2">
                            <div className="text-xs text-slate-500 font-mono uppercase">Direct Merchant UPI ID</div>
                            <div className="font-mono font-extrabold text-slate-100 text-base flex items-center justify-between">
                              <span>letssuccess@ptaxis</span>
                              <span className="text-[10px] text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/20 font-bold">Official / Instantly Verified</span>
                            </div>
                          </div>

                          <div className="bg-slate-900/85 p-4 border border-dashed border-slate-800 rounded-xl">
                            <div className="text-xs text-slate-500 font-mono uppercase">Official Admin Email</div>
                            <div className="font-mono font-bold text-slate-200 text-sm mt-0.5">marpit792@gmail.com</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 leading-relaxed font-sans bg-slate-900/40 p-3.5 rounded-xl border border-slate-900">
                        <strong>Important Safety Instructions:</strong> Pay from standard secure apps (GPay, PhonePe, Paytm). Take a clear screenshot displaying the <strong>UTR / UPI Transaction reference number (12 Digits)</strong> completely.
                      </div>
                    </div>

                    {/* QR CODE DISPLAY CARD */}
                    <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border-slate-800 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/40">
                      <div className="text-xs text-slate-300 font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 justify-center">
                        <QrCode className="h-4 w-4 text-cyan-400" />
                        <span>Scan QR Code to Pay</span>
                      </div>
                      
                      {/* Interactive Vector QR container with glowing effect */}
                      <div className="p-3 bg-white rounded-2xl relative shadow-[0_0_15px_rgba(34,211,238,0.15)] max-w-[210px] transition-transform hover:scale-102 duration-300">
                        <QRCodeSVG 
                          value={upiLink}
                          size={180}
                          level="H"
                          includeMargin={true}
                          className="w-full h-auto object-contain rounded-lg shadow-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-300 font-sans tracking-wide">
                          Amount auto-filled: <span className="text-cyan-400 font-bold font-mono">₹{paymentAmount}</span> ({selectedPackage?.name})
                        </p>
                        <p className="text-[10px] text-yellow-500 font-mono font-bold">
                          Scan the QR with GPay, PhonePe, or Paytm
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* PAYMENT FORM */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl"></div>

                    <h4 className="font-display font-bold text-lg text-slate-100 mb-6 flex items-center space-x-2">
                      <Upload className="h-5 w-5 text-cyan-400" />
                      <span>Submit Payment Screenshot & UTR Verification</span>
                    </h4>

                    {paymentMsg.text && (
                      <div className={`p-4 rounded-xl text-xs font-medium mb-6 flex items-center space-x-2.5 ${
                        paymentMsg.type === 'success' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}>
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{paymentMsg.text}</span>
                      </div>
                    )}

                    <form onSubmit={handlePaymentSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* SELECT PACKAGE TO VERIFY */}
                        <div>
                          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Select Purchased Package</label>
                          <select
                            value={selectedPkgId}
                            onChange={(e) => setSelectedPkgId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-200 transition-colors"
                          >
                            {packagesToShow.map((pkg) => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} — ₹{pkg.price}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* TRANSACTION ID (UTR) */}
                        <div>
                          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">12-Digit Transaction ID / UTR Number</label>
                          <input
                            type="text"
                            required
                            maxLength={24}
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            placeholder="e.g. 612093485120"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-100 font-mono tracking-wider transition-colors"
                          />
                        </div>
                      </div>

                      {/* BASE64 OR SCREENSHOT URL GENERATION */}
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
                          Upload Payment Receipt Screenshot Proof
                        </label>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            id="screenshot-uploader"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setScreenshotUrl(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label
                            htmlFor="screenshot-uploader"
                            className="w-full sm:w-auto px-6 py-3 border border-dashed border-slate-805 hover:border-cyan-500 hover:bg-cyan-500/5 rounded-xl text-center text-sm font-semibold text-slate-300 cursor-pointer transition flex items-center justify-center space-x-2"
                          >
                            <Upload className="h-4.5 w-4.5 text-cyan-500" />
                            <span>Select Screenshot File</span>
                          </label>

                          <div className="text-xs text-slate-500 font-mono text-center sm:text-left">
                            {screenshotUrl ? (
                              <span className="text-emerald-400 font-bold">✓ Payment Screenshot Selected! Ready.</span>
                            ) : (
                              <span>Supports JPEG, PNG, WEBP receipts</span>
                            )}
                          </div>
                        </div>

                        {screenshotUrl && (
                          <div className="mt-4 p-2 bg-slate-900 border border-slate-800 rounded-xl max-w-xs overflow-hidden">
                            <img 
                              src={screenshotUrl} 
                              alt="Receipt proof" 
                              className="h-32 object-contain rounded-lg mx-auto" 
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={paymentSubmitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 text-slate-950 font-black text-sm tracking-wide hover:scale-101 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {paymentSubmitting ? 'Uploading Reference...' : 'Submit Manual Activation Request'}
                      </button>

                    </form>
                  </div>

                  {/* USER PERSONAL VERIFICATION HISTORY */}
                  <div className="glass-panel p-5 rounded-3xl space-y-4">
                    <h4 className="font-display font-bold text-slate-200 text-sm border-b border-slate-900 pb-2">
                      My Verification History & Ledger
                    </h4>

                    <div className="overflow-x-auto">
                      {payments.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500 font-mono">
                          No historical manual verifications recorded yet.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs text-slate-400 border-collapse">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-500 font-mono">
                              <th className="py-2.5">Package</th>
                              <th className="py-2.5">UTR / Tx ID</th>
                              <th className="py-2.5">Amount</th>
                              <th className="py-2.5">Date</th>
                              <th className="py-2.5">Status</th>
                              <th className="py-2.5">Feedback</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((p) => (
                              <tr key={p.id} className="border-b border-slate-900/40 font-mono hover:bg-slate-900/30">
                                <td className="py-3 font-semibold text-slate-300">{p.packageName}</td>
                                <td className="py-3">{p.utr}</td>
                                <td className="py-3 font-bold text-slate-200">₹{p.price}</td>
                                <td className="py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    p.status === 'approved' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                      : p.status === 'rejected'
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                                  }`}>
                                    {p.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-3 text-rose-400 text-[10px] max-w-xs truncate" title={p.rejectionReason}>
                                  {p.rejectionReason || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* ==========================================
                  TAB: COURSES GATED MODULE
              ========================================== */}
              {activeTab === 'courses' && (
                <div className="space-y-8 animate-fade-in">
                  
                  <div className="text-left space-y-2">
                    <h3 className="font-display font-black text-2xl text-slate-100 uppercase">
                      My Video Courses Library
                    </h3>
                    <p className="text-xs text-slate-400">
                      Watch lifetime step-by-step video tutorials associated with your active package.
                    </p>
                  </div>

                  {!user.activePackageId ? (
                    <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-2xl mx-auto border-dashed border-cyan-500/20">
                      <Lock className="h-12 w-12 text-yellow-500 mx-auto animate-pulse" />
                      <h4 className="font-display font-extrabold text-lg text-slate-100">
                        Course Vault is Locked
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        You have not activated an educational package yet. Select your package of interest, upload verification screenshot, and gain unrestricted video access!
                      </p>
                      <button
                        onClick={() => setActiveTab('purchase')}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                      >
                        <span>Activate Package Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Active Watching Frame */}
                      {currentWatchingCourse && (
                        <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-4 border-cyan-500/25">
                          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-900 relative">
                            {/* Embedded simulated play placeholder with rich controls */}
                            <iframe 
                              src={currentWatchingCourse.videoUrl} 
                              title={currentWatchingCourse.title} 
                              className="w-full h-full"
                              allowFullScreen
                            ></iframe>
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded uppercase">Currently Watching</span>
                              <span className="text-xs text-slate-500 font-mono">{currentWatchingCourse.duration} • {currentWatchingCourse.lessonsCount} Video Chapters</span>
                            </div>
                            <h4 className="font-display font-bold text-lg text-slate-100">{currentWatchingCourse.title}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans">{currentWatchingCourse.description}</p>
                          </div>
                        </div>
                      )}

                      {/* Course items checklist grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {myUnlockedCourses.map((course) => (
                          <div 
                            key={course.id}
                            className="glass-panel rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition duration-300"
                          >
                            <div className="space-y-3">
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                                <img 
                                  src={course.thumbnailUrl} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                                <div className="absolute inset-0 bg-slate-950/25 flex items-center justify-center">
                                  <div className="p-3 rounded-full bg-slate-950/80 border border-slate-800 text-cyan-400">
                                    <Play className="h-4 w-4 fill-cyan-400" />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h5 className="font-display font-bold text-sm text-slate-200">{course.title}</h5>
                                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{course.description}</p>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                              <span className="text-[10px] text-slate-500 font-mono">{course.duration}</span>
                              <button
                                onClick={() => {
                                  setCurrentWatchingCourse(course);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-bold transition cursor-pointer"
                              >
                                Watch Video
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* ==========================================
                  TAB: WITHDRAW SYSTEM
              ========================================== */}
              {activeTab === 'withdraw' && (
                <div className="space-y-8 animate-fade-in">
                  
                  <div className="text-left space-y-2">
                    <h3 className="font-display font-black text-2xl text-slate-100 uppercase">
                      Wallet Commission Cashout
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      Unlocked referral balance can be cashed out directly. Updates show on your dashboard instantly.
                    </p>
                  </div>

                  {/* WITHDRAW FORM */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    
                    {/* REQUEST PANEL */}
                    <div className="md:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/3 rounded-full blur-2xl"></div>

                      <h4 className="font-display font-bold text-base text-slate-200 mb-6 flex items-center space-x-2">
                        <span>Withdrawal Request Ticket</span>
                      </h4>

                      {withdrawMsg.text && (
                        <div className={`p-4 rounded-xl text-xs font-medium mb-6 flex items-center space-x-2.5 ${
                          withdrawMsg.type === 'success' 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                        }`}>
                          <AlertCircle className="h-5 w-5 flex-shrink-0" />
                          <span>{withdrawMsg.text}</span>
                        </div>
                      )}

                      <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                        
                        {/* AMOUNT Input */}
                        <div>
                          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Enter Cashout Amount</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-mono text-sm">₹</span>
                            <input
                              type="number"
                              required
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 font-mono transition-colors"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 font-mono">
                            Available withrawable balance: ₹{user.balance.toFixed(2)}
                          </p>
                        </div>

                        {/* METHOD Select */}
                        <div>
                          <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Select Transfer Method</label>
                          <select
                            value={withdrawMethod}
                            onChange={(e) => setWithdrawMethod(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-200 transition-colors"
                          >
                            <option value="upi">UPI Address Transfer</option>
                            <option value="bank">Bank Account Transfer</option>
                          </select>
                        </div>

                        {/* DISBURST CREDIT INFO REVIEW */}
                        <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
                          <div className="font-bold text-slate-300">Reviewed Settlement Details:</div>
                          {withdrawMethod === 'upi' ? (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Destination UPI ID:</span>
                              <span className="text-yellow-500 font-bold">{user.upiId || 'Not Configured (Go to Settings)'}</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Bank Name:</span>
                                <span className="text-slate-200">{user.bankName || 'Not Configured'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">A/C Holder:</span>
                                <span className="text-slate-200">{user.bankHolder || 'Not Configured'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Account Number:</span>
                                <span className="text-slate-200">{user.bankAccount || 'Not Configured'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-300">IFSC Code:</span>
                                <span className="text-slate-200">{user.bankIfsc || 'Not Configured'}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={withdrawSubmitting}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-md transition-all cursor-pointer"
                        >
                          {withdrawSubmitting ? 'Requesting Settlement...' : 'Submit Withdrawal Ticket'}
                        </button>

                      </form>
                    </div>

                    {/* SETTLEMENT NOTICE CARD */}
                    <div className="md:col-span-5 glass-panel p-6 rounded-3xl space-y-4">
                      <h4 className="font-display font-bold text-yellow-500 text-sm">💡 Settlement Guard Rules</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        Admin marpit792@gmail.com approves as paid on rolling cycles. There is <strong>no minimum cashout limit</strong>. Verify credentials carefully in Settings tab before submitting payout.
                      </p>
                    </div>

                  </div>

                  {/* WITHDRAWAL TRANSACTION HISTORY */}
                  <div className="glass-panel p-5 rounded-3xl space-y-4">
                    <h5 className="font-display font-bold text-slate-200 text-sm border-b border-slate-900 pb-2">
                      My Withdrawal Tickets & History
                    </h5>

                    <div className="overflow-x-auto">
                      {withdrawals.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500 font-mono">
                          No historical withdrawal requests found.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs text-slate-400 border-collapse">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-500 font-mono">
                              <th className="py-2.5">Ticket ID</th>
                              <th className="py-2.5">Amount</th>
                              <th className="py-2.5">Method</th>
                              <th className="py-2.5">Destination details</th>
                              <th className="py-2.5">Date</th>
                              <th className="py-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {withdrawals.map((w) => (
                              <tr key={w.id} className="border-b border-slate-900/40 font-mono hover:bg-slate-900/30">
                                <td className="py-3 font-semibold text-slate-400">{w.id}</td>
                                <td className="py-3 font-bold text-rose-400">-₹{w.amount}</td>
                                <td className="py-3 uppercase">{w.method}</td>
                                <td className="py-3 text-[11px] max-w-xs truncate text-slate-305">
                                  {w.method === 'upi' ? w.details.upiId : `${w.details.bankName} (${w.details.bankAccount})`}
                                </td>
                                <td className="py-3">{new Date(w.createdAt).toLocaleDateString()}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    w.status === 'approved' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                      : w.status === 'rejected'
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
                                  }`}>
                                    {w.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* ==========================================
                  TAB: REFERRALS AND DIRECT TEAM
              ========================================== */}
              {activeTab === 'referrals' && (
                <div className="space-y-8 animate-fade-in">
                  
                  <div className="text-left space-y-2">
                    <h3 className="font-display font-black text-2xl text-slate-100 uppercase">
                      My Affiliate Tree & Direct Team
                    </h3>
                    <p className="text-xs text-slate-400">
                      View your signed up direct referrals, active packages, and total tracked commissions.
                    </p>
                  </div>

                  <div className="glass-panel p-5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono border-b border-slate-900 pb-2">
                      <span className="text-slate-400 font-bold uppercase">Referred Team Members List</span>
                      <span className="text-cyan-400">{directReferrals.length} referrals found</span>
                    </div>

                    <div className="overflow-x-auto">
                      {directReferrals.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-500 font-mono space-y-2">
                          <Users className="h-8 w-8 text-slate-600 mx-auto" />
                          <p>No referrals signed up with your invite link yet.</p>
                          <p className="text-[10px] text-slate-500">Share your invite link from the Overview tab to make direct sales!</p>
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs text-slate-400 border-collapse">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-500 font-mono">
                              <th className="py-2.5">Name</th>
                              <th className="py-2.5">Email ID</th>
                              <th className="py-2.5">Signing Date</th>
                              <th className="py-2.5">Activated Package</th>
                            </tr>
                          </thead>
                          <tbody>
                            {directReferrals.map((member, i) => (
                              <tr key={i} className="border-b border-slate-900/40 font-mono hover:bg-slate-900/30">
                                <td className="py-3 font-bold text-slate-200">{member.name}</td>
                                <td className="py-3 text-slate-400">{member.email}</td>
                                <td className="py-3">{new Date(member.createdAt).toLocaleDateString()}</td>
                                <td className="py-3">
                                  {member.activePackageId ? (
                                    <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/15">
                                      {packages.find(p=>p.id===member.activePackageId)?.name}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/15 px-2 py-0.5 rounded">
                                      PENDING
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* COMMISSIONS LEDGER */}
                  <div className="glass-panel p-5 rounded-3xl space-y-4">
                    <h4 className="font-display font-bold text-slate-200 text-sm border-b border-slate-900 pb-2">
                      My Commission Ledger (80% Commissions Detail)
                    </h4>

                    <div className="overflow-x-auto">
                      {commissions.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-500 font-mono">
                          No direct commission earnings recorded in history yet.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs text-slate-400 border-collapse">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-500 font-mono">
                              <th className="py-2.5">Ref Member</th>
                              <th className="py-2.5">Package Purchased</th>
                              <th className="py-2.5">Ecosystem Price</th>
                              <th className="py-2.5">My Commission (80%)</th>
                              <th className="py-2.5">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {commissions.map((c) => (
                              <tr key={c.id} className="border-b border-slate-900/40 font-mono hover:bg-slate-900/30">
                                <td className="py-3 font-bold text-slate-300">{c.referredUserName}</td>
                                <td className="py-3 text-slate-400">{c.packageName}</td>
                                <td className="py-3">₹{(c.amount / 0.8).toFixed(2)}</td>
                                <td className="py-3 text-emerald-400 font-extrabold">+₹{c.amount.toFixed(2)}</td>
                                <td className="py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* ==========================================
                  TAB: SETTINGS (PAYOUT SETTINGS)
              ========================================== */}
              {activeTab === 'settings' && (
                <div className="space-y-8 animate-fade-in">
                  
                  <div className="text-left space-y-2">
                    <h3 className="font-display font-black text-2xl text-slate-100 uppercase">
                      Payout Destination Settings
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      Update your UPI Address or direct Bank Credentials below. These parameters are used by the administrator to verify and disburse your payout requests successfully.
                    </p>
                  </div>

                  <div className="glass-panel p-6 sm:p-8 rounded-3xl relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/3 rounded-full blur-2xl"></div>

                    <h4 className="font-display font-bold text-slate-200 text-base mb-6">
                      Bank Transfer and UPI Information
                    </h4>

                    {settingsMsg.text && (
                      <div className={`p-4 rounded-xl text-xs font-medium mb-6 flex items-center space-x-2.5 ${
                        settingsMsg.type === 'success' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}>
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{settingsMsg.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleSettingsSave} className="space-y-5">
                      {/* UPI ID */}
                      <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-1">UPI Address (Recommended / Quickest)</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. rohan@upi"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-100 font-mono transition-colors"
                        />
                        <p className="text-[10px] text-slate-500 font-mono mt-1">UPI ID for instant phone transfers.</p>
                      </div>

                      <div className="h-px bg-slate-900"></div>

                      <div className="space-y-4">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">
                          Reserve Option: Direct Bank Credentials
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              placeholder="e.g. State Bank of India"
                              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-200 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Account Holder Name</label>
                            <input
                              type="text"
                              value={bankHolder}
                              onChange={(e) => setBankHolder(e.target.value)}
                              placeholder="e.g. Rohan Sharma"
                              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-200 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Bank Account Number</label>
                            <input
                              type="text"
                              value={bankAccount}
                              onChange={(e) => setBankAccount(e.target.value)}
                              placeholder="e.g. 1004851239"
                              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-100 font-mono transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Bank IFSC Code</label>
                            <input
                              type="text"
                              value={bankIfsc}
                              onChange={(e) => setBankIfsc(e.target.value)}
                              placeholder="e.g. SBIN0002103"
                              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-100 font-mono tracking-wider transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={settingsSaving}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 text-slate-950 font-black text-sm tracking-wide hover:scale-101 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {settingsSaving ? 'Saving parameters...' : 'Save Payout destination'}
                      </button>

                    </form>
                  </div>

                </div>
              )}

            </>
          )}

        </div>

      </div>

    </div>
  );
}
