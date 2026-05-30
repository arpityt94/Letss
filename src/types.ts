/**
 * Types & Interfaces for Let's Success 2.0 Affiliate Learning Platform
 */

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  role: 'user' | 'admin';
  referralCode: string;
  referredBy?: string; // Referral code of person who referred this user
  balance: number; // Current wallet balance (unlocked commission)
  totalEarnings: number; // Total commissions earned
  totalWithdrawn: number; // Total amount paid out to user
  activePackageId?: string; // Active package (verified purchase)
  createdAt: string;
  upiId?: string;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankHolder?: string;
  isBlocked?: boolean;
}

export interface Package {
  id: string; // 'startup' | 'foundation' | 'branding' | 'affiliate' | 'finance'
  name: string;
  price: number;
  courses: string[];
  color: 'cyan' | 'gold' | 'emerald' | 'rose' | 'violet';
  popularityText?: string;
}

export interface Course {
  id: string;
  packageId: string; // package ID required to access this course
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string; // YouTube embedding URL or video file URL
  duration: string;
  lessonsCount: number;
}

export interface PaymentSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  price: number;
  screenshotUrl: string; // Base64 simulated or file upload path
  utr: string; // Transaction ID
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface Commission {
  id: string;
  userId: string; // The referrer getting the commission
  userName: string;
  referredUserId: string; // The referred member who bought the package
  referredUserName: string;
  packageId: string;
  packageName: string;
  amount: number; // 80% of package price
  status: 'pending' | 'approved' | 'rejected'; // automatic upon payment approval
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: 'upi' | 'bank';
  details: {
    upiId?: string;
    bankName?: string;
    bankAccount?: string;
    bankIfsc?: string;
    bankHolder?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  userId?: string; // 'all' or specific user ID
  createdAt: string;
  read?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isActive: boolean;
}

export interface StatsDashboard {
  activeMembers: number;
  totalEarnings: number;
  paidWithdrawals: number;
  pendingPayments: number;
  pendingWithdrawals: number;
  totalCourses: number;
}

export interface SystemSettings {
  logoText: string;
  tagline: string;
  heroHeaderFirst: string;
  heroHeaderHighlight: string;
  heroHeaderLast: string;
  heroSubtext: string;
  heroParagraph: string;
  bannerImageUrl: string;
  maintenanceMode: boolean;
}

export interface BlogComment {
  id: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  summary: string;
  thumbnailUrl: string;
  tags: string[];
  createdAt: string;
  views: number;
  comments: BlogComment[];
  isFeatured?: boolean;
}

