import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Package, 
  Course, 
  PaymentSubmission, 
  Commission, 
  WithdrawalRequest, 
  Notification, 
  Notice,
  SystemSettings,
  BlogPost,
  BlogComment
} from '../src/types.js';

const DATA_FILE = path.join(process.cwd(), 'database.json');
const db: any = null; // Satisfies legacy Firestore compilation references since we run purely on Supabase Sync now

interface Schema {
  users: User[];
  passwords: Record<string, string>; // userId -> passwordHash
  packages: Package[];
  courses: Course[];
  payments: PaymentSubmission[];
  commissions: Commission[];
  withdrawals: WithdrawalRequest[];
  notifications: Notification[];
  notices: Notice[];
  settings?: SystemSettings;
  blogs?: BlogPost[];
}

const DEFAULT_PACKAGES: Package[] = [
  {
    id: 'startup',
    name: 'Startup Package',
    price: 1499,
    courses: ['Instagram Mastery', 'Video Editing', 'Beginner To Pro Training'],
    color: 'cyan',
    popularityText: 'Best for Beginners'
  },
  {
    id: 'foundation',
    name: 'Foundation Package',
    price: 2499,
    courses: ['Spoken English', 'Lead Generation', 'Fundamentals Of Online Business'],
    color: 'gold'
  },
  {
    id: 'branding',
    name: 'Branding Mastery Package',
    price: 4499,
    courses: ['Facebook Ads', 'YouTube Mastermind', 'Canva Mastery', 'Public Speaking'],
    color: 'emerald',
    popularityText: 'Most Popular'
  },
  {
    id: 'affiliate',
    name: 'Affiliate Package',
    price: 6999,
    courses: ['Website Designing', 'AI Mastermind', 'Freelancing', 'Google Ads'],
    color: 'rose'
  },
  {
    id: 'finance',
    name: 'Finance Premium Package',
    price: 9999,
    courses: ['Stock Market', 'Stock Trading'],
    color: 'violet',
    popularityText: 'Premium Value'
  }
];

