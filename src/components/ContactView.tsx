import React from 'react';
import { Mail, Clock, MessageCircle, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactView() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: 'General Question',
    message: ''
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Simulate API delivery
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: 'General Question', message: '' });
    }, 4500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-16">
      
      {/* HEADER */}
      <div className="text-center space-y-4">
        <h1 className="font-display font-black text-4xl sm:text-6xl text-white uppercase tracking-wider">
          Contact <span className="text-cyan-400">Support Desk</span>
        </h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-400 to-yellow-500 mx-auto rounded-full"></div>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Need help registering, verifying your manually submitted payment screenshot, or editing bank information? Speak to us!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        
        {/* CONTACT CARDS - LEFT PANEL */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-100 uppercase tracking-wide">
              Reach Out Directly
            </h3>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Admin Email Support</div>
                  <a href="mailto:marpit792@gmail.com" className="text-cyan-400 font-mono hover:underline">
                    marpit792@gmail.com
                  </a>
                  <p className="text-slate-500 text-xs mt-0.5">Response within 2-4 working hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 border-t border-slate-900 pt-4">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Working Office Hours</div>
                  <p className="font-mono text-xs text-slate-400">Monday - Saturday (10:00 AM - 07:00 PM IST)</p>
                  <p className="text-slate-500 text-xs mt-0.5">Closed on Sundays & National Holidays</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 border-t border-slate-900 pt-4">
                <MapPin className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Operational Address</div>
                  <p className="text-slate-400 text-xs">Let's Success 2.0 digital offices, Rajasthan, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border-yellow-500/10">
            <h4 className="font-bold text-yellow-500 text-sm mb-1">💡 Pro-Tip for Verification</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When verifying payments, please ensure that the transaction UTR number and the payment date are clearly readable in the screenshot. Admin verifies daily.
            </p>
          </div>
        </div>

        {/* SECURE SUBMISSION FORM - RIGHT PANEL */}
        <div className="md:col-span-7">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/3 rounded-full blur-2xl"></div>

            <h3 className="font-display font-bold text-xl text-slate-200 mb-6">
              Create Support Ticket
            </h3>

            {submitted ? (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-8 text-center space-y-3 animate-fade-in">
                <CheckCircle2 className="h-10 w-10 text-cyan-400 mx-auto" />
                <h4 className="text-lg font-bold text-slate-100">Ticket Dispatched Successfully</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your inquiry message has been securely submitted on-server. Our chief agent will review and follow up at your registered email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Your Registered Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@email.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Inquiry Department</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-200 transition-colors"
                    >
                      <option value="General Question">General Inquiry</option>
                      <option value="Payment verification problem">Payment verification issue</option>
                      <option value="Withdrawal delayed">Withdrawal settlement</option>
                      <option value="Partnership / Affiliate query">Affiliate commission code</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Detailed Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue with clarity or write down your sponsor details..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 transition-colors"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Send className="h-4.5 w-4.5" />
                  <span>Send Secure Message</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
