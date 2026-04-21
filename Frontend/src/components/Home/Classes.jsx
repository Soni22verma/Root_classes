import React from 'react';
import { Link } from 'react-router-dom';

const programs = [
  {
    num: '01', tag: 'Class 8–10', title: 'Foundation',
    desc: 'Build strong fundamentals. Integrated prep for boards with NEET & JEE introduction.',
    courses: [
      '1-year integrated with class 10th for Board | NEET | JEE',
      '2-year integrated with class 10th for Board | NEET | JEE',
    ],
    dark: false, accent: '#FB0500',
  },
  {
    num: '02', tag: 'NEET', title: 'Medical',
    desc: 'Crack NEET with structured programs led by experienced medical faculty.',
    courses: [
      '1-year integrated program class 12th',
      '2-year integrated classroom 11th & 12th',
      '1-year dropper course for NEET',
    ],
    dark: true, accent: '#0078FF',
  },
  {
    num: '03', tag: 'IIT-JEE', title: 'Engineering',
    desc: 'Master PCM with JEE-focused curriculum and intensive test series.',
    courses: [
      '1-year integrated program class 12th',
      '2-year integrated classroom 11th & 12th',
      '1-year dropper course for IIT-JEE',
    ],
    dark: false, accent: '#FB0500',
  },
];

const ProgramPage = () => (
  <div className="bg-dot-grid py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <p className="text-xs font-bold text-[#0078FF] uppercase tracking-widest mb-3">Our Programs</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Choose your stream</h2>
        </div>
        <Link to="/course" className="text-sm font-semibold text-gray-900 border-b-2 border-gray-200 hover:border-[#FB0500] hover:text-[#FB0500] transition-colors pb-0.5 self-end">
          View all courses →
        </Link>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Card 01 — wide light */}
        <div className="md:col-span-5 bg-white rounded-2xl p-7 flex flex-col justify-between border border-gray-200 hover:border-[#FB0500]/40 hover:shadow-md transition-all group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-50 text-[#FB0500]">{programs[0].tag}</span>
              <span className="text-6xl font-black text-gray-100 group-hover:text-[#FB0500]/10 transition-colors leading-none">{programs[0].num}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{programs[0].title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">{programs[0].desc}</p>
            <ul className="space-y-2.5">
              {programs[0].courses.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-2 w-1 h-1 rounded-full bg-[#FB0500] flex-shrink-0" />
                  <span className="text-sm text-gray-500">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link to="/course">
            <button className="mt-7 w-full py-2.5 rounded-xl text-sm font-semibold bg-[#FB0500] text-white hover:opacity-90 transition">
              Explore Foundation →
            </button>
          </Link>
        </div>

        {/* Right column */}
        <div className="md:col-span-7 grid grid-rows-2 gap-4">

          {/* Card 02 — light (Medical) */}
          <div className="bg-white rounded-2xl p-7 flex flex-col justify-between group border border-gray-100 hover:border-[#0078FF]/40 hover:shadow-md transition-all relative overflow-hidden">
            {/* Blue glow accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0078FF]/5 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-50 text-[#0078FF]">{programs[1].tag}</span>
                <span className="text-6xl font-black text-gray-100 group-hover:text-[#0078FF]/10 transition-colors leading-none">{programs[1].num}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{programs[1].title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{programs[1].desc}</p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2 flex-wrap">
                {programs[1].courses.map((_, i) => (
                  <span key={i} className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Option {i + 1}</span>
                ))}
              </div>
              <Link to="/course">
                <button className="flex-shrink-0 ml-3 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0078FF] text-white hover:bg-[#0066DD] transition shadow-sm shadow-blue-50">
                  Enroll →
                </button>
              </Link>
            </div>
          </div>

          {/* Card 03 — light */}
          <div className="bg-white rounded-2xl p-7 flex flex-col justify-between border border-gray-200 hover:border-[#FB0500]/40 hover:shadow-md transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-50 text-[#FB0500]">{programs[2].tag}</span>
                <span className="text-6xl font-black text-gray-100 group-hover:text-[#FB0500]/10 transition-colors leading-none">{programs[2].num}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{programs[2].title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{programs[2].desc}</p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="text-xs text-gray-400">{programs[2].courses.length} course options</span>
              <Link to="/course">
                <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#4A5565] text-white hover:bg-[#FB0500] transition-colors">
                  Start Learning →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '🎓', label: 'Expert Faculty', color: 'border-red-100' },
          { icon: '📡', label: 'Live Classes', color: 'border-blue-100' },
          { icon: '📝', label: 'Test Series', color: 'border-red-100' },
          { icon: '💬', label: '24/7 Support', color: 'border-blue-100' },
        ].map((f) => (
          <div key={f.label} className={`bg-white rounded-xl px-5 py-3.5 flex items-center gap-3 border ${f.color}`}>
            <span>{f.icon}</span>
            <span className="text-sm font-medium text-gray-700">{f.label}</span>
          </div>
        ))}
      </div>

    </div>
  </div>
);

export default ProgramPage;