const DEFAULT_COURSES: Course[] = [
  {
    id: 'c1',
    packageId: 'startup',
    title: 'Instagram Mastery',
    description: 'Learn how to grow your personal brand, design premium feeds, and generate organic leads through Instagram.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '4h 30m',
    lessonsCount: 12
  },
  {
    id: 'c2',
    packageId: 'startup',
    title: 'Video Editing',
    description: 'Master premium VN editor, CapCut, and basic Premiere Pro settings to design high-engagement reels.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '5h 15m',
    lessonsCount: 15
  },
  {
    id: 'c3',
    packageId: 'startup',
    title: 'Beginner To Pro Training',
    description: 'The standard blueprint to understanding affiliate strategies, landing tools, and establishing your positive mindset.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '3h 40m',
    lessonsCount: 10
  },
  {
    id: 'c4',
    packageId: 'foundation',
    title: 'Spoken English',
    description: 'Improve grammar, pronunciation, vocabulary, and start speaking English with absolute confidence in interviews.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '6h 10m',
    lessonsCount: 18
  },
  {
    id: 'c5',
    packageId: 'foundation',
    title: 'Lead Generation',
    description: 'Advanced funnels, automated landing pages, and magnetic hooks to source hundreds of targeted organic prospects.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '4h 50m',
    lessonsCount: 14
  },
  {
    id: 'c6',
    packageId: 'foundation',
    title: 'Fundamentals Of Online Business',
    description: 'The building blocks of online entrepreneurship, e-commerce flow, products pricing, and target market setups.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '5h 00m',
    lessonsCount: 11
  },
  {
    id: 'c7',
    packageId: 'branding',
    title: 'Facebook Ads Expert',
    description: 'Master premium advertising, custom conversions tracking, micro-budget testing, and retargeting ads.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '8h 25m',
    lessonsCount: 22
  },
  {
    id: 'c8',
    packageId: 'branding',
    title: 'YouTube Mastermind',
    description: 'Craft content calendars, set up channel tags, index algorithms, edit thumbnails, and scale views.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '7h 10m',
    lessonsCount: 20
  },
  {
    id: 'c9',
    packageId: 'branding',
    title: 'Canva Mastery',
    description: 'Design premium graphic posts, PDF templates, and video reels with Canva PRO features.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '4h 15m',
    lessonsCount: 12
  },
  {
    id: 'c10',
    packageId: 'branding',
    title: 'Public Speaking Secret',
    description: 'Body language, voice modulation, structuring presentations, and building high-impact connections.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '5h 30m',
    lessonsCount: 16
  },
  {
    id: 'c11',
    packageId: 'affiliate',
    title: 'Website Designing',
    description: 'Build premium responsive blocks, business sites, and landing pages with WordPress and Elementor.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '9h 15m',
    lessonsCount: 24
  },
  {
    id: 'c12',
    packageId: 'affiliate',
    title: 'AI Mastermind',
    description: 'Harness advanced ChatGPT prompting, Midjourney generation, and automations to 10x your speed.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442135136-760c813a743d?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '6h 40m',
    lessonsCount: 18
  },
  {
    id: 'c13',
    packageId: 'affiliate',
    title: 'Freelancing Strategy',
    description: 'Submit premium bids, optimize profiles on Upwork & Fiverr, close clients, and invoice securely.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '5h 45m',
    lessonsCount: 16
  },
  {
    id: 'c14',
    packageId: 'affiliate',
    title: 'Google Ads Masterclass',
    description: 'Run targeted Search, Video, and Display campaigns on Google to drive commercial results.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '7h 50m',
    lessonsCount: 19
  },
  {
    id: 'c15',
    packageId: 'finance',
    title: 'Stock Market Foundation',
    description: 'Discover value investing indicators, global economics effects, mutual funds, and standard IPO ratings.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '10h 00m',
    lessonsCount: 30
  },
  {
    id: 'c16',
    packageId: 'finance',
    title: 'Stock Trading Strategy',
    description: 'Ultimate intraday strategies, technical levels indicators, candlesticks chart tracking, and precise position sizing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '11h 20m',
    lessonsCount: 35
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  logoText: "Let's Success",
  tagline: "Learn • Earn • Success",
  heroHeaderFirst: "Learn Skills.",
  heroHeaderHighlight: "Build Income.",
  heroHeaderLast: "Create Success.",
  heroSubtext: "“Learn Skills • Earn Commissions • Achieve Success”",
  heroParagraph: "Empowering digital entrepreneurs with practical video courses, Hindi recorded workshops, and a hyper-profitable direct referral commission ecosystem.",
  bannerImageUrl: "",
  maintenanceMode: false
};

const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "How to Build a ₹50,000/Month Affiliate Business in 2026",
    slug: "build-affiliate-business-2026",
    summary: "Discover the exact step-by-step roadmap to leveraging digital learning ecosystems and earning high-yield referral commissions online.",
    content: `Affiliate marketing remains one of the most accessible pathways to building a sustainable online income stream. By promoting digital educational products, you can command high commissions without handling physical logistics, inventory, or complex client support.\n\nHere is the exact blueprint to targets ₹50,000/month:\n\n### 1. Select High-Payout Programs\nInstead of low-margin e-commerce physical goods (which pay 1%-5% commissions), focus on structured digital packages. Educational programs often offer anywhere from 50% to **80% direct commissions** because their reproduction cost is virtually zero.\n\n### 2. Learn High-Income Skills First\nYou cannot sell what you do not understand. Master lead generation, video editing, and organic social growth:\n- **Lead Generation**: Sourcing organic prospects from social media.\n- **Video Editing**: Crafting highly engaging reels with magnetic hooks.\n\n### 3. Build Organic Social Funnels\nCreate value-focused shorts, reels, and carousel posts on Instagram and YouTube:\n* Share educational snippets instead of direct sales pitches.\n* Tell real stories of digital transformation and career breakthroughs.\n* Redirect viewers to your unique referral link through direct message automation.\n\n### 4. Overcome the Initial Plateau\nA lot of new affiliates stop in their first 14 days. Consistency is key! Commit to publishing 2 reels daily, running targeted conversations with prospects, and helping your team activate their modules.`,
    author: "Marpit Admin",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    tags: ["Affiliate Marketing", "Business", "Earning Blueprint"],
    createdAt: new Date().toISOString(),
    views: 142,
    comments: [
      {
        id: "comm-1",
        userName: "arpit",
        userEmail: "arpit1102@gmail.com",
        content: "This guide is really clear and direct. I've already earned ₹2,100! Thanks, Admin!",
        createdAt: new Date().toISOString()
      }
    ],
    isFeatured: true
  },
  {
    id: "blog-2",
    title: "Mastering Canva Pro: Secrets of Modern Graphic Design",
    slug: "mastering-canva-pro-secrets",
    summary: "Elevate your visual storytelling, create stunning social graphics, and start your high-paying freelance design side-hustle.",
    content: `Visual content drives engagement. In fact, posts with custom visual elements receive over 650% higher engagement than text-only entries. Whether you are building an affiliate franchise or working with local clients, learning graphic design on Canva is a true superpower.\n\nHere are the top Canva Pro secrets to design like an expert:\n\n### 1. Establish Your Brand Kit\nDo not mix and match a dozen different color palettes. Define:\n- A dark background (e.g., Indigo or deep Slate).\n- A vibrant primary color (e.g., fluorescent Cyan).\n- Warm secondary highlight hues (e.g., soft Gold or Amber).\nSave these colors as unified templates to apply them with one click.\n\n### 2. Use Whitespace Generously\nThe biggest mistake beginners make is overcrowding their canvases. Leave ample breathing room (negative space) in the margins. Your key text should be the star of the visual.\n\n### 3. Pair Fonts Elegantly\nSelect exactly two primary fonts:\n* **Display/Header Font**: A bold, modern sans-serif like Space Grotesk or Inter Bold.\n* **Body/Secondary Font**: A clean mono or sans-serif like JetBrains Mono or Inter Regular.\n\n### 4. Direct Client Monetization\nYou can package these skills on Fiverr or local client programs. Charge small-business owners ₹5,000/month to overhaul their visual profiles and manage daily feeds!`,
    author: "Let's Success Team",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    tags: ["Canva", "Design", "Freelancing"],
    createdAt: new Date().toISOString(),
    views: 95,
    comments: [],
    isFeatured: false
  },
  {
    id: "blog-3",
    title: "10 Organic Lead Generation Strategies That Work Instantly",
    slug: "10-organic-lead-generation",
    summary: "Stop wasting money on expensive ads. Build highly qualified prospect loops using nothing but your social media profile and consistency.",
    content: `Are you tired of running dry profiles with zero incoming messages? Most online entrepreneurs believe they require massive ad budgets on Facebook or Google to find ready buyers. The truth is quite the opposite: organic lead generation of high-quality leads is both active and completely free.\n\nHere are three core frameworks to implement today:\n\n### 1. Leverage 'Ask Campaigns' on Instagram Stories\nInstead of always asking people to purchase, ask their current status:\n- *'Are you currently studying or running a job?'*\n- *'Do you want to learn a high-income skill online or work locally?'*\nInitiate human, humble conversations with everyone who responds. No sales pitches—just ask questions and offer tips first.\n\n### 2. Craft 'Interactive PDF Guide' Reels\nBuild a simple, mini-guide (e.g., 'How to edit viral reels in 5 mins'). Post a short video explaining the value, and instruct viewers to comment **'GROW'** to receive the link.\nUse automated response tools or manually direct message them to start building connections.\n\n### 3. Share High-Ticket Transformation Case Studies\nProvide screenshots of your payouts, wallet balances, or course certificate clearances. Highlight the exact module (such as Video Editing or Meta Ads) the student studied to achieve that result. People buy outcomes, not packages.`,
    author: "Marpit Admin",
    thumbnailUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&q=80",
    tags: ["Lead Generation", "Marketing", "Social Media"],
    createdAt: new Date().toISOString(),
    views: 188,
    comments: [],
    isFeatured: false
  }
];

