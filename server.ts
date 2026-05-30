import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';

import { DB } from './server/db.js';
import { getSupabase, supabaseSignUp, supabaseSignIn, supabaseGetUser } from './server/supabase.js';
import { User, SystemSettings } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'success_platform_super_secret_key_2026';

// Support larger uploads for screenshots/base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Express declaration to handle custom request typing
interface AuthRequest extends Request {
  user?: User;
}

// MAINTENANCE CHECK MIDDLEWARE
const checkMaintenanceAndBlock = async (req: Request, res: Response, next: NextFunction) => {
  const cleanPath = req.path.startsWith('/api') ? req.path : `/api${req.path}`;
  if (cleanPath === '/api/settings' || cleanPath === '/api/reconnect-supabase') {
    return next();
  }
  if (cleanPath === '/api/auth/login') {
    return next();
  }

  try {
    const settings = await DB.getSettings();
    if (settings && settings.maintenanceMode) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
          const user = await DB.findUserById(decoded.id);
          if (user && user.role === 'admin') {
            return next();
          }
        } catch (e) {
          // Pass through to allow standard errors or block below
        }
      }
      return res.status(503).json({ 
        maintenance: true, 
        error: 'Platform is currently undergoing scheduled maintenance. Please try again later.' 
      });
    }
  } catch (err) {
    // Ignore server error and pass through
  }
  next();
};

app.use('/api', checkMaintenanceAndBlock);

