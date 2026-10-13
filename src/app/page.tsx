"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBranding } from "@/context/BrandingContext";

export default function HomePage() {
  const { branding } = useBranding();

  // Enquire Now Form State
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    mobile: "",
    role: "Retailer",
    city: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Policy & About Modals
  const [activeModal, setActiveModal] = useState<"about" | "terms" | "privacy" | "refund" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEnquirySuccess(null);
    setEnquiryError(null);

    try {
      const res = await fetch("/api/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry. Please try again.");
      }
      setEnquirySuccess(
        `Thank you, ${enquiryForm.name}! Your enquiry (${data.enquiryId}) has been received. Our team will call you at ${enquiryForm.mobile} shortly.`
      );
      setEnquiryForm({
        name: "",
        mobile: "",
        role: "Retailer",
        city: "",
        message: "",
      });
    } catch (err: any) {
      setEnquiryError(err.message || "Failed to submit. Please call our helpline directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* ─── 1. TOP HEADER / CONTACT STRIP ─── */}
      <div className="bg-gradient-to-r from-navy-950 via-blue-950 to-slate-950 border-b border-white/10 px-4 sm:px-8 py-2 text-xs text-gray-300 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-bold text-amber-400">
            <span>📞</span> Call:
          </span>
          <a
            href="tel:7045470545"
            className="font-mono font-semibold text-white hover:text-amber-300 transition-colors"
          >
            7045470545
          </a>
          <span className="text-gray-500">|</span>
          <a
            href="tel:9867231230"
            className="font-mono font-semibold text-white hover:text-amber-300 transition-colors"
          >
            9867231230
          </a>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-gray-400">
          <span className="hidden md:inline-flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {branding.appName} — India&apos;s High-Speed B2B2C Digital Platform • 100,000+ Active Retailers
          </span>
          <Link
            href="/verification"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold transition-all hover:scale-105"
          >
            <span>🔍</span> Operator Verification Terminal
          </Link>
        </div>
      </div>

      {/* ─── 2. MAIN NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src={`${branding.logoUrl}?v=${branding.cacheBuster}`}
            alt={branding.appName}
            className="w-10 h-10 object-contain rounded-xl bg-white p-1 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              {branding.appName}
            </span>
            <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
              {branding.tagline}
            </span>
          </div>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
          <a href="#Home" className="hover:text-blue-400 transition-colors">Home</a>
          <a href="#About" className="hover:text-blue-400 transition-colors">About Us</a>
          <a href="#Services" className="hover:text-blue-400 transition-colors">Services</a>
          <a href="#Products" className="hover:text-blue-400 transition-colors">Products</a>
          <a href="#Benefits" className="hover:text-blue-400 transition-colors">Benefits</a>
          <a href="#Contact" className="hover:text-blue-400 transition-colors">Contact Us</a>
          <Link
            href="/verification"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-semibold"
          >
            <span>🔍</span> Operator Desk
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold text-gray-200 hover:text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 fast-tap active:scale-[0.98]"
          >
            Register
          </Link>
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Toggle Navigation"
          >
            <span className="text-xl">☰</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-white/10 px-6 py-4 space-y-3 text-sm font-semibold text-gray-200 animate-fadeIn">
          <a
            href="#Home"
            onClick={() => setMobileMenuOpen(false)}
            className="block hover:text-blue-400 py-1"
          >
            Home
          </a>
          <a
            href="#About"
            onClick={() => setMobileMenuOpen(false)}
            className="block hover:text-blue-400 py-1"
          >
            About Us
          </a>
          <a
            href="#Services"
            onClick={() => setMobileMenuOpen(false)}
            className="block hover:text-blue-400 py-1"
          >
            Services
          </a>
          <a
            href="#Products"
            onClick={() => setMobileMenuOpen(false)}
            className="block hover:text-blue-400 py-1"
          >
            Products
          </a>
          <a
            href="#Benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block hover:text-blue-400 py-1"
          >
            Benefits
          </a>
          <a
            href="#Contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block hover:text-blue-400 py-1"
          >
            Contact Us
          </a>
          <Link
            href="/verification"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-cyan-400 py-1 font-bold"
          >
            🔍 Operator Verification Terminal
          </Link>
        </div>
      )}

      {/* ─── 3. HERO & WELCOME SECTION ─── */}
      <section id="Home" className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 flex flex-col justify-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-950/70 border border-blue-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-300 mb-6 backdrop-blur-sm">
            <span>⚡</span> Welcome to {branding.appName} — India&apos;s Premier Recharge Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            State-of-the-Art{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              B2B2C Digital Platform
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Earn high commission on each and every transaction for your customers easily and quickly of more than <strong>500+ Services in One Application</strong>. Mobile recharge, DTH recharge, data card, postpaid bill payments, electricity bill payment, and BBPS.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#Contact"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold rounded-2xl shadow-xl shadow-blue-500/30 text-base transition-all transform hover:-translate-y-0.5 fast-tap active:scale-[0.98]"
            >
              Join Our Growing Network →
            </a>
            <a
              href="#Contact"
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-2xl text-base transition-colors flex items-center justify-center gap-2 fast-tap active:scale-[0.98]"
            >
              <span>📩</span> Enquire Now
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-2xl text-base transition-colors flex items-center justify-center gap-2 fast-tap active:scale-[0.98]"
            >
              <span>⚡</span> Partner Portal Login
            </Link>
          </div>

          {/* Quick Partnership Callout */}
          <div className="mt-12 p-4 bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 border border-blue-500/30 rounded-2xl max-w-2xl mx-auto backdrop-blur-sm">
            <span className="text-amber-400 font-bold text-sm">🚀 Business Opportunity:</span>
            <p className="text-xs sm:text-sm text-gray-200 mt-1">
              Become a business partner and <strong>Earn up to Rs. 50,000 per month</strong> with instant settlements and highest commission rates in India.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 4. JOIN OUR GROWING NETWORK (STATS COUNTERS) ─── */}
      <section className="py-12 px-4 sm:px-8 bg-slate-900/80 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Proven Network Scale
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Join Our Growing Network
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/40 transition-colors">
              <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">100,000+</div>
              <div className="text-xs sm:text-sm text-gray-300 font-bold mt-2">Retailers</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Active retail touchpoints</div>
            </div>

            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/40 transition-colors">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">5,000+</div>
              <div className="text-xs sm:text-sm text-gray-300 font-bold mt-2">Distributors</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Master &amp; direct channels</div>
            </div>

            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/40 transition-colors">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">250+</div>
              <div className="text-xs sm:text-sm text-gray-300 font-bold mt-2">APIs</div>
              <div className="text-[11px] text-gray-500 mt-0.5">High-speed switches</div>
            </div>

            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/40 transition-colors">
              <div className="text-3xl sm:text-4xl font-black text-purple-400 font-mono">156</div>
              <div className="text-xs sm:text-sm text-gray-300 font-bold mt-2">Cities</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Pan-India coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. ABOUT US SECTION ─── */}
      <section id="About" className="py-16 px-4 sm:px-8 bg-slate-950">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-4">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-950/70 border border-blue-500/30 px-3 py-1 rounded-full">
              Trusted Digital Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              About Us — {branding.appName}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              <strong>{branding.appName}</strong> is a state-of-the-art B2B2C digital platform designed for high-speed multi-recharge and bill payment processing.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {branding.appName} delivers a premier B2B2C service experience trusted by more than 100,000+ customers and partners across India. We provide an all-in-one digital recharge business, covering mobile recharge, DTH recharge, data card, postpaid bill payments, electricity bill payment, and BBPS utility collections with bank-grade security and instant commission crediting.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveModal("about")}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all fast-tap active:scale-[0.98]"
              >
                Read More →
              </button>
            </div>
          </div>

          <div className="w-full md:w-96 bg-gradient-to-br from-blue-950 via-slate-900 to-navy-950 border border-blue-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Over a Decade of Trust</h3>
                <span className="text-xs text-blue-300">Fast &amp; Reliable Switch</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span>All-in-one Recharge &amp; BBPS Business</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span>More than 500+ services in single dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span>Earn up to Rs. 50,000 per month</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span>White-label B2B Multi Recharge website creation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. SERVICES SECTION ─── */}
      <section id="Services" className="py-16 px-4 sm:px-8 bg-slate-900/60 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              High Commission Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">
              Our Services
            </h2>
            <p className="text-gray-300 text-sm mt-2 max-w-xl mx-auto font-medium">
              Become a business partner and Earn up to Rs. 50,000 per month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service 1 */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  📱
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mobile Recharge Service</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Fast automatic recharge for Jio, Airtel, Vodafone Idea, and BSNL with instant operator verification, circles, and highest commissions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-blue-400">
                <span>98% Success Ratio</span>
                <span>Instant Topup →</span>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  📡
                </div>
                <h3 className="text-lg font-bold text-white mb-2">DTH Recharge Service</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Instant recharge and customer name verification for Tata Play, Airtel DTH, Dish TV, Sun Direct, and D2H subscribers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>100% Success Ratio</span>
                <span>Name Fetch →</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <h3 className="text-lg font-bold text-white mb-2">BBPS Bill Payment Service</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Electricity, gas, water, broadband, postpaid mobile, and landline bill payments through NPCI-certified Bharat Bill Payment System.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>100% Success Ratio</span>
                <span>Instant Receipts →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. PRODUCTS & FEATURES (WHITE-LABEL & B2B) ─── */}
      <section id="Products" className="py-16 px-4 sm:px-8 bg-slate-950 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-full">
              B2B Recharge Software &amp; White-Label
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Opportunity to Create Your Own Domain Name Multi Recharge Website
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong>Our Features:</strong> Get more revenue on your website with B2B Recharge Software. We provide full multi-recharge white-label platforms on your own brand domain with multi-tier distributor hierarchy, admin control, and wallet management.
            </p>

            <div className="space-y-3 pt-2 text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Custom Domain Integration:</strong> Launch on your custom domain name with full brand control.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>250+ High-Speed APIs:</strong> Auto-routing fallback engine ensuring 99.98% uptime.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Hierarchy Engine:</strong> Super Distributors, Master Distributors, Distributors &amp; Retailers.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Real-time Margin Crediting:</strong> Automated commission splits on every mobile and utility payment.</span>
              </div>
            </div>

            <div className="pt-3">
              <a
                href="#Contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl text-xs font-bold text-white transition-all shadow-md fast-tap active:scale-[0.98]"
              >
                <span>🚀</span> Get B2B Recharge Software Now
              </a>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg bg-navy-950 rounded-3xl p-6 border border-white/15 shadow-2xl">
            <div className="border-b border-white/10 pb-4 mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {branding.appName} Solution Stack
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                PROVEN
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-white mb-1">Own Domain Multi Recharge Website</div>
                <div className="text-[11px] text-gray-400">Complete portal branded with your logo, domain, and custom pricing.</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-white mb-1">Android Mobile Application</div>
                <div className="text-[11px] text-gray-400">Native Android app for instant recharges and retailer transactions on the go.</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-white mb-1">All-in-One Wallet Architecture</div>
                <div className="text-[11px] text-gray-400">Single balance pool powering 500+ services with bank-grade security.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. OUR BENEFITS (SUCCESS RATIOS) ─── */}
      <section id="Benefits" className="py-16 px-4 sm:px-8 bg-slate-900/60 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Performance Ratios
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">
              Our Benefits
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Industry-leading switch uptime and settlement accuracy across India.
            </p>
          </div>

          <div className="space-y-6">
            {/* Meter 1 */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-white">Mobile Recharge Service</span>
                <span className="font-mono font-black text-blue-400 text-lg">98%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-1000" style={{ width: "98%" }}></div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Instant telecom operator routing with auto circle detection and MNP support.</p>
            </div>

            {/* Meter 2 */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-white">DTH Recharge Service</span>
                <span className="font-mono font-black text-cyan-400 text-lg">100%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-1000" style={{ width: "100%" }}></div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Direct provider name verification and instant package recharge credit.</p>
            </div>

            {/* Meter 3 */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-white">BBPS Bill Payment Service</span>
                <span className="font-mono font-black text-emerald-400 text-lg">100%</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: "100%" }}></div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">NPCI-connected Bharat Bill Payment System with instant official reference receipts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. TESTIMONIALS ─── */}
      <section className="py-16 px-4 sm:px-8 bg-slate-950 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Client Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-1">
              Testimonials
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              What our partners and retailers say about our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm mb-3">★★★★★</div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed italic">
                  &ldquo;I have been working with {branding.appName} as a Master Distributor. The recharge speed is unbelievable and commission is credited immediately after every customer transaction.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="font-bold text-white text-xs">Manoj K. Sharma</div>
                <div className="text-[11px] text-gray-400">Master Distributor, Maharashtra</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm mb-3">★★★★★</div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed italic">
                  &ldquo;Created our own domain multi recharge website using their B2B Recharge Software. My retailer network expanded to over 400 shops in just 4 months. Exceptional service!&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="font-bold text-white text-xs">Ramesh Patel</div>
                <div className="text-[11px] text-gray-400">White-Label Portal Owner, Gujarat</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm mb-3">★★★★★</div>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed italic">
                  &ldquo;The DTH customer name verification saved our retailers from wrong number recharge complaints. Customer support is always ready to help.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="font-bold text-white text-xs">Amit Verma</div>
                <div className="text-[11px] text-gray-400">Distributor, Uttar Pradesh</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. ENQUIRE NOW / FILL THE FORM TO CONNECT WITH US ─── */}
      <section id="Contact" className="py-16 px-4 sm:px-8 bg-gradient-to-b from-slate-950 via-navy-950 to-slate-950 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full">
              Get Started Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">
              Fill Out the Form to Connect With Us
            </h2>
            <p className="text-gray-300 text-sm mt-2 max-w-lg mx-auto">
              Ready to launch your multi-recharge business or need B2B software? Enquire now and our partnership team will contact you promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Contact Info Callout */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white">Call Us Directly</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Connect with our business development and retailer support team:
                </p>
              </div>

              {/* Direct Calling Numbers */}
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                    📞 Direct Mobile Helpline
                  </div>
                  <div className="flex flex-col gap-1 font-mono text-base sm:text-lg font-bold text-white">
                    <a href="tel:7045470545" className="hover:text-amber-300 transition-colors">
                      7045470545
                    </a>
                    <a href="tel:9867231230" className="hover:text-amber-300 transition-colors">
                      9867231230
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">
                    ☎️ Customer Care Landlines
                  </div>
                  <div className="flex flex-col gap-1 font-mono text-sm sm:text-base font-semibold text-gray-200">
                    <a href="tel:02240160303" className="hover:text-blue-300 transition-colors">
                      022 - 40160303
                    </a>
                    <a href="tel:02240103737" className="hover:text-blue-300 transition-colors">
                      022 - 40103737
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">
                    📍 Registered Office Address
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed font-normal">
                    C 13, PRATAPGARH CHS LTD, PLOT NO CD-27, RSC-3, GANESH NAGAR, KANDIVALI WEST, Mumbai Suburban, Maharashtra, 400067
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-950/40 rounded-2xl border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                ⚡ <strong>Instant Onboarding:</strong> Get your Retailer, Distributor, Admin, or Super Admin account activated with instant float balance support.
              </div>
            </div>

            {/* Right: Enquire Now Form */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2">Enquire Now</h3>
              <p className="text-xs text-gray-400 mb-6">
                Fill the details below to request a callback or setup a demonstration:
              </p>

              {enquirySuccess && (
                <div className="mb-6 p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300">
                  <div className="font-bold text-sm text-emerald-200 mb-1">✅ Enquiry Received!</div>
                  {enquirySuccess}
                </div>
              )}

              {enquiryError && (
                <div className="mb-6 p-4 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs text-red-300">
                  {enquiryError}
                </div>
              )}

              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={enquiryForm.mobile}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, mobile: e.target.value.replace(/\D/g, "") })}
                      placeholder="e.g. 9820112233"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      City / State
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.city}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, city: e.target.value })}
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Partnership Type
                  </label>
                  <select
                    value={enquiryForm.role}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Super Admin">Super Admin (Platform Owner &amp; System Control)</option>
                    <option value="Admin">Admin (Franchise &amp; Administrative Manager)</option>
                    <option value="Super Distributor">Super Distributor (State Partner)</option>
                    <option value="Master Distributor">Master Distributor (City / Regional Lead)</option>
                    <option value="Distributor">Distributor (Onboard Retailers)</option>
                    <option value="Retailer">Retailer (Recharge &amp; Bill Payments)</option>
                    <option value="B2B Recharge Software">B2B Recharge Software / Own Domain Website</option>
                    <option value="API Integration">Recharge &amp; BBPS API Integration</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Your Requirements / Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Tell us about your business or services you are looking to start..."
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all fast-tap active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. FOOTER ─── */}
      <footer className="bg-slate-950 border-t border-white/10 py-10 px-4 sm:px-8 text-xs text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={`${branding.logoUrl}?v=${branding.cacheBuster}`}
              alt={branding.appName}
              className="w-9 h-9 object-contain rounded-xl bg-white p-1 shadow-md shadow-blue-500/20"
            />
            <div>
              <span className="font-bold text-white text-sm block">{branding.appName}</span>
              <span className="text-[11px] text-gray-400">{branding.tagline}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300 font-medium">
            <a href="#Home" className="hover:text-white">Home</a>
            <a href="#About" className="hover:text-white">About Us</a>
            <a href="#Services" className="hover:text-white">Services</a>
            <a href="#Products" className="hover:text-white">Products</a>
            <Link href="/login" className="hover:text-white">Login</Link>
            <Link href="/login" className="hover:text-white">Register</Link>
            <Link href="/verification" className="hover:text-cyan-400">Operator Desk</Link>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="text-gray-300">
              Copyright © {new Date().getFullYear()} {branding.appName}. All rights reserved.
            </p>
            <div className="flex items-center justify-center md:justify-end gap-3 text-[11px] text-gray-500">
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="hover:text-gray-300 underline"
              >
                Terms &amp; Conditions
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="hover:text-gray-300 underline"
              >
                Privacy Policy
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setActiveModal("refund")}
                className="hover:text-gray-300 underline"
              >
                Refund Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── 12. POPUP MODALS (ABOUT / TERMS / PRIVACY / REFUND) ─── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 text-gray-200 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">
                {activeModal === "about" && `About ${branding.appName}`}
                {activeModal === "terms" && "Terms & Conditions"}
                {activeModal === "privacy" && "Privacy Policy"}
                {activeModal === "refund" && "Refund & Cancellation Policy"}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs sm:text-sm space-y-3 leading-relaxed text-gray-300">
              {activeModal === "about" && (
                <>
                  <p>
                    <strong>{branding.appName}</strong> is a state-of-the-art B2B2C Digital Platform with more than 100,000+ customers and partners all over India.
                  </p>
                  <p>
                    We specialize in all-in-one recharge solutions, providing mobile recharge, DTH recharge, data card, postpaid bill payments, electricity bill payments, and BBPS utility collections with highest commission rates and instant float settlements.
                  </p>
                  <p>
                    Entrepreneurs and distributors can build their own multi-recharge websites with custom domains, taking full advantage of our 250+ enterprise APIs and 99.98% switch uptime.
                  </p>
                </>
              )}

              {activeModal === "terms" && (
                <>
                  <p>
                    Welcome to {branding.appName}. By accessing our website, mobile application, or API services, you agree to comply with and be bound by the terms and conditions outlined herein.
                  </p>
                  <p>
                    1. <strong>Platform Access:</strong> Retailers and distributors must maintain sufficient wallet float for transaction execution. All recharge and bill transactions are processed in real time through partner gateways.
                  </p>
                  <p>
                    2. <strong>Compliance:</strong> Users must comply with applicable Indian telecom and financial regulations, including NPCI BBPS standards and KYC guidelines.
                  </p>
                </>
              )}

              {activeModal === "privacy" && (
                <>
                  <p>
                    {branding.appName} is committed to protecting your privacy and security. We maintain 256-bit encryption for all transactional data.
                  </p>
                  <p>
                    We collect relevant information such as mobile numbers and transaction parameters strictly for the purpose of executing recharge switches, providing receipts, and complying with statutory record-keeping regulations.
                  </p>
                </>
              )}

              {activeModal === "refund" && (
                <>
                  <p>
                    <strong>Refund &amp; Cancellation Policy:</strong>
                  </p>
                  <p>
                    1. If a transaction fails at the telecom or utility provider gateway after wallet debit, the disputed amount is automatically credited back to your {branding.appName} balance within 15 to 30 minutes.
                  </p>
                  <p>
                    2. Successful recharges verified by the operator reference / UTR are non-refundable as the service has been delivered to the target subscriber.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