import { getSupabase } from './supabase.js';

let useLocalFallback = true; // Force True to completely bypass Firebase Database as requested
let seeded = true; // We do not need separate Firebase seeding
let isSupabaseSupported = true; // Will track whether "lets_success_state" exists in Supabase

// In-memory cache to guarantee sub-millisecond DB operations
let cachedData: Schema | null = null;

// Local JSON database helpers
async function readLocalData(): Promise<Schema> {
  // If we already have the state loaded in-memory, serve it instantly without file or network overhead
  if (cachedData) {
    return cachedData;
  }

  let localData: Schema | null = null;
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    localData = JSON.parse(fileContent) as Schema;
  } catch (err) {
    // If local file is missing, we will fall back to creating the initial data payload
  }

  // Next, attempt to retrieve the latest real-time state from your Supabase postgres instance
  const sb = getSupabase() as any;
  if (sb && isSupabaseSupported) {
    try {
      const { data, error } = await sb
        .from('lets_success_state')
        .select('data')
        .eq('id', 'production')
        .maybeSingle();

      if (error) {
        // Check if the table/relation "lets_success_state" doesn't exist yet
        if (
          error.code === 'PGRST205' ||
          error.message?.includes('relation') ||
          error.message?.includes('does not exist')
        ) {
          console.warn(
            '\n' +
            '========================================================================================\n' +
            '[Supabase Sync Notice] Table "lets_success_state" does not exist in your Supabase DB yet.\n' +
            'To automatically synchronize all activities, courses, payments, and users with Supabase\n' +
            '(protecting them against data reset/loss when the website restarts or shuts down):\n' +
            '----------------------------------------------------------------------------------------\n' +
            '1. Go to your Supabase Dashboard: https://supabase.com/dashboard\n' +
            '2. Open the "SQL Editor" tab.\n' +
            '3. Copy and run the following SQL command to create the state synchronization table:\n\n' +
            'CREATE TABLE IF NOT EXISTS lets_success_state (\n' +
            '    id TEXT PRIMARY KEY,\n' +
            '    data JSONB NOT NULL,\n' +
            '    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL\n' +
            ');\n\n' +
            'ALTER TABLE lets_success_state ENABLE ROW LEVEL SECURITY;\n' +
            'CREATE POLICY "Allow public read access" ON lets_success_state FOR SELECT TO anon, authenticated USING (true);\n' +
            'CREATE POLICY "Allow public insert access" ON lets_success_state FOR INSERT TO anon, authenticated WITH CHECK (true);\n' +
            'CREATE POLICY "Allow public update access" ON lets_success_state FOR UPDATE TO anon, authenticated USING (true);\n' +
            '----------------------------------------------------------------------------------------\n' +
            'Until you run this SQL, the platform will continue using local filesystem storage perfectly.\n' +
            '========================================================================================\n'
          );
          isSupabaseSupported = false; // Gracefully disable further checks to prevent error spam
        } else {
          console.warn('[Supabase Sync Warning] Failed to read state from Supabase:', error.message);
        }
      } else if (data && data.data) {
        // Successfully fetched!
        const freshData = data.data as Schema;
        console.log('[Supabase Sync] Flawlessly synchronized database state with Supabase Cloud Postgres.');
        
        // Ensure standard fields are defined just in case
        if (!freshData.packages) freshData.packages = DEFAULT_PACKAGES;
        if (!freshData.courses) freshData.courses = DEFAULT_COURSES;
        if (!freshData.settings) freshData.settings = DEFAULT_SETTINGS;
        if (!freshData.blogs) freshData.blogs = DEFAULT_BLOGS;

        // Cache it securely inside local disk file too
        await fs.writeFile(DATA_FILE, JSON.stringify(freshData, null, 2), 'utf-8');
        cachedData = freshData;
        return freshData;
      }
    } catch (sbErr: any) {
      console.warn('[Supabase Sync warning] Exception while reading state:', sbErr.message || sbErr);
    }
  }

  // If local cached file has data, use it!
  if (localData) {
    if (!localData.blogs) {
      localData.blogs = DEFAULT_BLOGS;
      await fs.writeFile(DATA_FILE, JSON.stringify(localData, null, 2), 'utf-8');
    }
    if (sb && isSupabaseSupported) {
      try {
        await sb.from('lets_success_state').upsert({ id: 'production', data: localData });
        console.log('[Supabase Sync] Successfully primed Supabase with initial local database state!');
      } catch (e: any) {
        console.warn('[Supabase Sync] Failed to populate initial state to Supabase:', e.message || e);
      }
    }
    cachedData = localData;
    return localData;
  }

  // Initial Seed Schema
  const initialSchema: Schema = {
    users: [
      {
        id: 'admin-root',
        name: 'Marpit Admin',
        email: 'marpit792@gmail.com',
        role: 'admin',
        referralCode: 'SUCCESSADMIN',
        balance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        createdAt: new Date().toISOString()
      }
    ],
    passwords: {
      'admin-root': await bcrypt.hash('adminpassword', 10)
    },
    packages: DEFAULT_PACKAGES,
    courses: DEFAULT_COURSES,
    payments: [],
    commissions: [],
    withdrawals: [],
    notifications: [
      {
        id: 'notif-welcome',
        title: "Welcome to Let's Success 2.0!",
        message: "Master digital skills, earn up to 80% direct commissions, and embark on your learning journey today! Learn • Earn • Success",
        createdAt: new Date().toISOString()
      }
    ],
    notices: [
      {
        id: 'n1',
        title: "🔥 Special Launch Bonus Notice",
        content: "Welcome to Let's Success 2.0! We have integrated a manual verification engine. Simply purchase any package, upload your snapshot + UTR, and your sponsor receives an instant 80% direct referral commission!",
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ],
    settings: DEFAULT_SETTINGS,
    blogs: DEFAULT_BLOGS
  };

  // Write initially to local file
  await fs.writeFile(DATA_FILE, JSON.stringify(initialSchema, null, 2), 'utf-8');

  // Attempt to write the initial schema to Supabase for instant synchronization
  if (sb && isSupabaseSupported) {
    try {
      await sb.from('lets_success_state').upsert({ id: 'production', data: initialSchema });
    } catch (e) {}
  }

  cachedData = initialSchema;
  return initialSchema;
}