// AUTH MIDDLEWARE
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing or invalid' });
  }

  // Attempt Supabase token verification first if configured
  const hasSupabase = getSupabase() !== null;
  if (hasSupabase) {
    try {
      const supabaseUser = await supabaseGetUser(token);
      if (supabaseUser && supabaseUser.email) {
        const user = await DB.findUserByEmail(supabaseUser.email);
        if (!user) {
          return res.status(403).json({ error: 'User authenticated with Supabase but profile has not been initialized in operational database.' });
        }
        if (user.isBlocked) {
          return res.status(403).json({ error: 'Your account has been blocked by the Administrator.' });
        }
        req.user = user;
        return next();
      }
    } catch (err: any) {
      // If Supabase check fails (e.g. invalid signature because the token is a fallback local JWT token instead),
      // we'll fall through and try the local JWT verification!
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await DB.findUserById(decoded.id);
    
    if (!user) {
      return res.status(403).json({ error: 'User associated with token no longer exists' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked by the Administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token is expired or custom invalid signal' });
  }
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Higher admin privileges required.' });
  }
  next();
};

// ==========================================
// PUBLIC & CLIENT API ROUTES
// ==========================================

// 1. REGISTER
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, referralCode, mobileNumber } = req.body;

    if (!name || !email || !password || !mobileNumber) {
      return res.status(400).json({ error: 'Name, email, password, and mobile number are required fields' });
    }

    const existingUser = await DB.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Proceed to login.' });
    }

    // Generate Unique Referral Code for the new user
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanName = name.replace(/\s+/g, '').substring(0, 6).toUpperCase();
    const uniqueReferralCode = `${cleanName}${randomSuffix}`;

    // Validate sponsor referral code if supplied
    let sponsorReferralCode: string | undefined = undefined;
    if (referralCode) {
      const sponsor = await DB.findUserByReferralCode(referralCode);
      if (sponsor) {
        sponsorReferralCode = sponsor.referralCode;
      } else {
        return res.status(404).json({ error: 'Invalid invitation code / referral code supplied.' });
      }
    }

    let token = '';
    const hasSupabase = getSupabase() !== null;

    if (hasSupabase) {
      try {
        // Enforce signup on Supabase Auth
        await supabaseSignUp(email, password, name);
        try {
          // Automatically fetch session to get user dynamic token
          const loginData = await supabaseSignIn(email, password);
          token = loginData.session?.access_token || '';
        } catch (signInErr: any) {
          console.warn("Supabase login after signup warning (possibly email confirmation required):", signInErr.message || signInErr);
          // If login fails right after signup because email confirmation is required, help the developer
          if (signInErr.message?.toLowerCase().includes("confirm") || signInErr.status === 400) {
            return res.status(400).json({
              error: `Supabase Auth requires email confirmation. Please go to your Supabase Dashboard -> Authentication -> Providers -> Email, and disable "Confirm email" so users can register and login instantly.`
            });
          }
        }
      } catch (sbError: any) {
        console.error(`Supabase Auth registration failure:`, sbError);
        let errorMsg = sbError.message || String(sbError);
        if (errorMsg.includes('over_email_send_rate_limit') || errorMsg.includes('rate limit exceeded')) {
          errorMsg = `Supabase sign-up rate limit exceeded. To solve this and allow unlimited instant user sign-ups, go to your Supabase Dashboard -> Authentication -> Providers -> Email, and turn off "Confirm email".`;
        }
        return res.status(400).json({
          error: `Supabase Authentication Error: ${errorMsg}`
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: email.toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      role: 'user',
      referralCode: uniqueReferralCode,
      referredBy: sponsorReferralCode,
      balance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString()
    };

    await DB.createUser(newUser, passwordHash);

    // Notify user
    await DB.createNotification({
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      userId: newUser.id,
      title: "🚀 Registration Successful!",
      message: `Welcome to Let's Success 2.0, ${name}! Your referral code is ${uniqueReferralCode}. Buy a package to activate earnings!`,
      createdAt: new Date().toISOString()
    });

    if (!token) {
      // Create Fallback local JWT Token
      token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    }

    res.status(201).json({
      token,
      user: newUser
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing registration' });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await DB.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked by the Administrator.' });
    }

    let token = '';
    const hasSupabase = getSupabase() !== null;

    if (hasSupabase) {
      try {
        // Authenticate with Supabase Auth
        const loginData = await supabaseSignIn(email, password);
        token = loginData.session?.access_token || '';
      } catch (sbError: any) {
        // Fall back to local password verification in case the user has not been added to Supabase yet
        const passwordHash = await DB.getUserPasswordHash(user.id);
        const isMatched = await bcrypt.compare(password, passwordHash);
        if (!isMatched) {
          return res.status(400).json({ error: `Authentication failed: ${sbError.message || sbError}` });
        }
        // Attempt a background signup in Supabase for future logins
        try {
          await supabaseSignUp(email, password, user.name);
        } catch (signupErr) {
          // Ignore rate-limit errors on the fly
        }
      }
    } else {
      // Direct local verification fallback
      const passwordHash = await DB.getUserPasswordHash(user.id);
      const isMatched = await bcrypt.compare(password, passwordHash);

      if (!isMatched) {
        return res.status(400).json({ error: 'Invalid login credentials' });
      }
    }

    if (!token) {
      // Create Fallback local JWT Token
      token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    }

    res.json({
      token,
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during login process' });
  }
});

// 3. GET CURRENT PROFILE
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Re-fetch user in case balance or package changed
    const refinedUser = await DB.findUserById(req.user!.id);
    res.json({ user: refinedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred during profile retrieval' });
  }
});

