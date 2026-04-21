import React, { useState } from 'react';
import api from '../../services/endpoints.js';
import axios from 'axios';
import useStudentStore from '../../Store/studentstore.js';
import { toast } from 'react-toastify';

/* ── data ─────────────────────────────────────────────────────────────────── */
const tiers = [
  {
    pct: '25%',  label: 'Merit',       color: '#0078FF', bg: 'bg-blue-50',  border: 'border-blue-100',
    desc: 'Score between 60–74% in the scholarship test',
    perks: ['Fee waiver on tuition', 'Study material included', 'Access to test series'],
    dark: false,
  },
  {
    pct: '50%',  label: 'Performance', color: '#FB0500', bg: 'bg-red-50',   border: 'border-red-100',
    desc: 'Score between 75–89% in the scholarship test',
    perks: ['50% tuition fee waiver', 'Free study material', 'Priority doubt sessions', 'Monthly mentoring'],
    dark: true,
  },
  {
    pct: '100%', label: 'Excellence',  color: '#08B100', bg: 'bg-green-50', border: 'border-green-100',
    desc: 'Score 90% and above in the scholarship test',
    perks: ['Full fee waiver', 'Premium study kit', 'Personal mentor', 'Topper batch access', 'Certificate of excellence'],
    dark: false,
  },
];

const steps = [
  { num: '01', title: 'Register Online',   desc: 'Fill in the application form below with your details and select your program.',  accent: '#FB0500' },
  { num: '02', title: 'Appear for Test',   desc: 'Attend the Roots Scholarship Test (RST) — conducted online or at our Ludhiana center.', accent: '#0078FF' },
  { num: '03', title: 'Get Your Result',   desc: 'Results announced within 3 working days. Check your email for the scorecard.',     accent: '#FB0500' },
  { num: '04', title: 'Confirm Admission', desc: 'Finalise enrollment with the applicable scholarship discount and join the batch.',  accent: '#0078FF' },
];

const eligibility = [
  { icon: '🎓', text: 'Students from Class 8 to Class 12 (current or just passed)' },
  { icon: '📋', text: 'Dropper students appearing for NEET / IIT-JEE' },
  { icon: '📊', text: 'Minimum 55% marks in last qualifying exam' },
  { icon: '📍', text: 'Open to students from any school/board across India' },
  { icon: '👨‍👩‍👧', text: 'Special consideration for economically weaker sections (EWS)' },
  { icon: '🏅', text: 'State/national olympiad medal holders get direct 50% scholarship' },
];

const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0078FF] focus:ring-2 focus:ring-blue-100 transition';
const selectCls = inputCls + ' bg-white appearance-none cursor-pointer';
const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2';

