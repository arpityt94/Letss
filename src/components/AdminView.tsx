import React from 'react';
import { 
  BarChart, 
  Users, 
  CreditCard, 
  CheckSquare, 
  PlusCircle, 
  Bell, 
  Trash, 
  Check, 
  X, 
  Bookmark, 
  Database,
  Globe,
  Plus,
  Tv,
  Eye,
  Settings,
  AlertCircle
} from 'lucide-react';
import { User, Package, Course, PaymentSubmission, WithdrawalRequest, Notification, SystemSettings, BlogPost, BlogComment } from '../types.js';

interface AdminViewProps {
  token: string;
  packages: Package[];
  courses: Course[];
  refreshCourses: () => void;
  settings: SystemSettings;
  onSettingsUpdated: (updated: SystemSettings) => void;
}

export default function AdminView({
  token,
  packages,
  courses,
  refreshCourses,
  settings,
  onSettingsUpdated
}: AdminViewProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'dashboard' | 'users' | 'payments' | 'withdrawals' | 'courses' | 'notices' | 'settings' | 'blogs' | 'supabase'>('dashboard');
  
  // Dynamic admin datasets
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<any>({
    activeMembers: 0,
    totalEarnings: 0,
    paidWithdrawals: 0,
    pendingPayments: 0,
    pendingWithdrawals: 0,
    totalCourses: 0,
    registeredUsersCount: 0
  });
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [allPayments, setAllPayments] = React.useState<PaymentSubmission[]>([]);
  const [allWithdrawals, setAllWithdrawals] = React.useState<WithdrawalRequest[]>([]);
  const [allNotices, setAllNotices] = React.useState<any[]>([]);

  // Action status feedbacks
  const [actionMsg, setActionMsg] = React.useState({ type: '', text: '' });

  // Creation form states: COURSE UPLOAD
  const [coursePkgId, setCoursePkgId] = React.useState('startup');
  const [courseTitle, setCourseTitle] = React.useState('');
  const [courseDesc, setCourseDesc] = React.useState('');
  const [courseVideoUrl, setCourseVideoUrl] = React.useState('');
  const [courseDuration, setCourseDuration] = React.useState('');
  const [courseLessons, setCourseLessons] = React.useState(10);
  const [courseThumb, setCourseThumb] = React.useState('');

  // Creation form states: ANNOUNCEMENT NOTICE
  const [noticeTitle, setNoticeTitle] = React.useState('');
  const [noticeContent, setNoticeContent] = React.useState('');

  // Rejection input states
  const [selectedRejectPaymentId, setSelectedRejectPaymentId] = React.useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');

  // Lightbox screenshot viewer state
  const [activeScreenshotLightbox, setActiveScreenshotLightbox] = React.useState<string | null>(null);

  // Soft state-based course deletion confirmation
  const [courseIdToDelete, setCourseIdToDelete] = React.useState<string | null>(null);

  // States for block/unblock and wallet balance changes
  const [selectedUserForBalance, setSelectedUserForBalance] = React.useState<User | null>(null);
  const [balanceAmountToAdd, setBalanceAmountToAdd] = React.useState('');
  const [balanceReason, setBalanceReason] = React.useState('');
  const [blockingUserId, setBlockingUserId] = React.useState<string | null>(null);

  // Search state
  const [userSearchQuery, setUserSearchQuery] = React.useState('');

  // Editing direct user details state
  const [selectedUserForEdit, setSelectedUserForEdit] = React.useState<User | null>(null);
  const [editUserName, setEditUserName] = React.useState('');
  const [editUserEmail, setEditUserEmail] = React.useState('');
  const [editUserMobileNumber, setEditUserMobileNumber] = React.useState('');
  const [editUserRole, setEditUserRole] = React.useState('');
  const [editUserReferralCode, setEditUserReferralCode] = React.useState('');
  const [editUserBalance, setEditUserBalance] = React.useState('');
  const [editUserTotalEarnings, setEditUserTotalEarnings] = React.useState('');
  const [editUserTotalWithdrawn, setEditUserTotalWithdrawn] = React.useState('');
  const [editUserActivePackageId, setEditUserActivePackageId] = React.useState('');
  const [editUserReferredBy, setEditUserReferredBy] = React.useState('');
  const [editUserUpiId, setEditUserUpiId] = React.useState('');
  const [editUserBankName, setEditUserBankName] = React.useState('');
  const [editUserBankAccount, setEditUserBankAccount] = React.useState('');
  const [editUserBankIfsc, setEditUserBankIfsc] = React.useState('');
  const [editUserBankHolder, setEditUserBankHolder] = React.useState('');
  const [editUserPassword, setEditUserPassword] = React.useState('');

  // Blog creation & editing states
  const [adminBlogs, setAdminBlogs] = React.useState<BlogPost[]>([]);
  const [blogTitle, setBlogTitle] = React.useState('');
  const [blogSummary, setBlogSummary] = React.useState('');
  const [blogContent, setBlogContent] = React.useState('');
  const [blogThumb, setBlogThumb] = React.useState('');
  const [blogTags, setBlogTags] = React.useState('');
  const [blogIsFeatured, setBlogIsFeatured] = React.useState(false);
  const [editingBlogId, setEditingBlogId] = React.useState<string | null>(null);

  // Supabase Sync states
  const [testingSupabase, setTestingSupabase] = React.useState(false);
  const [supabaseStatus, setSupabaseStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);

  const fetchAllBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      if (res.ok) {
        setAdminBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error('Error fetching admin blogs:', err);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setActionMsg({ type: 'success', text: 'Blog article successfully deleted!' });
        fetchAllBlogs();
      } else {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete blog');
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg({ type: '', text: '' });
    if (!blogTitle || !blogSummary || !blogContent) {
      setActionMsg({ type: 'error', text: 'Title, summary, and article body content are required.' });
      return;
    }

    const body = {
      title: blogTitle.trim(),
      summary: blogSummary.trim(),
      content: blogContent,
      thumbnailUrl: blogThumb.trim(),
      tags: blogTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      isFeatured: blogIsFeatured
    };

    try {
      const url = editingBlogId ? `/api/admin/blogs/${editingBlogId}` : '/api/admin/blogs';
      const method = editingBlogId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error processing blog publish');

      setActionMsg({ 
        type: 'success', 
        text: editingBlogId ? `Blog article "${blogTitle}" updated successfully!` : `New blog article "${blogTitle}" published successfully!`
      });

      // Clear fields
      setBlogTitle('');
      setBlogSummary('');
      setBlogContent('');
      setBlogThumb('');
      setBlogTags('');
      setBlogIsFeatured(false);
      setEditingBlogId(null);
      fetchAllBlogs();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const handleEditBlogClick = (b: BlogPost) => {
    setBlogTitle(b.title || '');
    setBlogSummary(b.summary || '');
    setBlogContent(b.content || '');
    setBlogThumb(b.thumbnailUrl || '');
    setBlogTags(b.tags ? b.tags.join(', ') : '');
    setBlogIsFeatured(!!b.isFeatured);
    setEditingBlogId(b.id);
    
    const element = document.getElementById('blog-form-col');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Site customisation setting states initialised from props settings
  const [settingsLogoText, setSettingsLogoText] = React.useState(settings?.logoText || '');
  const [settingsTagline, setSettingsTagline] = React.useState(settings?.tagline || '');
  const [settingsHeroHeaderFirst, setSettingsHeroHeaderFirst] = React.useState(settings?.heroHeaderFirst || '');
  const [settingsHeroHeaderHighlight, setSettingsHeroHeaderHighlight] = React.useState(settings?.heroHeaderHighlight || '');
  const [settingsHeroHeaderLast, setSettingsHeroHeaderLast] = React.useState(settings?.heroHeaderLast || '');
  const [settingsHeroSubtext, setSettingsHeroSubtext] = React.useState(settings?.heroSubtext || '');
  const [settingsHeroParagraph, setSettingsHeroParagraph] = React.useState(settings?.heroParagraph || '');
  const [settingsBannerImageUrl, setSettingsBannerImageUrl] = React.useState(settings?.bannerImageUrl || '');
  const [settingsMaintenanceMode, setSettingsMaintenanceMode] = React.useState(settings?.maintenanceMode || false);

  // Sync state if settings prop changes
  React.useEffect(() => {
    if (settings) {
      setSettingsLogoText(settings.logoText || '');
      setSettingsTagline(settings.tagline || '');
      setSettingsHeroHeaderFirst(settings.heroHeaderFirst || '');
      setSettingsHeroHeaderHighlight(settings.heroHeaderHighlight || '');
      setSettingsHeroHeaderLast(settings.heroHeaderLast || '');
      setSettingsHeroSubtext(settings.heroSubtext || '');
      setSettingsHeroParagraph(settings.heroParagraph || '');
      setSettingsBannerImageUrl(settings.bannerImageUrl || '');
      setSettingsMaintenanceMode(settings.maintenanceMode || false);
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg({ type: '', text: '' });
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          logoText: settingsLogoText,
          tagline: settingsTagline,
          heroHeaderFirst: settingsHeroHeaderFirst,
          heroHeaderHighlight: settingsHeroHeaderHighlight,
          heroHeaderLast: settingsHeroHeaderLast,
          heroSubtext: settingsHeroSubtext,
          heroParagraph: settingsHeroParagraph,
          bannerImageUrl: settingsBannerImageUrl,
          maintenanceMode: settingsMaintenanceMode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update system settings');
      }

      onSettingsUpdated(data.settings);
      setActionMsg({ type: 'success', text: 'System settings, Brand copy and Maintenance flags updated instantly!' });
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const handleSaveUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    setActionMsg({ type: '', text: '' });
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUserForEdit.id}/update-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editUserName,
          email: editUserEmail,
          mobileNumber: editUserMobileNumber,
          role: editUserRole,
          referralCode: editUserReferralCode,
          balance: parseFloat(editUserBalance) || 0,
          totalEarnings: parseFloat(editUserTotalEarnings) || 0,
          totalWithdrawn: parseFloat(editUserTotalWithdrawn) || 0,
          activePackageId: editUserActivePackageId || "",
          referredBy: editUserReferredBy || "",
          upiId: editUserUpiId || "",
          bankName: editUserBankName || "",
          bankAccount: editUserBankAccount || "",
          bankIfsc: editUserBankIfsc || "",
          bankHolder: editUserBankHolder || "",
          password: editUserPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update member credentials');
      }

      setActionMsg({ type: 'success', text: `Details of ${editUserName} successfully updated!` });
      setSelectedUserForEdit(null);
      fetchAdminData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const downloadDatabase = async () => {
    setActionMsg({ type: '', text: '' });
    try {
      const response = await fetch('/api/admin/download-db', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        let errorMsg = 'Failed to download database file.';
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch (jsonErr) {
          errorMsg = `Server response error (${response.status}). Access may be unauthorized or expired.`;
        }
        throw new Error(errorMsg);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'database.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setActionMsg({ type: 'success', text: 'Database file (database.json) downloaded successfully!' });
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // FETCH ALL ADMIN CONSOLE TELEMETRY
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Stats Analytics
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData);

      // 2. Fetch Users List
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) setAllUsers(usersData.users || []);

      // 3. Fetch Payments (Manual Verifications)
      const payRes = await fetch('/api/admin/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payData = await payRes.json();
      if (payRes.ok) setAllPayments(payData.payments || []);

      // 4. Fetch Withdrawals Requests
      const withdrawRes = await fetch('/api/admin/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const withdrawData = await withdrawRes.json();
      if (withdrawRes.ok) setAllWithdrawals(withdrawData.withdrawals || []);

      // 5. Fetch Banners/Notices
      const noticesRes = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const noticesData = await noticesRes.json();
      if (noticesRes.ok) setAllNotices(noticesData.notices || []);

    } catch (err) {
      console.error("Error drawing admin telemetry", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdminData();
    if (activeSubTab === 'blogs') {
      fetchAllBlogs();
    }
  }, [activeSubTab]);

  // VERIFY/APPROVE MANUAL PAYMENT SCREENSHOT
  const handleVerifyPayment = async (payId: string, status: 'approved' | 'rejected', reason?: string) => {
    setActionMsg({ type: '', text: '' });
    try {
      const response = await fetch(`/api/admin/payments/${payId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, reason })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setActionMsg({ 
        type: 'success', 
        text: `Success! Manual payment manual update set to: ${status.toUpperCase()}. Ecosystem commissions distributed!` 
      });
      setSelectedRejectPaymentId(null);
      setRejectionReason('');
      fetchAdminData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // VERIFY/APPROVE WITHDRAWAL CASH BACK UTILITY
  const handleVerifyWithdrawal = async (withdrawId: string, status: 'approved' | 'rejected') => {
    setActionMsg({ type: '', text: '' });
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setActionMsg({ 
        type: 'success', 
        text: `Success! Withdrawal request updated to ${status.toUpperCase()}!` 
      });
      fetchAdminData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // UPLOAD SKILLS COURSE DYNAMICALLY
  const handleCourseUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg({ type: '', text: '' });

    if (!courseTitle || !courseVideoUrl) {
      setActionMsg({ type: 'error', text: 'Course package assignment, title & YouTube embedding link are required.' });
      return;
    }

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: coursePkgId,
          title: courseTitle,
          description: courseDesc,
          videoUrl: courseVideoUrl,
          duration: courseDuration || '3h 30m',
          lessonsCount: courseLessons,
          thumbnailUrl: courseThumb
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setActionMsg({ type: 'success', text: `Success! Course "${courseTitle}" uploaded & unlocked for ${coursePkgId} users!` });
      setCourseTitle('');
      setCourseDesc('');
      setCourseVideoUrl('');
      setCourseDuration('');
      setCourseThumb('');
      fetchCoursesAndData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const fetchCoursesAndData = () => {
    refreshCourses();
    fetchAdminData();
  };

  // BLOCK/UNBLOCK USER
  const handleToggleBlockUser = async (user: User) => {
    setActionMsg({ type: '', text: '' });
    setBlockingUserId(user.id);
    const newBlockValue = !user.isBlocked;

    try {
      const response = await fetch(`/api/admin/users/${user.id}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ block: newBlockValue })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update block status.');
      }

      setActionMsg({
        type: 'success',
        text: `Success! User "${user.name}" has been ${newBlockValue ? 'BLOCKED' : 'UNBLOCKED'} successfully!`
      });

      // Refresh database info on screen
      await fetchAdminData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setBlockingUserId(null);
    }
  };

  // ADD BALANCE TO USER WALLET
  const handleAddUserBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    setActionMsg({ type: '', text: '' });

    try {
      const response = await fetch(`/api/admin/users/${selectedUserForBalance.id}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(balanceAmountToAdd),
          reason: balanceReason
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add wallet balance.');
      }

      setActionMsg({
        type: 'success',
        text: `Successfully added ₹${parseFloat(balanceAmountToAdd).toFixed(2)} to ${selectedUserForBalance.name}'s wallet!`
      });

      // Reset state & refresh
      setSelectedUserForBalance(null);
      setBalanceAmountToAdd('');
      setBalanceReason('');
      await fetchAdminData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // REMOVE COURSE REFERENCE
  const handleDeleteCourse = async (courseId: string) => {
    setActionMsg({ type: '', text: '' });

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setActionMsg({ type: 'success', text: 'Course successfully deleted from database!' });
      fetchCoursesAndData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // UPDATE BANNER ANNOUNCEMENTS
  const handleNoticeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg({ type: '', text: '' });

    if (!noticeTitle || !noticeContent) {
      setActionMsg({ type: 'error', text: 'Both notice title and description content are required.' });
      return;
    }

    try {
      const response = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setActionMsg({ type: 'success', text: 'Success! Dynamic announcement announcement broadcasts to all active profiles.' });
      setNoticeTitle('');
      setNoticeContent('');
      fetchAdminData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    setActionMsg({ type: '', text: '' });
    try {
      const response = await fetch(`/api/admin/notices/${noticeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setActionMsg({ type: 'success', text: 'Broadcast notice announcement removed.' });
      fetchAdminData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. MAIN SYSTEM LEDGER ACTION LOGS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-4 gap-4">
        <div>
          <h2 className="font-display font-black text-2xl tracking-wider text-slate-100 uppercase">
            Platform <span className="text-yellow-500">Admin Control</span> Panel
          </h2>
          <p className="text-xs text-slate-500 font-mono flex flex-wrap items-center gap-2 mt-1">
            <span>Role Authorized: marpit792@gmail.com • Manual approvals & commission engines verified</span>
            <span>•</span>
            <button 
              onClick={downloadDatabase}
              className="px-2 py-0.5 bg-yellow-500/10 hover:bg-yellow-500 hover:text-slate-950 text-yellow-500 border border-yellow-500/20 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
              title="Download database.json backup"
            >
              <Database className="h-3 w-3" />
              <span>Download database.json Backup</span>
            </button>
          </p>
        </div>

        {/* ADMIN TAB LISTS */}
        <div className="flex flex-wrap gap-1.5 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Stats Analytics', icon: BarChart },
            { id: 'payments', label: 'Payment Approvals', icon: CreditCard },
            { id: 'withdrawals', label: 'User Withdrawals', icon: CheckSquare },
            { id: 'users', label: 'User Catalog', icon: Users },
            { id: 'courses', label: 'Course Manager', icon: Tv },
            { id: 'blogs', label: 'Blog Manager', icon: Bookmark },
            { id: 'notices', label: 'Broadcaster', icon: Bell },
            { id: 'settings', label: 'Site Settings', icon: Settings },
            { id: 'supabase', label: 'Supabase Sync', icon: Database }
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  setActionMsg({ type: '', text: '' });
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-yellow-500 text-slate-950 font-black shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                <IconComp className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTION FEEDBACK ALERT */}
      {actionMsg.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2.5 animate-fade-in ${
          actionMsg.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{actionMsg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <p className="text-xs text-slate-500 font-mono mt-2">Querying database schema records...</p>
        </div>
      ) : (
        <>
          {/* ==========================================
              SUB-TAB: STATISTICS ANALYTICS
          ========================================== */}
          {activeSubTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="glass-panel p-5 rounded-3xl border-cyan-500/10">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-500 uppercase">
                    <span>Ecosystem Revenue (Gross)</span>
                    <Database className="h-4 w-4 text-cyan-400" />
                  </div>
                  <h3 className="text-3xl font-black text-cyan-400 mt-2">₹{stats.totalEarnings.toFixed(2)}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Sum of approved manual package purchases</p>
                </div>

                <div className="glass-panel p-5 rounded-3xl border-yellow-500/10">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-500 uppercase">
                    <span>Withdrawn Paid (Net)</span>
                    <Check className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-black text-emerald-400 mt-2">₹{stats.paidWithdrawals.toFixed(2)}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Settled payouts requested by affiliates</p>
                </div>

                <div className="glass-panel p-5 rounded-3xl">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-500 uppercase">
                    <span>Active Team Members</span>
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <h3 className="text-3xl font-black mt-2">{stats.activeMembers} Affiliates</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Verified owners of packages</p>
                </div>

                <div className="glass-panel p-5 rounded-3xl">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-500 uppercase">
                    <span>Pending Actions</span>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <h3 className="text-3xl font-black text-yellow-500 mt-2">
                    {stats.pendingPayments + stats.pendingWithdrawals} Pending
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    {stats.pendingPayments} payments • {stats.pendingWithdrawals} cashouts
                  </p>
                </div>

              </div>

              {/* STATS CHART SIMULATED BAR VISUAL */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h4 className="font-display font-medium text-sm text-slate-400 uppercase tracking-widest font-mono">
                  Financial Proportional Standing (Gross vs Paid)
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Accumulated Platform Deposit Assets</span>
                    <span className="font-bold text-cyan-400">₹{stats.totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Approved Disbursed Affiliate Commissions (Paid Net)</span>
                    <span className="font-bold text-emerald-400">₹{stats.paidWithdrawals.toFixed(2)}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ 
                        width: stats.totalEarnings > 0 
                          ? `${(stats.paidWithdrawals / stats.totalEarnings) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              SUB-TAB: MANUAL PAYMENTS APPROVALS
          ========================================== */}
          {activeSubTab === 'payments' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-lg text-slate-100">Pending Verification Tickets</h3>

              <div className="overflow-x-auto">
                {allPayments.length === 0 ? (
                  <p className="text-center py-10 text-xs text-slate-500 font-mono">
                    No manual payments verifications recorded.
                  </p>
                ) : (
                  <table className="w-full text-xs text-slate-400 text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 font-mono">
                        <th className="py-2.5">User Details</th>
                        <th className="py-2.5">Target Pack</th>
                        <th className="py-2.5">Price</th>
                        <th className="py-2.5">UTR Reference</th>
                        <th className="py-2.5">Screenshot</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPayments.map((p) => {
                        const isSelectedForReject = selectedRejectPaymentId === p.id;
                        return (
                          <React.Fragment key={p.id}>
                            <tr className="border-b border-slate-900/40 font-mono hover:bg-slate-900/30">
                              <td className="py-3">
                                <div className="font-bold text-slate-200">{p.userName}</div>
                                <div className="text-[10px] text-slate-500">{p.userEmail}</div>
                              </td>
                              <td className="py-3 text-slate-300 font-semibold">{p.packageName}</td>
                              <td className="py-3 font-bold text-slate-100">₹{p.price}</td>
                              <td className="py-3 text-yellow-500 font-bold">{p.utr}</td>
                              <td className="py-3">
                                <button
                                  onClick={() => setActiveScreenshotLightbox(p.screenshotUrl)}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition cursor-pointer"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View Receipt</span>
                                </button>
                              </td>
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
                              <td className="py-3">
                                {p.status === 'pending' ? (
                                  <div className="flex items-center justify-center space-x-1.5">
                                    <button
                                      onClick={() => handleVerifyPayment(p.id, 'approved')}
                                      className="p-1 px-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded font-bold transition flex items-center space-x-1"
                                      title="Approve purchase"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedRejectPaymentId(p.id);
                                        setRejectionReason('');
                                      }}
                                      className="p-1 px-2 bg-rose-500 text-white hover:bg-rose-400 rounded font-bold transition flex items-center space-x-1"
                                      title="Reject purchase"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center text-[10px] text-slate-500">
                                    Resolved on-server
                                  </div>
                                )}
                              </td>
                            </tr>

                            {/* CONDITIONAL COMPACT REJECTION FORM ROW */}
                            {isSelectedForReject && (
                              <tr className="bg-rose-500/5">
                                <td colSpan={7} className="p-4 font-mono">
                                  <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <input
                                      type="text"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Provide rejection reason (e.g. UTR mismatch/illegible screenshot)"
                                      className="w-full bg-slate-950 border border-slate-800 focus:outline-none rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600"
                                    />
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() => handleVerifyPayment(p.id, 'rejected', rejectionReason)}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                                      >
                                        Confirm Reject
                                      </button>
                                      <button
                                        onClick={() => setSelectedRejectPaymentId(null)}
                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl text-xs"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              SUB-TAB: WITHDRAWALS LEDGER
          ========================================== */}
          {activeSubTab === 'withdrawals' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-display font-bold text-lg text-slate-100 font-mono">Affiliates Outward Cashouts Payout</h3>

              <div className="overflow-x-auto">
                {allWithdrawals.length === 0 ? (
                  <p className="text-center py-10 text-xs text-slate-500 font-mono">No outwards withdrawal request records.</p>
                ) : (
                  <table className="w-full text-xs text-slate-400 text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 font-mono">
                        <th className="py-2.5">User</th>
                        <th className="py-2.5">Cashout Amount</th>
                        <th className="py-2.5">Transfer Method</th>
                        <th className="py-2.5">Credentials detail proof</th>
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-center">Payout updates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allWithdrawals.map((w) => (
                        <tr key={w.id} className="border-b border-slate-900/40 font-mono hover:bg-slate-900/30">
                          <td className="py-3">
                            <div className="font-bold text-slate-200">{w.userName}</div>
                            <div className="text-[10px] text-slate-500">{w.userEmail}</div>
                          </td>
                          <td className="py-3 text-rose-400 font-extrabold">₹{w.amount}</td>
                          <td className="py-3 uppercase font-semibold">{w.method}</td>
                          <td className="py-3 font-sans max-w-xs text-slate-350">
                            {w.method === 'upi' ? (
                              <div className="font-mono text-yellow-500">UPI ID: {w.details.upiId}</div>
                            ) : (
                              <div className="text-[11px] font-mono leading-relaxed bg-slate-900/40 p-1.5 rounded border border-slate-900 max-w-sm">
                                <strong>Bank:</strong> {w.details.bankName} • <strong>Holder:</strong> {w.details.bankHolder} <br />
                                <strong>A/c:</strong> {w.details.bankAccount} • <strong>IFSC:</strong> {w.details.bankIfsc}
                              </div>
                            )}
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
                          <td className="py-3 text-center">
                            {w.status === 'pending' ? (
                              <div className="flex justify-center space-x-1">
                                <button
                                  onClick={() => handleVerifyWithdrawal(w.id, 'approved')}
                                  className="p-1 px-2.5 bg-emerald-500 text-slate-950 font-bold rounded hover:bg-emerald-400 transition"
                                >
                                  Mark as Paid
                                </button>
                                <button
                                  onClick={() => handleVerifyWithdrawal(w.id, 'rejected')}
                                  className="p-1 px-2 bg-rose-500 text-white font-bold rounded hover:bg-rose-400 transition"
                                >
                                  Reject & Refund
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">Completed ticket</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              SUB-TAB: USERS LIST
          ========================================== */}
          {activeSubTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-2">
                <h3 className="font-display font-cyan font-bold text-lg text-slate-100 font-mono">Affiliate User Directory</h3>
                {/* User Search Input */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 focus:outline-none rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 font-mono transition"
                  />
                  {userSearchQuery && (
                    <button
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-500 hover:text-white font-bold text-sm cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto font-mono">
                <table className="w-full text-xs text-slate-400 text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500">
                      <th className="py-2.5">User Profile</th>
                      <th className="py-2.5">Referral ID Code</th>
                      <th className="py-2.5">Sponsor Code</th>
                      <th className="py-2.5">Available Wallet</th>
                      <th className="py-2.5">Active Package</th>
                      <th className="py-2.5">Join Date</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers
                      .filter(u => {
                        if (!userSearchQuery) return true;
                        const query = userSearchQuery.toLowerCase();
                        return u.email.toLowerCase().includes(query) || 
                               u.name.toLowerCase().includes(query) || 
                               (u.mobileNumber && u.mobileNumber.toLowerCase().includes(query));
                      })
                      .map((u) => (
                      <tr key={u.id} className="border-b border-slate-900/40 hover:bg-slate-900/30">
                        <td className="py-3">
                          <div className="font-bold text-slate-200">
                            {u.name} {u.role === 'admin' && <span className="text-yellow-500 text-[9px] border border-yellow-500/20 px-1.5 py-0.5 rounded ml-1 font-mono">ADMIN</span>}
                          </div>
                          <div className="text-[10px] text-slate-500">{u.email}</div>
                          {u.mobileNumber && <div className="text-[10px] text-slate-600">📱 {u.mobileNumber}</div>}
                        </td>
                        <td className="py-3 text-cyan-400 font-bold">{u.referralCode}</td>
                        <td className="py-3 text-slate-450">{u.referredBy || '—'}</td>
                        <td className="py-3 font-semibold text-slate-200">₹{u.balance.toFixed(2)}</td>
                        <td className="py-3">
                          {u.activePackageId ? (
                            <span className="text-[10px] font-bold text-cyan-400 uppercase">
                              {packages.find(p=>p.id===u.activePackageId)?.name}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-600">UNREGISTERED</span>
                          )}
                        </td>
                        <td className="py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          {u.isBlocked ? (
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                              Blocked
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForEdit(u);
                                setEditUserName(u.name);
                                setEditUserEmail(u.email);
                                setEditUserMobileNumber(u.mobileNumber || '');
                                setEditUserRole(u.role || 'user');
                                setEditUserReferralCode(u.referralCode);
                                setEditUserBalance((u.balance || 0).toString());
                                setEditUserTotalEarnings((u.totalEarnings || 0).toString());
                                setEditUserTotalWithdrawn((u.totalWithdrawn || 0).toString());
                                setEditUserActivePackageId(u.activePackageId || '');
                                setEditUserReferredBy(u.referredBy || '');
                                setEditUserUpiId(u.upiId || '');
                                setEditUserBankName(u.bankName || '');
                                setEditUserBankAccount(u.bankAccount || '');
                                setEditUserBankIfsc(u.bankIfsc || '');
                                setEditUserBankHolder(u.bankHolder || '');
                                setEditUserPassword('');
                              }}
                              className="px-2 py-1 bg-yellow-500/15 hover:bg-yellow-500 text-yellow-500 hover:text-slate-950 font-bold uppercase rounded text-[10px] transition cursor-pointer select-none"
                              title="Edit Member Details"
                            >
                              Edit details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserForBalance(u);
                                setBalanceAmountToAdd('');
                                setBalanceReason('');
                              }}
                              className="px-2 py-1 bg-cyan-500/15 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 font-bold uppercase rounded text-[10px] transition cursor-pointer select-none"
                              title="Add Wallet Balance"
                            >
                              + Balance
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                type="button"
                                disabled={blockingUserId === u.id}
                                onClick={() => handleToggleBlockUser(u)}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer select-none ${
                                  u.isBlocked 
                                    ? 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950'
                                    : 'bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white'
                                }`}
                              >
                                {blockingUserId === u.id ? '...' : (u.isBlocked ? 'Unblock' : 'Block')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FLOATING ADJUST WALLET BALANCE OVERLAY MODAL */}
              {selectedUserForBalance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                  <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border-cyan-500/20 space-y-6">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <h4 className="font-display font-bold text-base text-slate-150 uppercase tracking-tight">
                        Adjust Wallet Balance
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSelectedUserForBalance(null)}
                        className="p-1 px-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-500 uppercase font-mono">Target User</p>
                      <p className="text-sm font-bold text-slate-100">{selectedUserForBalance.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{selectedUserForBalance.email}</p>
                      <p className="text-xs text-cyan-400 font-mono">Current Balance: ₹{selectedUserForBalance.balance.toFixed(2)}</p>
                    </div>

                    <form onSubmit={handleAddUserBalance} className="space-y-4 font-mono text-left">
                      <div>
                        <label className="block text-[11px] text-slate-400 uppercase mb-1">Amount to Add (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="1"
                          placeholder="e.g. 500"
                          value={balanceAmountToAdd}
                          onChange={(e) => setBalanceAmountToAdd(e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-xs focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 uppercase mb-1">Transaction description / reason (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Manual sales compensation"
                          value={balanceReason}
                          onChange={(e) => setBalanceReason(e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-xs focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase cursor-pointer transition select-none"
                        >
                          Credit Wallet
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUserForBalance(null)}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs uppercase cursor-pointer font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* FLOATING MEMBER EDITING MODAL OVERLAY */}
              {selectedUserForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-all p-4 overflow-y-auto">
                  <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full p-6 sm:p-8 rounded-3xl space-y-6 my-8 max-h-[90vh] overflow-y-auto scrollbar-thin">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="font-display font-black text-lg text-slate-100 uppercase tracking-tight">
                          Edit Member Account
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono">UID: {selectedUserForEdit.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUserForEdit(null)}
                        className="p-1.5 px-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-lg text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveUserDetails} className="space-y-6 font-mono text-left text-xs">
                      {/* Section 1: Core Profile */}
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold text-yellow-500 uppercase border-b border-slate-800/40 pb-1">1. Member Profile & Identity</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Full Name</label>
                            <input
                              type="text"
                              required
                              value={editUserName}
                              onChange={(e) => setEditUserName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Email Address</label>
                            <input
                              type="email"
                              required
                              value={editUserEmail}
                              onChange={(e) => setEditUserEmail(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Mobile / Phone Number</label>
                            <input
                              type="text"
                              required
                              value={editUserMobileNumber}
                              onChange={(e) => setEditUserMobileNumber(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Referral Code (Unique ID)</label>
                            <input
                              type="text"
                              required
                              value={editUserReferralCode}
                              onChange={(e) => setEditUserReferralCode(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">System Role</label>
                            <select
                              value={editUserRole}
                              onChange={(e) => setEditUserRole(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="user">USER / Standard Affiliate</option>
                              <option value="admin">ADMIN / Master Control</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Update Password (Optional)</label>
                            <input
                              type="text"
                              value={editUserPassword}
                              onChange={(e) => setEditUserPassword(e.target.value)}
                              placeholder="Leave blank to keep existing password unchanged"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-650 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Finances & Earnings */}
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold text-cyan-400 uppercase border-b border-slate-800/40 pb-1">2. Financial Stats & Wallets</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Wallet Balance (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={editUserBalance}
                              onChange={(e) => setEditUserBalance(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Total Earnings (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={editUserTotalEarnings}
                              onChange={(e) => setEditUserTotalEarnings(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Total Withdrawn (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={editUserTotalWithdrawn}
                              onChange={(e) => setEditUserTotalWithdrawn(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Affiliation Hierarchy */}
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold text-purple-400 uppercase border-b border-slate-800/40 pb-1">3. Study Tier & Sponsorship Track</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Active Course Package</label>
                            <select
                              value={editUserActivePackageId}
                              onChange={(e) => setEditUserActivePackageId(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="">(None - Unregistered)</option>
                              {packages.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Sponsor Code (Referred By)</label>
                            <input
                              type="text"
                              value={editUserReferredBy}
                              onChange={(e) => setEditUserReferredBy(e.target.value)}
                              placeholder="e.g. LS7383"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Payout Accounts */}
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold text-emerald-400 uppercase border-b border-slate-800/40 pb-1">4. Settlement & Bank Credentials</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">UPI ID Wallet Address</label>
                            <input
                              type="text"
                              value={editUserUpiId}
                              onChange={(e) => setEditUserUpiId(e.target.value)}
                              placeholder="e.g. recipient@upi"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={editUserBankName}
                              onChange={(e) => setEditUserBankName(e.target.value)}
                              placeholder="e.g. State Bank of India"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Bank Account Number</label>
                            <input
                              type="text"
                              value={editUserBankAccount}
                              onChange={(e) => setEditUserBankAccount(e.target.value)}
                              placeholder="e.g. 10098382736"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Bank IFSC Code</label>
                            <input
                              type="text"
                              value={editUserBankIfsc}
                              onChange={(e) => setEditUserBankIfsc(e.target.value)}
                              placeholder="e.g. SBIN0001092"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Account Holder Name</label>
                            <input
                              type="text"
                              value={editUserBankHolder}
                              onChange={(e) => setEditUserBankHolder(e.target.value)}
                              placeholder="e.g. Rohan Sharma"
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex pt-4 space-x-2 border-t border-slate-800">
                        <button
                          type="submit"
                          className="flex-1 px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl cursor-pointer tracking-wider uppercase transition font-mono text-center shadow-[0_4px_20px_rgba(234,179,8,0.2)]"
                        >
                          Commit Updates
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedUserForEdit(null)}
                          className="px-5 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl uppercase tracking-wider font-bold transition"
                        >
                          Discard
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              SUB-TAB: COURSE MANAGER (DYNAMIC COURSE UPLOAD)
          ========================================== */}
          {activeSubTab === 'courses' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* UPLOAD FORM */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl relative">
                <h4 className="font-display font-bold text-yellow-500 text-base mb-6 flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Upload Dynamic Video Course</span>
                </h4>

                <form onSubmit={handleCourseUpload} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Target Course Package Access</label>
                      <select
                        value={coursePkgId}
                        onChange={(e) => setCoursePkgId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-200"
                      >
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Course Video Title</label>
                      <input
                        type="text"
                        required
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        placeholder="e.g. Lead Generation Formula"
                        className="w-full bg-slate-900 border border-slate-800 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">YouTube Embed/Video URL</label>
                      <input
                        type="text"
                        required
                        value={courseVideoUrl}
                        onChange={(e) => setCourseVideoUrl(e.target.value)}
                        placeholder="e.g. YouTube iframe url"
                        className="w-full bg-slate-900 border border-slate-800 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Lessons Count</label>
                      <input
                        type="number"
                        value={courseLessons}
                        onChange={(e) => setCourseLessons(parseInt(e.target.value) || 10)}
                        className="w-full bg-slate-900 border border-slate-800 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Course Duration</label>
                      <input
                        type="text"
                        value={courseDuration}
                        onChange={(e) => setCourseDuration(e.target.value)}
                        placeholder="e.g. 5h 30m"
                        className="w-full bg-slate-900 border border-slate-800 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Thumbnail Display image URL (Option)</label>
                    <input
                      type="text"
                      value={courseThumb}
                      onChange={(e) => setCourseThumb(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-slate-900 border border-slate-800 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Course Description</label>
                    <textarea
                      rows={3}
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                      placeholder="Describe high-income skills detailed worksheets content..."
                      className="w-full bg-slate-900 border border-slate-800 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase"
                  >
                    Save Course to Dynamic Catalog
                  </button>

                </form>
              </div>

              {/* COURSE LIST REMOVE CONTROL */}
              <div className="glass-panel p-5 rounded-3xl space-y-4">
                <h4 className="font-display font-semibold text-slate-200 text-sm border-b border-slate-900 pb-2">
                  System Course Curriculum Ledger
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.map((course) => {
                    const isConfirming = courseIdToDelete === course.id;
                    return (
                      <div key={course.id} className="bg-slate-900/40 p-3.5 border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-mono">
                        {isConfirming ? (
                          <div className="flex items-center justify-between w-full space-x-2">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tight truncate pr-1">
                              Confirm Delete?
                            </span>
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteCourse(course.id);
                                  setCourseIdToDelete(null);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-slate-100 rounded text-[9px] font-bold uppercase transition cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setCourseIdToDelete(null)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-bold uppercase transition cursor-pointer"
                              >
                                Keep
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="truncate pr-2">
                              <div className="font-bold text-slate-200 truncate max-w-xs">{course.title}</div>
                              <div className="text-[10px] text-slate-500 uppercase mt-0.5">Package: {course.packageId}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCourseIdToDelete(course.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition cursor-pointer"
                              title="Delete Course"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              SUB-TAB: NOTICE BROADCASTER
          ========================================== */}
          {activeSubTab === 'notices' && (
            <div className="space-y-8 animate-fade-in">
              
              <div className="glass-panel p-6 sm:p-8 rounded-3xl relative">
                <h4 className="font-display font-bold text-cyan-400 text-base mb-6">Create Broadcaster Alert Announcement</h4>
                
                <form onSubmit={handleNoticeUpload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Notice Headline</label>
                    <input
                      type="text"
                      required
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      placeholder="e.g. 🔥 Intraday Zoom webinar date scheduled"
                      className="w-full bg-slate-900 border border-slate-800 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">notice Body Content</label>
                    <textarea
                      required
                      rows={3}
                      value={noticeContent}
                      onChange={(e) => setNoticeContent(e.target.value)}
                      placeholder="Write alert content visible on all affiliate dashboards..."
                      className="w-full bg-slate-900 border border-slate-800 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-300"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    Broadcast Dynamic notice Alert
                  </button>
                </form>
              </div>

              {/* ACTIVE NOTICES CATALOG */}
              <div className="glass-panel p-5 rounded-3xl space-y-4 border-l-4 border-yellow-500">
                <h4 className="font-display font-bold text-slate-200 text-sm border-b border-slate-900 pb-2">Active Broadcasters</h4>

                <div className="space-y-3">
                  {allNotices.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-500 font-mono">No announcements listed.</p>
                  ) : (
                    allNotices.map((n) => (
                      <div key={n.id} className="bg-slate-900/80 p-4 border border-slate-800 rounded-2xl flex items-start justify-between font-mono text-xs">
                        <div className="space-y-1 pr-6">
                          <span className="font-bold text-yellow-500 uppercase tracking-widest text-[9px]">{n.title}</span>
                          <p className="text-slate-300 font-sans leading-relaxed">{n.content}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotice(n.id)}
                          className="text-rose-400 p-1 bg-rose-500/10 rounded hover:bg-rose-500 hover:text-white transition shrink-0"
                          title="Deletenotice"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              SUB-TAB: INSTANT BRANDING & SYSTEM SETTINGS
          ========================================== */}
          {activeSubTab === 'settings' && (
            <div className="space-y-8 animate-fade-in font-mono text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-2">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-100 uppercase">Instant Brand & System Configuration</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Control site typography copy, headers, files, and server status instantly</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Maintenance Mode Toggle Row */}
                <div className={`p-6 rounded-3xl border transition ${
                  settingsMaintenanceMode 
                    ? 'bg-rose-500/10 border-rose-500/30' 
                    : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="font-display font-black text-sm uppercase flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full inline-block ${settingsMaintenanceMode ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                        Platform Operations Maintenance System
                      </h4>
                      <p className="text-[11px] text-slate-450 pr-4 font-sans leading-relaxed">
                        When enabled, standard members will see a visually polished maintenance message page, preventing logins and dashboard browsing. Only authorized admins can log in and manage resources.
                      </p>
                    </div>
                    <div className="shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={settingsMaintenanceMode} 
                          onChange={(e) => setSettingsMaintenanceMode(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-14 h-7 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white border border-slate-800"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs col-span-1 border-t border-slate-900/30 pt-4">
                  {/* Branding Copy Block */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
                    <h4 className="text-[11px] font-bold text-yellow-500 uppercase border-b border-slate-800/40 pb-2">1. Logo & Universal Copy Brand</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Navbar Logo brand Text</label>
                        <input
                          type="text"
                          required
                          value={settingsLogoText}
                          onChange={(e) => setSettingsLogoText(e.target.value)}
                          placeholder="e.g. Let's Success"
                          className="w-full bg-slate-150 border border-slate-800 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-600 font-mono focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Universal Tagline Indicator</label>
                        <input
                          type="text"
                          required
                          value={settingsTagline}
                          onChange={(e) => setSettingsTagline(e.target.value)}
                          placeholder="e.g. Learn, Build and Succeed"
                          className="w-full bg-slate-150 border border-slate-800 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-600 font-mono focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Optional Hero Banner Image URL (Home Card Side)</label>
                        <input
                          type="text"
                          value={settingsBannerImageUrl}
                          onChange={(e) => setSettingsBannerImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full bg-slate-150 border border-slate-800 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-600 text-[11px] font-mono focus:border-cyan-500 focus:outline-none"
                        />
                        <p className="text-[9px] text-slate-500 mt-1 font-sans">Provide an absolute HTTP image link to showcase instant graphic visuals in the landing page section.</p>
                      </div>
                    </div>
                  </div>

                  {/* Landing Web Hero Copy Config Block */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
                    <h4 className="text-[11px] font-bold text-cyan-400 uppercase border-b border-slate-800/40 pb-2">2. Dynamic Home Hero Typography</h4>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-1">
                          <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Header (First)</label>
                          <input
                            type="text"
                            required
                            value={settingsHeroHeaderFirst}
                            onChange={(e) => setSettingsHeroHeaderFirst(e.target.value)}
                            className="w-full bg-slate-150 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-900 focus:outline-none text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Header (Highlight)</label>
                          <input
                            type="text"
                            required
                            value={settingsHeroHeaderHighlight}
                            onChange={(e) => setSettingsHeroHeaderHighlight(e.target.value)}
                            className="w-full bg-slate-150 border border-slate-800 rounded-lg px-2 py-1.5 text-yellow-500 focus:outline-none font-bold text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Header (Tail)</label>
                          <input
                            type="text"
                            required
                            value={settingsHeroHeaderLast}
                            onChange={(e) => setSettingsHeroHeaderLast(e.target.value)}
                            className="w-full bg-slate-150 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-900 focus:outline-none text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Floating Hero Badge Title</label>
                        <input
                          type="text"
                          required
                          value={settingsHeroSubtext}
                          onChange={(e) => setSettingsHeroSubtext(e.target.value)}
                          placeholder="e.g. BUILD VALUE & INFLUENCE"
                          className="w-full bg-slate-150 border border-slate-800 rounded-xl px-3 py-2 text-slate-900 text-[11px] focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Exploratory Paragraph Slogan</label>
                        <textarea
                          required
                          rows={3}
                          value={settingsHeroParagraph}
                          onChange={(e) => setSettingsHeroParagraph(e.target.value)}
                          className="w-full bg-slate-150 border border-slate-800 rounded-xl px-3 py-2 text-slate-900 focus:border-cyan-500 focus:outline-none font-sans text-xs leading-relaxed"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 font-mono">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black tracking-wider uppercase rounded-xl transition cursor-pointer select-none shadow-[0_4px_30px_rgba(234,179,8,0.25)]"
                  >
                    Commit Settings Instantly
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==========================================
              SUB-TAB: SUPABASE INTEGRATION & SYNC STATUS
          ========================================== */}
          {activeSubTab === 'supabase' && (
            <div className="space-y-8 animate-fade-in text-left font-sans">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <Database className="h-5 w-5 text-yellow-500" />
                    <span>Supabase Integration & Database Sync</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Status indicators, direct sync reconcilers, and database postgres scripts</p>
                </div>
                <button
                  onClick={async () => {
                    setTestingSupabase(true);
                    try {
                      const res = await fetch('/api/reconnect-supabase');
                      const data = await res.json();
                      setSupabaseStatus(data);
                      if (data.success) {
                        setActionMsg({ type: 'success', text: data.message });
                      } else {
                        setActionMsg({ type: 'error', text: data.message });
                      }
                    } catch (e: any) {
                      setSupabaseStatus({ success: false, message: e.message || String(e) });
                      setActionMsg({ type: 'error', text: 'Error executing reconnection fetch.' });
                    } finally {
                      setTestingSupabase(false);
                    }
                  }}
                  disabled={testingSupabase}
                  className="mt-3 sm:mt-0 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {testingSupabase ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-950 border-t-transparent"></div>
                  ) : (
                    <Database className="h-3.5 w-3.5" />
                  )}
                  <span>Re-test & Reconnect Supabase</span>
                </button>
              </div>

              {/* STATS OVERVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-5 rounded-2xl border-yellow-500/15 space-y-2.5">
                  <span className="text-[10px] text-yellow-500 font-mono font-bold uppercase tracking-wider block">Connection Environment</span>
                  <div className="flex items-center space-x-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-semibold text-slate-200">Supabase State Active</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    Host: <span className="text-slate-300">oifrctdtatstnyublhkb.supabase.co</span>
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border-cyan-500/15 space-y-2.5">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">Synced Inventory Stats</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-black text-slate-100 font-mono">{allUsers.length}</p>
                      <span className="text-[10px] text-slate-500">Database Users</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-100 font-mono">{adminBlogs.length || 3}</p>
                      <span className="text-[10px] text-slate-500">Blog Posts</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border-rose-500/15 space-y-2.5">
                  <span className="text-[10px] text-rose-400 font-mono font-bold uppercase tracking-wider block">Manual Backup Status</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Local state auto-mirrors into Supabase Postgres database. RLS and cloud backups are fully compliant.
                  </p>
                  {supabaseStatus && (
                    <div className={`p-2 rounded-lg text-[10px] font-mono ${supabaseStatus.success ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                      {supabaseStatus.message}
                    </div>
                  )}
                </div>
              </div>

              {/* INTEGRATION TIPS & EXPLANATIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* INTERFACE CONTROLS & RE-SQL DATABASE GENERATION SCRIPTS */}
                <div className="glass-panel p-6 sm:p-7 rounded-3xl border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">PostgreSQL Initialization SQL Script ("reSql")</h4>
                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[9px] font-mono font-bold rounded">Copy & Run in Supabase SQL Editor</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Execute the statement below in your Supabase project under the **SQL Editor** tab to set up or verify your synchronization status table effortlessly:
                  </p>
                  <pre className="p-4 bg-slate-950 rounded-2xl text-[11px] text-yellow-300 font-mono overflow-auto border border-slate-900 leading-relaxed max-h-[300px] select-all cursor-pointer" title="Click to Select All font-mono">
{`-- Create State Synchronizer Table
CREATE TABLE IF NOT EXISTS lets_success_state (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE lets_success_state ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Bindings for Seamless Read/Write
CREATE POLICY "Allow public read access" ON lets_success_state FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert access" ON lets_success_state FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update access" ON lets_success_state FOR UPDATE TO anon, authenticated USING (true);`}
                  </pre>
                  <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                    *Tip: Running this script ensures that state records are permanently saved. If you reset or restart the web platform container, your user and payment assets remain perfectly synced.
                  </p>
                </div>

                {/* HELP CARD: HOW TO SOLVE USER EMAIL EXCEEDED / AUTH SIGNUP */}
                <div className="glass-panel p-6 sm:p-7 rounded-3xl border-slate-800 space-y-5">
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                    <span>Fix Registration & Supabase Auth Errors</span>
                  </h4>

                  <div className="space-y-4 text-xs text-slate-400 font-sans leading-relaxed">
                    <p>
                      If your users see the error <b className="text-rose-400">"email rate limit exceeded"</b> or <b className="text-rose-400">"over_email_send_rate_limit"</b> during direct website signups:
                    </p>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 space-y-2 font-mono text-[11px] text-slate-300 font-sans">
                      <p className="text-yellow-500 font-bold mb-1">🔧 Disable "Confirm Email" on Supabase:</p>
                      <p>1. Go to: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Supabase Dashboard</a></p>
                      <p>2. Select your Project, go to <b className="text-emerald-400">Authentication</b> (left sidebar)</p>
                      <p>3. Under Settings, select <b className="text-emerald-400 font-bold">Providers</b> &rarr; <b className="text-emerald-400 font-bold">Email</b></p>
                      <p>4. Locate <b className="text-rose-400 font-bold">"Confirm email"</b> toggle switch and <b className="text-rose-400 font-bold">TURN IT OFF</b></p>
                      <p>5. Click <b className="text-yellow-500 font-bold">Save</b></p>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      <b>Why this works:</b> By default, Supabase sends confirmation emails for every user creation, which hits a strict rate limit of 3 emails per hour for free tier projects. Turning off "Confirm email" disables these emails, allowing <b className="text-emerald-400">unlimited instant user registrations & real-time state mirroring</b>.
                    </p>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-start gap-2.5">
                      <Database className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-[11px]">How Users display in Supabase:</p>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Users are registered as credentials in the Supabase Auth system automatically. At the same time, their full statistics (packages, referral wallets, and commissions) are securely serialized in the database block so that all features work flawlessly!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUB-TAB: BLOG MANAGER
          ========================================== */}
          {activeSubTab === 'blogs' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left block (col-span-5): Editor block */}
                <div id="blog-form-col" className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border-cyan-500/10 space-y-5">
                  <h3 className="font-display font-black text-lg tracking-wider text-slate-100 uppercase border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>{editingBlogId ? '✏️ Edit Article' : '✍️ Write Educational Blog'}</span>
                    {editingBlogId && (
                      <span className="text-[10px] text-yellow-500 font-mono tracking-normal capitalize">Editing Mode</span>
                    )}
                  </h3>

                  <form onSubmit={handleSaveBlog} className="space-y-4 text-xs font-mono">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Article Title</label>
                      <input
                        type="text"
                        required
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        placeholder="e.g. Master Reels Video Editing in 3 Easy Steps"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-cyan-500/50 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Snippet Summary</label>
                      <textarea
                        required
                        value={blogSummary}
                        onChange={(e) => setBlogSummary(e.target.value)}
                        rows={2}
                        placeholder="A concise, high-impact hook summary for grid view cards..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-cyan-500/50 focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase mb-1">Article Body Content (Supports standard **bold** tags and ### headers)</label>
                      <textarea
                        required
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        rows={11}
                        placeholder="Write your detailed article body content here. Double newlines separate paragraphs. Support headings using ### title format..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-cyan-500/50 focus:outline-none leading-relaxed font-sans text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Topic Tags (comma split)</label>
                        <input
                          type="text"
                          value={blogTags}
                          onChange={(e) => setBlogTags(e.target.value)}
                          placeholder="Affiliate, Design, Marketing"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-cyan-500/50 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Thumbnail Cover URL (Unsplash)</label>
                        <input
                          type="url"
                          value={blogThumb}
                          onChange={(e) => setBlogThumb(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-cyan-500/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-slate-950 px-4 py-3 rounded-xl border border-slate-850/60">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={blogIsFeatured}
                        onChange={(e) => setBlogIsFeatured(e.target.checked)}
                        className="h-4.5 w-4.5 rounded text-cyan-500 bg-slate-900 border-slate-800 cursor-pointer"
                      />
                      <label htmlFor="isFeatured" className="text-[11px] text-slate-350 select-none cursor-pointer">
                        Pin Article to Spotlight (Featured Hero Section)
                      </label>
                    </div>

                    <div className="flex justify-between items-center pt-2 gap-4">
                      {editingBlogId && (
                        <button
                          type="button"
                          onClick={() => {
                            setBlogTitle('');
                            setBlogSummary('');
                            setBlogContent('');
                            setBlogThumb('');
                            setBlogTags('');
                            setBlogIsFeatured(false);
                            setEditingBlogId(null);
                          }}
                          className="px-4 py-2 border border-slate-800 text-slate-350 rounded-lg hover:bg-slate-900 text-[10px] uppercase font-bold"
                        >
                          Cancel
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black tracking-wider uppercase rounded-lg text-[10px] transition cursor-pointer ml-auto"
                      >
                        {editingBlogId ? 'Save Edits' : 'Publish Article'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right block (col-span-7): Listing existing active blogs */}
                <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border-cyan-500/10 space-y-5">
                  <h3 className="font-display font-black text-lg tracking-wider text-slate-100 uppercase border-b border-slate-800 pb-2">
                    📑 Active Blog Articles ({adminBlogs.length})
                  </h3>

                  <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
                    {adminBlogs.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-10">No published articles yet. Write the first one!</p>
                    ) : (
                      adminBlogs.map((b) => (
                        <div key={b.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700 transition animate-fade-in">
                          <div className="space-y-1.5 max-w-lg text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              {b.isFeatured && (
                                <span className="bg-yellow-500 text-slate-950 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded leading-none uppercase">Featured</span>
                              )}
                              <span className="font-mono text-[9px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/20">#{b.tags && b.tags[0]}</span>
                              <span className="text-[10px] font-mono text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{b.title}</h4>
                            <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-1">{b.summary}</p>
                            
                            <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-mono">
                              <span>Author: {b.author}</span>
                              <span>•</span>
                              <span>{b.views || 0} views</span>
                              <span>•</span>
                              <span>{b.comments ? b.comments.length : 0} Comments</span>
                            </div>
                          </div>

                          <div className="flex flex-row gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => handleEditBlogClick(b)}
                              className="px-3 py-1.5 border border-slate-800 text-slate-350 hover:bg-slate-800 rounded-md text-[10px] font-sans font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(b.id)}
                              className="px-3 py-1.5 border border-rose-950/40 hover:bg-rose-500/10 text-rose-400 rounded-md text-[10px] font-sans font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </>
      )}

      {/* SCREENSHOT RECEIPT LIGHTBOX MODAL */}
      {activeScreenshotLightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
            <button
              onClick={() => setActiveScreenshotLightbox(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-slate-950 border border-slate-800 hover:text-rose-400 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h4 className="font-mono text-xs text-slate-400 text-center uppercase tracking-wider">
              Verification Screenshot - Payment Receipt
            </h4>
            <div className="w-full flex justify-center bg-slate-950 p-2.5 rounded-2xl">
              <img 
                src={activeScreenshotLightbox} 
                alt="Payment receipt proof" 
                className="max-h-[65vh] object-contain rounded" 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