// 4. UPDATE BIO/PAYMENT PROFILE (UPI or BANK details)
app.post('/api/auth/payment-settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { upiId, bankName, bankAccount, bankIfsc, bankHolder } = req.body;
    
    const updated = await DB.updateUser(req.user!.id, {
      upiId,
      bankName,
      bankAccount,
      bankIfsc,
      bankHolder
    });

    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET LATEST PACKAGES
app.get('/api/packages', async (req: Request, res: Response) => {
  try {
    const packages = await DB.getPackages();
    res.json({ packages });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error retrieving educational packages' });
  }
});

// 6. GET LATEST COURSES
app.get('/api/courses', async (req: Request, res: Response) => {
  try {
    const courses = await DB.getCourses();
    res.json({ courses });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error retrieving courses list' });
  }
});

// 7. FILE MANUAL PAYMENT SCREENSHOT AND TRANSACTION INFO (UTR)
app.post('/api/payments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { packageId, utr, screenshotUrl } = req.body;

    if (!packageId || !utr || !screenshotUrl) {
      return res.status(400).json({ error: 'Package ID, UTR transaction ID, and Payment receipt proof are required' });
    }

    const packages = await DB.getPackages();
    const selectPackage = packages.find(p => p.id === packageId);
    if (!selectPackage) {
      return res.status(400).json({ error: 'Invalid package selection' });
    }

    const allPayments = await DB.getPayments();
    const alreadyUploaded = allPayments.some(p => p.utr.trim().toLowerCase() === utr.trim().toLowerCase() && p.status !== 'rejected');
    if (alreadyUploaded) {
      return res.status(400).json({ error: 'This UTR/Transaction ID has already been submitted or is pending verification.' });
    }

    const newPayment = await DB.createPayment({
      id: `pay-${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user!.id,
      userName: req.user!.name,
      userEmail: req.user!.email,
      packageId: selectPackage.id,
      packageName: selectPackage.name,
      price: selectPackage.price,
      screenshotUrl,
      utr,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, payment: newPayment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. FILE WITHDRAWAL REQUEST
app.post('/api/withdrawals', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, method } = req.body;
    const user = req.user!;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Kindly supply a valid withdrawal amount greater than ₹0' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: `Insufficient wallet balance. You can withdraw up to ₹${user.balance}` });
    }

    if (method === 'upi' && !user.upiId) {
      return res.status(400).json({ error: 'Please update your UPI ID in dashboard profile state to submit withdrawal.' });
    }

    if (method === 'bank' && (!user.bankAccount || !user.bankIfsc)) {
      return res.status(400).json({ error: 'Please update complete Bank Details in dashboard profile to proceed.' });
    }

    const withdrawal = await DB.createWithdrawal({
      id: `wdr-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount,
      method,
      details: {
        upiId: user.upiId,
        bankName: user.bankName,
        bankAccount: user.bankAccount,
        bankIfsc: user.bankIfsc,
        bankHolder: user.bankHolder || user.name
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, withdrawal });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. REQUISITE USER NOTIFICATIONS AND STATS
app.get('/api/notifications', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const allNotif = await DB.getNotifications();
    const allNotices = await DB.getNotices();
    
    // Filter for specific user notifications + public notices
    const userNotif = allNotif.filter(n => !n.userId || n.userId === 'all' || n.userId === req.user!.id);
    
    res.json({
      notifications: userNotif.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      notices: allNotices.filter(n => n.isActive)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching notifications' });
  }
});

// 10. REQUISITE REFERRALS AND TRANSACTIONS FOR USER PROFILE STATS
app.get('/api/referrals', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const allUsers = await DB.getUsers();
    const allPayments = await DB.getPayments();
    const allCommissions = await DB.getCommissions();
    const allWithdrawals = await DB.getWithdrawals();

    // Direct referrals signed up with my code
    const directReferrals = allUsers.filter(u => u.referredBy === user.referralCode);
    
    // Personal transactions / payment history
    const personalPayments = allPayments.filter(p => p.userId === user.id);
    
    // Commissions received
    const myCommissions = allCommissions.filter(c => c.userId === user.id);
    
    // Withdrawals history
    const myWithdrawals = allWithdrawals.filter(w => w.userId === user.id);

    // Leaderboard statistics - High Commission System top earners
    const leaderboard = allUsers
      .filter(u => u.totalEarnings > 0)
      .map(u => ({ name: u.name, earnings: u.totalEarnings, role: u.role }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10);

    res.json({
      directReferralsCount: directReferrals.length,
      directReferrals: directReferrals.map(r => ({
        name: r.name,
        email: r.email,
        createdAt: r.createdAt,
        activePackageId: r.activePackageId
      })),
      payments: personalPayments,
      commissions: myCommissions,
      withdrawals: myWithdrawals,
      leaderboard
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching dynamic referral listings' });
  }
});


// ==========================================
// ADMIN PANEL ENDPOINTS
// ==========================================

// 0. DOWNLOAD DATABASE BACKUP
app.get('/api/admin/download-db', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const DATA_FILE = path.join(process.cwd(), 'database.json');
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="database.json"');
    res.send(content);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read database backup file: ' + err.message });
  }
});

// 1. DASHBOARD ANALYTICS OVERVIEW
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await DB.getUsers();
    const payments = await DB.getPayments();
    const withdrawals = await DB.getWithdrawals();
    const courses = await DB.getCourses();

    const activeMembers = users.filter(u => u.activePackageId !== undefined).length;
    const totalEarnings = payments.filter(p => p.status === 'approved').reduce((acc, curr) => acc + curr.price, 0);
    const paidWithdrawals = withdrawals.filter(w => w.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);
    
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

    res.json({
      activeMembers,
      totalEarnings, // Gross revenue
      paidWithdrawals, // Net paid payouts
      pendingPayments,
      pendingWithdrawals,
      totalCourses: courses.length,
      registeredUsersCount: users.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred fetching dashboard admin analytics' });
  }
});

// 2. ADMIN LIST USERS
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await DB.getUsers();
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred retrieving list of registered users' });
  }
});