/* ── component ───────────────────────────────────────────────────────────── */
const ScholarshipForm = () => {
  const { student } = useStudentStore();

  const [formData, setFormData] = useState({
    program: '', studentClass: '', lookingForCategory: '', email: '', phone: ''
  });

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(api.scholarship.apply, { ...formData, studentId: student?._id });
      toast.success(res?.data?.message || 'Applied Successfully');
    } catch (error) {
      const message = error?.response?.data?.message || '';
      if (message.toLowerCase().includes('already applied'))  toast.error('⚠️ You have already applied for scholarship');
      else if (message.toLowerCase().includes('not eligible')) toast.error('❌ You are not eligible for scholarship');
      else toast.error(message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-blueprint relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FB0500]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#0078FF]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating decorative % */}
        <div className="absolute right-16 top-8 text-[120px] font-black text-white/[0.03] leading-none pointer-events-none hidden lg:block select-none">%</div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FB0500]/15 border border-[#FB0500]/20 text-[#FB0500] text-xs font-bold uppercase tracking-widest mb-4">
                🏆 Limited Seats Available
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Get Up To<br />
                <span className="text-[#FB0500]">100% Scholarship</span><br />
                <span className="text-gray-300 text-3xl font-bold">on All Programs</span>
              </h1>
              <p className="text-gray-400 mt-5 text-sm leading-relaxed max-w-lg">
                Roots Classes believes every deserving student should have access to quality education — regardless of financial background. Apply for the RST and unlock your scholarship today.
              </p>
              <div className="flex flex-wrap gap-5 mt-8">
                {[
                  { val: '2,000+', lbl: 'Scholarships Awarded', col: '#FB0500' },
                  { val: '100%',   lbl: 'Max Scholarship',       col: '#0078FF' },
                  { val: 'FREE',   lbl: 'Test Registration',      col: '#08B100' },
                ].map(s => (
                  <div key={s.lbl} className="text-center">
                    <div className="text-2xl font-black" style={{ color: s.col }}>{s.val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini quick-apply card on hero */}
            <div className="lg:w-72 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Quick Apply</p>
              <p className="text-white font-semibold text-base mb-4">Select your program to get started</p>
              <div className="space-y-2">
                {['Foundation', 'Medical', 'Engineering'].map(p => (
                  <a key={p} href="#apply-form"
                    onClick={() => setFormData(prev => ({ ...prev, program: p }))}
                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      formData.program === p
                        ? 'bg-[#FB0500] text-white border-[#FB0500]'
                        : 'border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {p}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scholarship Tiers ─────────────────────────────────────────────── */}
      <div className="bg-dot-grid py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Scholarship Tiers</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What can you <span className="text-[#FB0500]">win?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((t, i) => (
              <div key={t.pct}
                className={`relative rounded-2xl overflow-hidden border flex flex-col ${
                  i === 1 ? 'bg-[#0a0a0a] border-transparent md:-mt-4 md:mb-4 shadow-xl' : `bg-white ${t.border}`
                }`}
              >
                {i === 1 && (
                  <div className="bg-[#FB0500] text-white text-center py-1.5 text-xs font-black uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="h-1" style={{ backgroundColor: t.color }} />
                <div className="p-7 flex flex-col flex-1">
                  {/* Percentage */}
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-5xl font-black leading-none" style={{ color: t.color }}>{t.pct}</span>
                    <span className={`text-sm font-semibold mb-1.5 ${i === 1 ? 'text-gray-400' : 'text-gray-400'}`}>off</span>
                  </div>
                  <div className="mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ backgroundColor: t.color + '15', color: t.color }}>
                      {t.label}
                    </span>
                  </div>
                  <p className={`text-sm mt-3 mb-5 leading-relaxed ${i === 1 ? 'text-gray-400' : 'text-gray-500'}`}>{t.desc}</p>

                  <ul className="space-y-2.5 flex-1">
                    {t.perks.map(perk => (
                      <li key={perk} className="flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.color + '20' }}>
                          <svg className="w-2.5 h-2.5" fill="none" stroke={t.color} viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className={`text-sm ${i === 1 ? 'text-gray-300' : 'text-gray-600'}`}>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <a href="#apply-form">
                    <button className="mt-7 w-full py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                      style={{ backgroundColor: t.color }}
                      onClick={() => {}}>
                      Apply for {t.pct} →
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it Works ─────────────────────────────────────────────────── */}
      <div className="bg-line-grid py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4">
              <p className="text-xs font-bold text-[#FB0500] uppercase tracking-widest mb-3">Process</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                How to apply in
                <span className="block text-[#FB0500] mt-1">4 simple steps</span>
              </h2>
              <p className="text-sm text-gray-400 mt-5 leading-relaxed">
                The entire process takes less than 10 minutes. No paperwork — everything is online.
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {steps.map((s) => (
                <div key={s.num} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ backgroundColor: s.accent }}>
                      {s.num}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base">{s.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Eligibility ───────────────────────────────────────────────────── */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Eligibility</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Who can <span className="text-[#FB0500]">apply?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibility.map((e, i) => (
              <div key={i}
                className={`rounded-2xl p-5 flex items-start gap-4 border transition-all hover:shadow-sm ${
                  i % 4 === 1 ? 'bg-[#0a0a0a] border-transparent' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{e.icon}</span>
                <p className={`text-sm leading-relaxed ${i % 4 === 1 ? 'text-gray-300' : 'text-gray-600'}`}>{e.text}</p>
              </div>
            ))}
          </div>

          {/* Important note */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
            <span className="text-xl flex-shrink-0">ℹ️</span>
            <p className="text-sm text-blue-700 leading-relaxed">
              <strong>Note:</strong> The Roots Scholarship Test (RST) is conducted online and at our Ludhiana centre. Registration is completely free. Scholarship is applied directly on the admission fee — no reimbursement process.
            </p>
          </div>
        </div>
      </div>

      {/* ── Application Form ─────────────────────────────────────────────── */}
      <div id="apply-form" className="bg-dot-grid py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left info */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <p className="text-xs font-bold text-[#FB0500] uppercase tracking-widest mb-3">Apply Now</p>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                Start your<br />
                <span className="text-[#FB0500]">scholarship</span><br />journey
              </h2>
              <p className="text-sm text-gray-400 mt-5 leading-relaxed">
                Fill the form — our team will contact you within 24 hours with test details and your admit card.
              </p>

              {/* Timeline */}
              <div className="mt-8 space-y-0">
                {[
                  { label: 'Application', date: 'Open Now',       col: '#FB0500' },
                  { label: 'RST Exam',    date: 'Every Saturday', col: '#0078FF' },
                  { label: 'Results',     date: 'Within 3 days',  col: '#08B100' },
                  { label: 'Enrollment',  date: 'Anytime after',  col: '#FB0500' },
                ].map((t, i, arr) => (
                  <div key={t.label} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: t.col }} />
                      {i < arr.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1 h-8" />}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

                {/* Form header */}
                <div className="bg-[#0a0a0a] px-8 py-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#FB0500]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative">
                    <p className="text-xs font-bold text-[#FB0500] uppercase tracking-widest mb-1">RST Application</p>
                    <h3 className="text-xl font-bold text-white">Roots Scholarship Test</h3>
                    <p className="text-gray-400 text-xs mt-1">Free registration · Takes 3 minutes</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                  {/* Program selection */}
                  <div>
                    <label className={labelCls}>Select Program <span className="text-[#FB0500]">*</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Foundation', 'Medical', 'Engineering'].map(p => (
                        <button key={p} type="button"
                          onClick={() => setFormData(prev => ({ ...prev, program: p }))}
                          className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                            formData.program === p
                              ? 'bg-[#FB0500] text-white border-[#FB0500] shadow-sm shadow-red-100'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[#FB0500]/40'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Class + Looking For */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Your Class <span className="text-[#FB0500]">*</span></label>
                      <select name="studentClass" value={formData.studentClass} onChange={handleChange} required className={selectCls}>
                        <option value="">Select class</option>
                        <option value="class-10">Class 10</option>
                        <option value="class-11">Class 11</option>
                        <option value="class-12">Class 12</option>
                        <option value="graduate">Graduate</option>
                        <option value="postgraduate">Postgraduate</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Looking For <span className="text-[#FB0500]">*</span></label>
                      <select name="lookingForCategory" value={formData.lookingForCategory} onChange={handleChange} required className={selectCls}>
                        <option value="">Select option</option>
                        <option value="scholarship">Scholarship Programs</option>
                        <option value="admission">Admission Guidance</option>
                        <option value="counseling">Career Counseling</option>
                        <option value="exam-prep">Exam Preparation</option>
                      </select>
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Email ID <span className="text-[#FB0500]">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="your@email.com" required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number <span className="text-[#FB0500]">*</span></label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        placeholder="10-digit mobile" maxLength={10} required className={inputCls} />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 py-2">
                    <input type="checkbox" id="sch-terms" required className="mt-0.5 w-4 h-4 accent-[#FB0500]" />
                    <label htmlFor="sch-terms" className="text-xs text-gray-500 leading-relaxed">
                      I agree to receive test information and scholarship updates via WhatsApp/Email. I accept Roots Classes'{' '}
                      <a href="/termsandconditions" className="text-[#FB0500] hover:underline">Terms & Conditions</a>.
                    </label>
                  </div>

                  {/* Submit */}
                  <button type="submit"
                    className="w-full py-4 bg-[#FB0500] text-white font-black rounded-xl text-base hover:opacity-90 transition flex items-center justify-center gap-2">
                    Apply for Scholarship — It's Free
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>

                  <p className="text-center text-xs text-gray-400">🔒 Your information is safe and will never be shared.</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0078FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Still Have Questions?</p>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Talk to our scholarship counselor — <span className="text-[#FB0500]">it's free</span>
          </h3>
          <p className="text-gray-400 text-sm mb-7">Call, WhatsApp, or visit us at Ludhiana. We'll help you find the best scholarship option.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+919877515330"
              className="px-6 py-3 bg-[#FB0500] text-white font-bold rounded-xl text-sm hover:opacity-90 transition">
              📞 Call Now: +91 98775-15330
            </a>
            <a href="https://wa.me/919877515330" target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition border border-white/10">
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ScholarshipForm;
