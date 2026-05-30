import React from 'react';
import { HelpCircle, Sparkles, AlertCircle, Percent, ArrowRight } from 'lucide-react';

export default function FAQView() {
  const faqs = [
    {
      category: "GENERAL BASIS",
      q: "What is Let's Success 2.0?",
      a: "Let's Success 2.0 is a next-generation learn-and-earn affiliate ecosystem. You learn trending digital skills like Canva Mastery, Website Design, AI tools, and Stock Market fundamentals, and additionally earn substantial direct commissions of up to 80% by helping other learners find our custom bundles."
    },
    {
      category: "GENERAL BASIS",
      q: "Is there any monthly or renewal fee?",
      a: "No! There are absolutely no dynamic recurring hidden charges. Once you purchase any package, you get lifetime updates to the included videos, recorded webinars, and complete access to the affiliate system."
    },
    {
      category: "AFFILIATE & COMMISSION",
      q: "How does the High Commission 80% System function?",
      a: "When another user registers on our platform using your unique referral code (or standard referral URL) and completes a package purchase, they will upload their payment screenshot. Once our Admin confirms this payment UTR, you instantly receive exactly 80% of the entire package value in your wallet balance! For example: referring the Branding Mastery Package (₹4499) pays you ₹3599.20 directly!"
    },
    {
      category: "AFFILIATE & COMMISSION",
      q: "Are there multi-level networking or MLM tiers?",
      a: "No. In strict adherence to our premium design specifications, there is no level or multi-tier passive team income. It is exclusively Direct Referral Commission (80%) to maintain structural clarity and maximum profitability per single active member."
    },
    {
      category: "PAYMENTS & MANUAL VERIFICATION",
      q: "How do I purchase a package manually?",
      a: "Log into your profile dashboard, go to the Packages/Purchase view, and look at our UPI payment details. Make a payment using any standard UPI app (GPay, PhonePe, Paytm), capture a screenshot showing the transaction UTR / Transaction ID clearly, enter the code in the form, field-upload the screenshot, and submit. Marpit Admin usually reviews and activates accounts within a few hours!"
    },
    {
      category: "PAYMENTS & MANUAL VERIFICATION",
      q: "What if my payment submission gets rejected?",
      a: "If a submission gets rejected, don't worry! You will get a notification in your profile detailing the reason (for example, cut-off screenshot or typing typo in UTR). Double-check, correct the error, and submit a clear, valid entry. You can also write directly to marpit792@gmail.com."
    },
    {
      category: "WITHDRAWALS",
      q: "How do I request a withdrawal of my earned commission?",
      a: "Once you have commissions approved in your wallet balance, click on 'Withdraw Request' from your profile dashboard drawer. Fill in your UPI ID or Bank account credentials on your Profile state page first, enter your desired cash-out amount, and hit request. Payouts are verified daily and sent directly to your account!"
    },
    {
      category: "WITHDRAWALS",
      q: "What is the minimum limit or fee to withdraw?",
      a: "There is absolutely no minimum limit and zero withdrawal fees! If you earn ₹1199.20, you can withdraw exactly and full ₹1199.20 straight away. Admin ensures seamless, rapid verification."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-16">
      
      {/* HEADER */}
      <div className="text-center space-y-4">
        <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-wider">
          Complete <span className="text-yellow-500">FAQ Repository</span>
        </h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-yellow-500 to-cyan-400 mx-auto rounded-full"></div>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Uncompromised educational guidelines to master the Let's Success 2.0 affiliate learning landscape.
        </p>
      </div>

      {/* RHYTHM GRID */}
      <div className="space-y-8">
        {faqs.map((faq, idx) => (
          <div 
            key={idx} 
            className="glass-panel p-6 rounded-2xl relative border-l-2 border-cyan-500/20 hover:border-cyan-500 transition duration-300"
          >
            <span className="absolute top-4 right-6 text-[9px] font-mono tracking-widest text-slate-500 font-bold uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
              {faq.category}
            </span>
            
            <div className="space-y-3.5 mt-2">
              <div className="flex items-start space-x-2.5">
                <HelpCircle className="h-5.5 w-5.5 text-yellow-500 flex-shrink-0" />
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-200">
                  {faq.q}
                </h3>
              </div>
              
              <p className="text-sm text-slate-400 leading-relaxed pl-8">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CENTRAL CONVERTING CTA */}
      <div className="glass-panel border-yellow-500/10 p-8 rounded-3xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-500 via-yellow-500 to-cyan-500"></div>
        <h3 className="font-display font-extrabold text-xl text-yellow-500">Ready to Embark on Your Digital Journey?</h3>
        <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Master in-demand skills and generate secure automated commissions with other active learners.
        </p>
      </div>

    </div>
  );
}