// ADMIN BLOCK/UNBLOCK USER
app.post('/api/admin/users/:id/block', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { block } = req.body; // boolean

    const user = await DB.findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await DB.updateUser(id, { isBlocked: !!block });
    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ADD BALANCE TO USER WALLET
app.post('/api/admin/users/:id/balance', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount supplied. Must be greater than 0.' });
    }

    const user = await DB.findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newBalance = (user.balance || 0) + parsedAmount;
    const newTotalEarnings = (user.totalEarnings || 0) + parsedAmount;

    const updatedUser = await DB.updateUser(id, {
      balance: newBalance,
      totalEarnings: newTotalEarnings
    });

    // Notify user about manually added funds
    await DB.createNotification({
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      userId: id,
      title: "💰 Wallet Credited!",
      message: `Admin manually added ₹${parsedAmount} to your wallet! ${reason ? `Note: ${reason}` : ''}`,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// RECONNECT SUPABASE SYSTEM UTILITY
app.get('/api/reconnect-supabase', async (req: Request, res: Response) => {
  try {
    const result = await DB.reconnectSupabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || err });
  }
});

// GET SYSTEM SETTINGS (PUBLIC)
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const settings = await DB.getSettings();
    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE SYSTEM SETTINGS (ADMIN ONLY)
app.post('/api/admin/settings', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      logoText, 
      tagline, 
      heroHeaderFirst, 
      heroHeaderHighlight, 
      heroHeaderLast, 
      heroSubtext, 
      heroParagraph, 
      bannerImageUrl, 
      maintenanceMode 
    } = req.body;

    const updates: Partial<SystemSettings> = {};
    if (logoText !== undefined) updates.logoText = logoText;
    if (tagline !== undefined) updates.tagline = tagline;
    if (heroHeaderFirst !== undefined) updates.heroHeaderFirst = heroHeaderFirst;
    if (heroHeaderHighlight !== undefined) updates.heroHeaderHighlight = heroHeaderHighlight;
    if (heroHeaderLast !== undefined) updates.heroHeaderLast = heroHeaderLast;
    if (heroSubtext !== undefined) updates.heroSubtext = heroSubtext;
    if (heroParagraph !== undefined) updates.heroParagraph = heroParagraph;
    if (bannerImageUrl !== undefined) updates.bannerImageUrl = bannerImageUrl;
    if (maintenanceMode !== undefined) updates.maintenanceMode = !!maintenanceMode;

    const updatedSettings = await DB.updateSettings(updates);
    res.json({ success: true, settings: updatedSettings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN UPDATE MEMBERS DETAILS (ADMIN ONLY)
app.post('/api/admin/users/:id/update-details', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      role, 
      referralCode, 
      balance, 
      totalEarnings, 
      totalWithdrawn, 
      activePackageId, 
      referredBy,
      upiId,
      bankName,
      bankAccount,
      bankIfsc,
      bankHolder,
      password,
      mobileNumber
    } = req.body;

    const user = await DB.findUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password if a non-empty string is provided
    if (password !== undefined && password !== null && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await (DB as any).updateUserPassword(id, passwordHash);
    }

    const updates: Partial<User> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      const existing = await DB.findUserByEmail(email);
      if (existing && existing.id !== id) {
        return res.status(400).json({ error: 'Email already used by another member' });
      }
      updates.email = email;
    }
    if (mobileNumber !== undefined) updates.mobileNumber = mobileNumber;
    if (role !== undefined) updates.role = role as any;
    if (referralCode !== undefined) {
      const existing = await DB.findUserByReferralCode(referralCode);
      if (existing && existing.id !== id) {
        return res.status(400).json({ error: 'Referral code already used by another member' });
      }
      updates.referralCode = referralCode;
    }
    if (balance !== undefined) updates.balance = parseFloat(balance) || 0;
    if (totalEarnings !== undefined) updates.totalEarnings = parseFloat(totalEarnings) || 0;
    if (totalWithdrawn !== undefined) updates.totalWithdrawn = parseFloat(totalWithdrawn) || 0;
    if (activePackageId !== undefined) updates.activePackageId = activePackageId || undefined;
    if (referredBy !== undefined) updates.referredBy = referredBy || undefined;
    if (upiId !== undefined) updates.upiId = upiId || undefined;
    if (bankName !== undefined) updates.bankName = bankName || undefined;
    if (bankAccount !== undefined) updates.bankAccount = bankAccount || undefined;
    if (bankIfsc !== undefined) updates.bankIfsc = bankIfsc || undefined;
    if (bankHolder !== undefined) updates.bankHolder = bankHolder || undefined;

    const updatedUser = await DB.updateUser(id, updates);
    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. ADMIN LIST PAYMENTS (VERIFICATIONS)
app.get('/api/admin/payments', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const payments = await DB.getPayments();
    res.json({ payments });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error listing manual payments' });
  }
});