async function writeLocalData(data: Schema): Promise<void> {
  // Update in-memory cache immediately to satisfy instant page updates
  cachedData = data;

  // 1. Write update securely to local file
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

  // 2. Synchronize up into Supabase database instantly
  const sb = getSupabase() as any;
  if (sb && isSupabaseSupported) {
    try {
      const { error } = await sb
        .from('lets_success_state')
        .upsert({ id: 'production', data, updated_at: new Date().toISOString() });
      if (error) {
        console.warn('[Supabase Sync Warning] Failed to sync latest updates with Supabase:', error.message);
      } else {
        console.log('[Supabase Sync] Flawlessly synced updated DB state (activities/users/courses) with Supabase Cloud Postgres.');
      }
    } catch (err: any) {
      console.warn('[Supabase Sync Error] Exception during state synchronization:', err.message || err);
    }
  }
}

async function seedIfNeeded() {
  // Database state is initialized on startup in readLocalData()
  seeded = true;
}

export async function saveDB(): Promise<void> {
  // Retained as a dummy export to maintain backwards compatibility with any tooling imports
}

// DATABASE TRANSACTIONS AND OPERATIONS
export const DB = {
  reconnectSupabase: async () => {
    isSupabaseSupported = true;
    cachedData = null;
    try {
      const data = await readLocalData();
      return {
        success: isSupabaseSupported,
        message: isSupabaseSupported 
          ? `Successfully reconnected to Supabase! Fetched state containing ${data.users?.length || 0} users and ${data.blogs?.length || 0} blogs.` 
          : 'Failed to reconnect. Table "lets_success_state" does not exist in Supabase.'
      };
    } catch (err: any) {
      isSupabaseSupported = false;
      return {
        success: false,
        message: 'Reconnection error: ' + (err.message || err)
      };
    }
  },

  getUsers: async () => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.users;
    }
    try {
      const snapshot = await db.collection('users').get();
      return snapshot.docs.map(doc => doc.data() as User);
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.users;
      }
      throw error;
    }
  },
  
  findUserByEmail: async (email: string) => {
    await seedIfNeeded();
    const cleanEmail = email.trim().toLowerCase();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.users.find(u => u.email.toLowerCase() === cleanEmail);
    }
    try {
      const snapshot = await db.collection('users')
        .where('email', '==', cleanEmail)
        .get();
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as User;
      }
      return undefined;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.users.find(u => u.email.toLowerCase() === cleanEmail);
      }
      throw error;
    }
  },

  findUserById: async (id: string) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.users.find(u => u.id === id);
    }
    try {
      const docSnap = await db.collection('users').doc(id).get();
      if (docSnap.exists) {
        return docSnap.data() as User;
      }
      return undefined;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.users.find(u => u.id === id);
      }
      throw error;
    }
  },

  findUserByReferralCode: async (code: string) => {
    await seedIfNeeded();
    const cleanCode = code.trim().toUpperCase();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.users.find(u => u.referralCode.toUpperCase() === cleanCode);
    }
    try {
      const snapshot = await db.collection('users')
        .where('referralCode', '==', cleanCode)
        .get();
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as User;
      }
      return undefined;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.users.find(u => u.referralCode.toUpperCase() === cleanCode);
      }
      throw error;
    }
  },

  getUserPasswordHash: async (userId: string) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.passwords[userId];
    }
    try {
      const docSnap = await db.collection('passwords').doc(userId).get();
      if (docSnap.exists) {
        return (docSnap.data() as any).passwordHash;
      }
      return undefined;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.passwords[userId];
      }
      throw error;
    }
  },

  createUser: async (user: User, passwordHash: string) => {
    await seedIfNeeded();
    const cleanUser = JSON.parse(JSON.stringify({ ...user, email: user.email.toLowerCase().trim() }));
    if (useLocalFallback) {
      const data = await readLocalData();
      data.users.push(cleanUser);
      data.passwords[user.id] = passwordHash;
      await writeLocalData(data);
      return cleanUser;
    }
    try {
      await db.collection('users').doc(user.id).set(cleanUser);
      await db.collection('passwords').doc(user.id).set({ passwordHash });
      return cleanUser;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        data.users.push(cleanUser);
        data.passwords[user.id] = passwordHash;
        await writeLocalData(data);
        return cleanUser;
      }
      throw error;
    }
  },

  updateUser: async (userId: string, updates: Partial<User>) => {
    await seedIfNeeded();
    const cleanUpdates = JSON.parse(JSON.stringify(updates));
    if (useLocalFallback) {
      const data = await readLocalData();
      const index = data.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        data.users[index] = { ...data.users[index], ...cleanUpdates };
        await writeLocalData(data);
        return data.users[index];
      }
      return null;
    }
    try {
      const userRef = db.collection('users').doc(userId);
      const docSnap = await userRef.get();
      if (docSnap.exists) {
        await userRef.update(cleanUpdates);
        const updatedDoc = await userRef.get();
        return updatedDoc.data() as User;
      }
      return null;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        const index = data.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          data.users[index] = { ...data.users[index], ...cleanUpdates };
          await writeLocalData(data);
          return data.users[index];
        }
        return null;
      }
      throw error;
    }
  },

  updateUserPassword: async (userId: string, passwordHash: string) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      data.passwords[userId] = passwordHash;
      await writeLocalData(data);
      return true;
    }
    try {
      await db.collection('passwords').doc(userId).set({ passwordHash });
      return true;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        data.passwords[userId] = passwordHash;
        await writeLocalData(data);
        return true;
      }
      throw error;
    }
  },

  getPackages: async () => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.packages;
    }
    try {
      const snapshot = await db.collection('packages').get();
      return snapshot.docs.map(doc => doc.data() as Package);
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.packages;
      }
      throw error;
    }
  },

  savePackage: async (pkg: Package) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      const index = data.packages.findIndex(p => p.id === pkg.id);
      if (index !== -1) {
        data.packages[index] = pkg;
      } else {
        data.packages.push(pkg);
      }
      await writeLocalData(data);
      return pkg;
    }
    try {
      await db.collection('packages').doc(pkg.id).set(pkg);
      return pkg;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        const index = data.packages.findIndex(p => p.id === pkg.id);
        if (index !== -1) {
          data.packages[index] = pkg;
        } else {
          data.packages.push(pkg);
        }
        await writeLocalData(data);
        return pkg;
      }
      throw error;
    }
  },

  getCourses: async () => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.courses;
    }
    try {
      const snapshot = await db.collection('courses').get();
      return snapshot.docs.map(doc => doc.data() as Course);
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.courses;
      }
      throw error;
    }
  },

  createCourse: async (course: Course) => {
    return DB.saveCourse(course);
  },

  saveCourse: async (course: Course) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      const index = data.courses.findIndex(c => c.id === course.id);
      if (index !== -1) {
        data.courses[index] = course;
      } else {
        data.courses.push(course);
      }
      await writeLocalData(data);
      return course;
    }
    try {
      await db.collection('courses').doc(course.id).set(course);
      return course;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        const index = data.courses.findIndex(c => c.id === course.id);
        if (index !== -1) {
          data.courses[index] = course;
        } else {
          data.courses.push(course);
        }
        await writeLocalData(data);
        return course;
      }
      throw error;
    }
  },

  deleteCourse: async (courseId: string) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      data.courses = data.courses.filter(c => c.id !== courseId);
      await writeLocalData(data);
      return true;
    }
    try {
      await db.collection('courses').doc(courseId).delete();
      return true;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        data.courses = data.courses.filter(c => c.id !== courseId);
        await writeLocalData(data);
        return true;
      }
      throw error;
    }
  },

  getPayments: async () => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.payments;
    }
    try {
      const snapshot = await db.collection('payments').get();
      return snapshot.docs.map(doc => doc.data() as PaymentSubmission);
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.payments;
      }
      throw error;
    }
  },

  createPayment: async (payment: PaymentSubmission) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      data.payments.push(payment);
      await writeLocalData(data);
      return payment;
    }
    try {
      await db.collection('payments').doc(payment.id).set(payment);
      return payment;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        data.payments.push(payment);
        await writeLocalData(data);
        return payment;
      }
      throw error;
    }
  },

  updatePaymentStatus: async (paymentId: string, status: 'approved' | 'rejected', reason?: string) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      const paymentIndex = data.payments.findIndex(p => p.id === paymentId);
      if (paymentIndex === -1) return null;
      const payment = data.payments[paymentIndex];

      payment.status = status;
      if (reason) payment.rejectionReason = reason;

      if (status === 'approved') {
        const userIndex = data.users.findIndex(u => u.id === payment.userId);
        if (userIndex !== -1) {
          const user = data.users[userIndex];
          user.activePackageId = payment.packageId;
          
          if (user.referredBy) {
            const sponsor = data.users.find(u => u.referralCode === user.referredBy.trim().toUpperCase());
            if (sponsor) {
              const commissionAmount = payment.price * 0.8;
              const commissionId = `comm-${Math.random().toString(36).substring(2, 11)}`;
              const commission: Commission = {
                id: commissionId,
                userId: sponsor.id,
                userName: sponsor.name,
                referredUserId: user.id,
                referredUserName: user.name,
                packageId: payment.packageId,
                packageName: payment.packageName,
                amount: commissionAmount,
                status: 'approved',
                createdAt: new Date().toISOString()
              };
              data.commissions.push(commission);

              sponsor.balance = (sponsor.balance || 0) + commissionAmount;
              sponsor.totalEarnings = (sponsor.totalEarnings || 0) + commissionAmount;

              const sponsorNotifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
              data.notifications.push({
                id: sponsorNotifId,
                userId: sponsor.id,
                title: "🎉 Direct Commission Received!",
                message: `Congratulations! Referred member ${user.name} successfully joined with ${payment.packageName}. You received a direct referral commission of ₹${commissionAmount.toFixed(2)} (80%)!`,
                createdAt: new Date().toISOString()
              });
            }
          }

          const buyerNotifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
          data.notifications.push({
            id: buyerNotifId,
            userId: user.id,
            title: "💎 Package Activated!",
            message: `Your payment of ₹${payment.price} has been successfully verified! You now have unrestricted access to all courses in ${payment.packageName}. Complete modules to earn skill rewards!`,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        const buyerNotifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
        data.notifications.push({
          id: buyerNotifId,
          userId: payment.userId,
          title: "❌ Payment Rejected",
          message: `Your payment verification submission for ${payment.packageName} was rejected. Reason: ${reason || 'Invalid screenshot or details'}. Please submit a valid payment screenshot & UPI transaction ID.`,
          createdAt: new Date().toISOString()
        });
      }

      await writeLocalData(data);
      return payment;
    }

    try {
      const paymentRef = db.collection('payments').doc(paymentId);
      const paymentDoc = await paymentRef.get();
      if (!paymentDoc.exists) return null;
      const payment = paymentDoc.data() as PaymentSubmission;

      payment.status = status;
      if (reason) payment.rejectionReason = reason;

      await paymentRef.set(payment);

      if (status === 'approved') {
        const userRef = db.collection('users').doc(payment.userId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const user = userDoc.data() as User;
          user.activePackageId = payment.packageId;
          await userRef.set(user);
          
          if (user.referredBy) {
            const sponsorSnapshot = await db.collection('users')
              .where('referralCode', '==', user.referredBy.trim().toUpperCase())
              .get();
            if (!sponsorSnapshot.empty) {
              const sponsorDoc = sponsorSnapshot.docs[0];
              const sponsor = sponsorDoc.data() as User;
              const commissionAmount = payment.price * 0.8;
              const commissionId = `comm-${Math.random().toString(36).substring(2, 11)}`;
              const commission: Commission = {
                id: commissionId,
                userId: sponsor.id,
                userName: sponsor.name,
                referredUserId: user.id,
                referredUserName: user.name,
                packageId: payment.packageId,
                packageName: payment.packageName,
                amount: commissionAmount,
                status: 'approved',
                createdAt: new Date().toISOString()
              };

              await db.collection('commissions').doc(commissionId).set(commission);

              sponsor.balance = (sponsor.balance || 0) + commissionAmount;
              sponsor.totalEarnings = (sponsor.totalEarnings || 0) + commissionAmount;
              await db.collection('users').doc(sponsor.id).set(sponsor);

              const sponsorNotifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
              await db.collection('notifications').doc(sponsorNotifId).set({
                id: sponsorNotifId,
                userId: sponsor.id,
                title: "🎉 Direct Commission Received!",
                message: `Congratulations! Referred member ${user.name} successfully joined with ${payment.packageName}. You received a direct referral commission of ₹${commissionAmount.toFixed(2)} (80%)!`,
                createdAt: new Date().toISOString()
              });
            }
          }

          const buyerNotifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
          await db.collection('notifications').doc(buyerNotifId).set({
            id: buyerNotifId,
            userId: user.id,
            title: "💎 Package Activated!",
            message: `Your payment of ₹${payment.price} has been successfully verified! You now have unrestricted access to all courses in ${payment.packageName}. Complete modules to earn skill rewards!`,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        const buyerNotifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
        await db.collection('notifications').doc(buyerNotifId).set({
          id: buyerNotifId,
          userId: payment.userId,
          title: "❌ Payment Rejected",
          message: `Your payment verification submission for ${payment.packageName} was rejected. Reason: ${reason || 'Invalid screenshot or details'}. Please submit a valid payment screenshot & UPI transaction ID.`,
          createdAt: new Date().toISOString()
        });
      }

      return payment;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        return DB.updatePaymentStatus(paymentId, status, reason);
      }
      throw error;
    }
  },

  getCommissions: async () => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.commissions;
    }
    try {
      const snapshot = await db.collection('commissions').get();
      return snapshot.docs.map(doc => doc.data() as Commission);
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.commissions;
      }
      throw error;
    }
  },

  getWithdrawals: async () => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.withdrawals;
    }
    try {
      const snapshot = await db.collection('withdrawals').get();
      return snapshot.docs.map(doc => doc.data() as WithdrawalRequest);
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.withdrawals;
      }
      throw error;
    }
  },

  createWithdrawal: async (withdrawal: WithdrawalRequest) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      data.withdrawals.push(withdrawal);
      const user = data.users.find(u => u.id === withdrawal.userId);
      if (user) {
        user.balance = (user.balance || 0) - withdrawal.amount;
      }
      await writeLocalData(data);
      return withdrawal;
    }
    try {
      await db.collection('withdrawals').doc(withdrawal.id).set(withdrawal);
      
      const userRef = db.collection('users').doc(withdrawal.userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const user = userDoc.data() as User;
        user.balance = (user.balance || 0) - withdrawal.amount;
        await userRef.set(user);
      }
      return withdrawal;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        data.withdrawals.push(withdrawal);
        const user = data.users.find(u => u.id === withdrawal.userId);
        if (user) {
          user.balance = (user.balance || 0) - withdrawal.amount;
        }
        await writeLocalData(data);
        return withdrawal;
      }
      throw error;
    }
  },

  updateWithdrawalStatus: async (withdrawalId: string, status: 'approved' | 'rejected') => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      const withdrawIndex = data.withdrawals.findIndex(w => w.id === withdrawalId);
      if (withdrawIndex === -1) return null;
      const withdraw = data.withdrawals[withdrawIndex];

      withdraw.status = status;

      const user = data.users.find(u => u.id === withdraw.userId);

      if (status === 'approved') {
        if (user) {
          user.totalWithdrawn = (user.totalWithdrawn || 0) + withdraw.amount;
          const notifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
          data.notifications.push({
            id: notifId,
            userId: user.id,
            title: "💸 Withdrawal Request Disbursed",
            message: `Your withdrawal of ₹${withdraw.amount} via ${withdraw.method.toUpperCase()} has been approved and paid by admin! Standard bank clearance times apply.`,
            createdAt: new Date().toISOString()
          });
        }
      } else if (status === 'rejected') {
        if (user) {
          user.balance = (user.balance || 0) + withdraw.amount;
          const notifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
          data.notifications.push({
            id: notifId,
            userId: user.id,
            title: "❌ Withdrawal Rejected & Refunded",
            message: `Your withdrawal request of ₹${withdraw.amount} was rejected by admin. The full amount has been refunded back to your wallet balance. Please check your bank information and submit again.`,
            createdAt: new Date().toISOString()
          });
        }
      }

      await writeLocalData(data);
      return withdraw;
    }

    try {
      const withdrawRef = db.collection('withdrawals').doc(withdrawalId);
      const withdrawDoc = await withdrawRef.get();
      if (!withdrawDoc.exists) return null;
      const withdraw = withdrawDoc.data() as WithdrawalRequest;

      withdraw.status = status;
      await withdrawRef.set(withdraw);

      const userRef = db.collection('users').doc(withdraw.userId);
      const userDoc = await userRef.get();

      if (status === 'approved') {
        if (userDoc.exists) {
          const user = userDoc.data() as User;
          user.totalWithdrawn = (user.totalWithdrawn || 0) + withdraw.amount;
          await userRef.set(user);
          
          const notifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
          await db.collection('notifications').doc(notifId).set({
            id: notifId,
            userId: user.id,
            title: "💸 Withdrawal Request Disbursed",
            message: `Your withdrawal of ₹${withdraw.amount} via ${withdraw.method.toUpperCase()} has been approved and paid by admin! Standard bank clearance times apply.`,
            createdAt: new Date().toISOString()
          });
        }
      } else if (status === 'rejected') {
        if (userDoc.exists) {
          const user = userDoc.data() as User;
          user.balance = (user.balance || 0) + withdraw.amount;
          await userRef.set(user);

          const notifId = `notif-${Math.random().toString(36).substring(2, 11)}`;
          await db.collection('notifications').doc(notifId).set({
            id: notifId,
            userId: user.id,
            title: "❌ Withdrawal Rejected & Refunded",
            message: `Your withdrawal request of ₹${withdraw.amount} was rejected by admin. The full amount has been refunded back to your wallet balance. Please check your bank information and submit again.`,
            createdAt: new Date().toISOString()
          });
        }
      }

      return withdraw;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        return DB.updateWithdrawalStatus(withdrawalId, status);
      }
      throw error;
    }
  },

  getNotifications: async () => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.notifications;
    }
    try {
      const snapshot = await db.collection('notifications').get();
      return snapshot.docs.map(doc => doc.data() as Notification);
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.notifications;
      }
      throw error;
    }
  },

  createNotification: async (notif: Notification) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      data.notifications.push(notif);
      await writeLocalData(data);
      return notif;
    }
    try {
      await db.collection('notifications').doc(notif.id).set(notif);
      return notif;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        data.notifications.push(notif);
        await writeLocalData(data);
        return notif;
      }
      throw error;
    }
  },

  getNotices: async () => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.notices;
    }
    try {
      const snapshot = await db.collection('notices').get();
      return snapshot.docs.map(doc => doc.data() as Notice);
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.notices;
      }
      throw error;
    }
  },

  createNotice: async (title: string, content: string) => {
    await seedIfNeeded();
    const noticeId = `notice-${Math.random().toString(36).substring(2, 11)}`;
    const notice: Notice = {
      id: noticeId,
      title,
      content,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    if (useLocalFallback) {
      const data = await readLocalData();
      data.notices.push(notice);
      await writeLocalData(data);
      return notice;
    }
    try {
      await db.collection('notices').doc(noticeId).set(notice);
      return notice;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        data.notices.push(notice);
        await writeLocalData(data);
        return notice;
      }
      throw error;
    }
  },

  deleteNotice: async (id: string) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      data.notices = data.notices.filter(n => n.id !== id);
      await writeLocalData(data);
      return true;
    }
    try {
      await db.collection('notices').doc(id).delete();
      return true;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        data.notices = data.notices.filter(n => n.id !== id);
        await writeLocalData(data);
        return true;
      }
      throw error;
    }
  },

  getSettings: async () => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      return data.settings || DEFAULT_SETTINGS;
    }
    try {
      const settingsDoc = await db.collection('settings').doc('system').get();
      if (settingsDoc.exists) {
        return settingsDoc.data() as SystemSettings;
      }
      await db.collection('settings').doc('system').set(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        return data.settings || DEFAULT_SETTINGS;
      }
      throw error;
    }
  },

  updateSettings: async (settings: Partial<SystemSettings>) => {
    await seedIfNeeded();
    if (useLocalFallback) {
      const data = await readLocalData();
      data.settings = { ...DEFAULT_SETTINGS, ...data.settings, ...settings };
      await writeLocalData(data);
      return data.settings;
    }
    try {
      const settingsRef = db.collection('settings').doc('system');
      const docSnap = await settingsRef.get();
      if (docSnap.exists) {
        await settingsRef.update(settings);
      } else {
        await settingsRef.set({ ...DEFAULT_SETTINGS, ...settings });
      }
      const sDoc = await settingsRef.get();
      return sDoc.data() as SystemSettings;
    } catch (error: any) {
      if (error) {
        useLocalFallback = true;
        const data = await readLocalData();
        data.settings = { ...DEFAULT_SETTINGS, ...data.settings, ...settings };
        await writeLocalData(data);
        return data.settings;
      }
      throw error;
    }
  },

  getBlogs: async () => {
    await seedIfNeeded();
    const data = await readLocalData();
    return data.blogs || [];
  },

  getBlogById: async (id: string) => {
    await seedIfNeeded();
    const data = await readLocalData();
    return (data.blogs || []).find(b => b.id === id);
  },

  getBlogBySlug: async (slug: string) => {
    await seedIfNeeded();
    const data = await readLocalData();
    return (data.blogs || []).find(b => b.slug === slug);
  },

  createBlog: async (blog: BlogPost) => {
    await seedIfNeeded();
    const data = await readLocalData();
    if (!data.blogs) data.blogs = [];
    data.blogs.push(blog);
    await writeLocalData(data);
    return blog;
  },

  updateBlog: async (id: string, updates: Partial<BlogPost>) => {
    await seedIfNeeded();
    const data = await readLocalData();
    if (!data.blogs) data.blogs = [];
    const index = data.blogs.findIndex(b => b.id === id);
    if (index !== -1) {
      data.blogs[index] = { ...data.blogs[index], ...updates };
      await writeLocalData(data);
      return data.blogs[index];
    }
    return null;
  },

  deleteBlog: async (id: string) => {
    await seedIfNeeded();
    const data = await readLocalData();
    if (!data.blogs) data.blogs = [];
    data.blogs = data.blogs.filter(b => b.id !== id);
    await writeLocalData(data);
    return true;
  },

  addBlogComment: async (blogId: string, comment: BlogComment) => {
    await seedIfNeeded();
    const data = await readLocalData();
    if (!data.blogs) data.blogs = [];
    const index = data.blogs.findIndex(b => b.id === blogId);
    if (index !== -1) {
      if (!data.blogs[index].comments) data.blogs[index].comments = [];
      data.blogs[index].comments.push(comment);
      await writeLocalData(data);
      return data.blogs[index];
    }
    return null;
  }
};