// 4. ADMIN APPROVE/REJECT PAYMENT
app.post('/api/admin/payments/:id/verify', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // status: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const updated = await DB.updatePaymentStatus(id, status, reason);
    if (!updated) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    res.json({ success: true, payment: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. ADMIN LIST WITHDRAWAL REQUESTS
app.get('/api/admin/withdrawals', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await DB.getWithdrawals();
    res.json({ withdrawals });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred listing withdrawals register' });
  }
});

// 6. ADMIN APPROVE/REJECT WITHDRAWAL
app.post('/api/admin/withdrawals/:id/verify', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const updated = await DB.updateWithdrawalStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Withdrawal verification entry not found' });
    }

    res.json({ success: true, withdrawal: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. ADMIN UPLOAD COURSE
app.post('/api/admin/courses', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { packageId, title, description, videoUrl, duration, lessonsCount, thumbnailUrl } = req.body;

    if (!packageId || !title || !videoUrl) {
      return res.status(400).json({ error: 'Package ID, Title and Video URL are required fields' });
    }

    const newCourse = await DB.createCourse({
      id: `course-${Math.random().toString(36).substr(2, 9)}`,
      packageId,
      title,
      description: description || 'Master premium digital skills with live recorded trainings.',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      videoUrl,
      duration: duration || '3h 30m',
      lessonsCount: lessonsCount || 10
    });

    res.status(201).json({ success: true, course: newCourse });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. ADMIN DELETE COURSE
app.delete('/api/admin/courses/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await DB.deleteCourse(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. ADMIN ADD/DELETE NOTICE ANNOUNCEMENT
app.post('/api/admin/notices', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Notice title and content are required' });
    }
    const notice = await DB.createNotice(title, content);
    res.status(201).json({ success: true, notice });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/notices/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await DB.deleteNotice(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// BLOG SECTION API ENDPOINTS
// ==========================================

// 1. PUBLIC: GET ALL BLOG POSTS
app.get('/api/blogs', async (req: Request, res: Response) => {
  try {
    const blogs = await DB.getBlogs();
    res.json({ blogs });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred retrieving blog posts' });
  }
});

// 2. PUBLIC: GET SINGLE BLOG POST BY ID OR SLUG (INCREMENTS VIEWS)
app.get('/api/blogs/:slugOrId', async (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    let blog = await DB.getBlogBySlug(slugOrId);
    if (!blog) {
      blog = await DB.getBlogById(slugOrId);
    }

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Increment view count dynamically
    const updatedViews = (blog.views || 0) + 1;
    await DB.updateBlog(blog.id, { views: updatedViews });
    blog.views = updatedViews;

    res.json({ blog });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred retrieving blog post details' });
  }
});

// 3. SECURE: ADD BLOG POST COMMENT (LOGGED IN USER)
app.post('/api/blogs/:id/comments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user!;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content cannot be blank' });
    }

    const comment = {
      id: `comm-${Math.random().toString(36).substr(2, 9)}`,
      userName: user.name,
      userEmail: user.email,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedBlog = await DB.addBlogComment(id, comment);
    if (!updatedBlog) {
      return res.status(404).json({ error: 'Blog post not found to add comment' });
    }

    res.status(201).json({ success: true, blog: updatedBlog, comment });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred publishing comment' });
  }
});

// 4. ADMIN: WRITE / CREATE NEW BLOG POST
app.post('/api/admin/blogs', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, summary, content, thumbnailUrl, tags, isFeatured } = req.body;

    if (!title || !content || !summary) {
      return res.status(400).json({ error: 'Title, summary, and content are required' });
    }

    // Generate unique slug
    const cleanSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${cleanSlug}-${randomSuffix}`;

    const newBlog = {
      id: `blog-${Math.random().toString(36).substr(2, 9)}`,
      title,
      slug,
      summary,
      content,
      author: req.user!.name || 'Administrator',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
      views: 0,
      comments: [],
      isFeatured: !!isFeatured
    };

    await DB.createBlog(newBlog);
    res.status(201).json({ success: true, blog: newBlog });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred creating blog post' });
  }
});

// 5. ADMIN: UPDATE / EDIT EXISTING BLOG POST
app.put('/api/admin/blogs/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, summary, content, thumbnailUrl, tags, isFeatured } = req.body;

    const updates: any = {};
    if (title !== undefined) {
      updates.title = title;
      // Re-generate slug if title changed
      const cleanSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      updates.slug = `${cleanSlug}-${randomSuffix}`;
    }
    if (summary !== undefined) updates.summary = summary;
    if (content !== undefined) updates.content = content;
    if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl;
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];
    if (isFeatured !== undefined) updates.isFeatured = !!isFeatured;

    const updatedBlog = await DB.updateBlog(id, updates);
    if (!updatedBlog) {
      return res.status(404).json({ error: 'Blog post not found to apply updates' });
    }

    res.json({ success: true, blog: updatedBlog });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred updating blog post' });
  }
});

// 6. ADMIN: DELETE EXISTING BLOG POST
app.delete('/api/admin/blogs/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await DB.deleteBlog(id);
    res.json({ success: !!success });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error occurred deleting blog post' });
  }
});

// API catch-all for unmatched api routes to keep JSON API requests from falling through to the HTML SPA router
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.url}` });
});

// Global API Error Handler to catch throws and return clean JSON
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.error('API Error details:', err);
    return res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  }
  next(err);
});


// ==========================================
// VITE DEV SERVER / PRODUCTION SERVING
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets compiled inside dist/ Client
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Let's Success 2.0 full-stack active running on port ${PORT}`);
    
    // Smooth & Instant Boot: Warm up connection and build cache in the background
    console.log('[Boot] Heat up background cache and sync with Supabase...');
    DB.getUsers()
      .then((users) => {
        console.log(`[Boot] Database state fully warm. Synchronized ${users?.length || 0} active users.`);
      })
      .catch((err) => {
        console.warn('[Boot] Supabase connection warm up deferred: ', err.message || err);
      });
  });
}

start();
