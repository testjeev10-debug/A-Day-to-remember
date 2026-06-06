import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CompanionCard from '../components/CompanionCard';

const ACTIVITY_CATEGORIES = [
  {
    label: '🌿 Outdoor & Nature',
    gradient: 'from-emerald-600/30 to-teal-600/20',
    border: 'border-emerald-500/30',
    glow: 'hover:shadow-emerald-500/20',
    items: [
      { name: 'Picnic', emoji: '🧺' },
      { name: 'Hiking & Nature Walks', emoji: '🥾' },
      { name: 'Beach Day', emoji: '🏖️' },
      { name: 'Camping', emoji: '🏕️' },
      { name: 'Cycling', emoji: '🚴' },
      { name: 'Stargazing', emoji: '🔭' },
      { name: 'Morning Walk', emoji: '🌅' },
      { name: 'Gardening', emoji: '🌱' },
      { name: 'Outdoor & City Tours', emoji: '🌳' },
    ],
  },
  {
    label: '🎮 Entertainment',
    gradient: 'from-violet-600/30 to-purple-600/20',
    border: 'border-violet-500/30',
    glow: 'hover:shadow-violet-500/20',
    items: [
      { name: 'Movies & Entertainment', emoji: '🎬' },
      { name: 'Arcade Gaming', emoji: '🕹️' },
      { name: 'Binge Watching', emoji: '📺' },
      { name: 'Board Games & Puzzles', emoji: '🎲' },
      { name: 'Karaoke', emoji: '🎤' },
      { name: 'Dancing', emoji: '💃' },
      { name: 'Escape Rooms', emoji: '🔐' },
      { name: 'Concerts & Live Music', emoji: '🎵' },
      { name: 'Comedy Shows', emoji: '🎭' },
      { name: 'Painting & Art', emoji: '🎨' },
    ],
  },
  {
    label: '🍜 Food & Drinks',
    gradient: 'from-amber-600/30 to-orange-600/20',
    border: 'border-amber-500/30',
    glow: 'hover:shadow-amber-500/20',
    items: [
      { name: 'Dining & Cafes', emoji: '☕' },
      { name: 'Cooking Together', emoji: '🍳' },
      { name: 'Brunch Date', emoji: '🥞' },
      { name: 'Food Tour', emoji: '🍜' },
      { name: 'Dessert & Cafe Hopping', emoji: '🍰' },
      { name: 'Bar & Nightlife', emoji: '🍻' },
    ],
  },
  {
    label: '💆 Wellness',
    gradient: 'from-pink-600/30 to-rose-600/20',
    border: 'border-pink-500/30',
    glow: 'hover:shadow-pink-500/20',
    items: [
      { name: 'Emotional Support', emoji: '💙' },
      { name: 'Cuddling & Comfort', emoji: '🤗' },
      { name: 'Yoga & Meditation', emoji: '🧘' },
      { name: 'Gym & Workout', emoji: '💪' },
      { name: 'Spa Day', emoji: '💆' },
    ],
  },
  {
    label: '🛒 Shopping',
    gradient: 'from-fuchsia-600/30 to-pink-600/20',
    border: 'border-fuchsia-500/30',
    glow: 'hover:shadow-fuchsia-500/20',
    items: [
      { name: 'Shopping', emoji: '🛍️' },
      { name: 'Thrift Shopping', emoji: '👗' },
      { name: 'Grocery Shopping', emoji: '🛒' },
    ],
  },
  {
    label: '🖼️ Social & Cultural',
    gradient: 'from-cyan-600/30 to-blue-600/20',
    border: 'border-cyan-500/30',
    glow: 'hover:shadow-cyan-500/20',
    items: [
      { name: 'Museum & Art Gallery', emoji: '🖼️' },
      { name: 'Book Club & Reading', emoji: '📚' },
      { name: 'Sports Watching', emoji: '🏟️' },
      { name: 'Photography Walk', emoji: '📷' },
      { name: 'Volunteering Together', emoji: '🤝' },
      { name: 'DIY Projects', emoji: '🔨' },
    ],
  },
];

const STATS = [
  { value: '2,400+', label: 'Happy Clients', emoji: '😊' },
  { value: '340+', label: 'Companions', emoji: '🤝' },
  { value: '40+', label: 'Activities', emoji: '🎯' },
  { value: '4.9★', label: 'Avg Rating', emoji: '⭐' },
];

const STEPS = [
  { step: '01', title: 'Browse', desc: 'Explore companion profiles filtered by activity, city, and budget.', emoji: '🔍', color: 'from-violet-600 to-purple-600' },
  { step: '02', title: 'Book', desc: 'Pick your activity, date, and duration. Instant confirmation.', emoji: '📅', color: 'from-fuchsia-600 to-pink-600' },
  { step: '03', title: 'Enjoy', desc: 'Meet your companion and make a memory that lasts forever.', emoji: '✨', color: 'from-amber-500 to-orange-500' },
];

const FLOATERS = ['🛍️','🎬','☕','🌳','💙','🎤','💃','🧺','🥾','🎨','🎵','🏖️','🍜','🧘','📷'];

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    const step = num / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [start]);
  return count;
}

function StatsSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {STATS.map((s) => (
        <div key={s.label} className="text-center glass rounded-2xl p-6 border border-white/10">
          <div className="text-3xl mb-1">{s.emoji}</div>
          <div className="text-3xl font-extrabold text-gradient mb-1">{s.value}</div>
          <div className="text-gray-400 text-sm font-medium">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    axios.get('/api/companions').then((res) => setFeatured(res.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="bg-mesh min-h-screen">

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl animate-float-slow pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl animate-float-slow delay-1000 pointer-events-none" />
        <div className="absolute top-40 right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-float-slow delay-500 pointer-events-none" />

        {/* Floating emojis */}
        {FLOATERS.map((emoji, i) => (
          <div
            key={i}
            className="absolute text-2xl select-none pointer-events-none opacity-20 animate-float"
            style={{
              left: `${5 + (i * 6.2) % 90}%`,
              top: `${10 + (i * 13) % 75}%`,
              animationDelay: `${(i * 0.4) % 6}s`,
              animationDuration: `${5 + (i % 4)}s`,
              fontSize: `${1.2 + (i % 3) * 0.4}rem`,
            }}
          >
            {emoji}
          </div>
        ))}

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 text-sm font-semibold text-violet-300 backdrop-blur-sm animate-fade-up">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            340+ companions ready to join you today
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight animate-fade-up delay-100">
            <span className="text-white">Never Do</span><br />
            <span className="shimmer-text">Anything Alone</span><br />
            <span className="text-white">Again.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
            Hire a caring companion for shopping, movies, dining, city tours,
            emotional support — and <strong className="text-gray-200">40+ more activities</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300">
            <Link
              to="/companions"
              className="btn-primary py-4 px-10 text-lg rounded-2xl shadow-2xl shadow-violet-500/30 animate-pulse-glow"
            >
              🔍 Find a Companion
            </Link>
            <Link
              to="/register"
              className="bg-white/8 hover:bg-white/12 backdrop-blur-sm border border-white/15 text-white font-bold py-4 px-10 rounded-2xl text-lg transition-all duration-300 hover:border-white/30"
            >
              💼 Become a Companion
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500 animate-fade-up delay-500">
            {['✅ Verified companions', '🔒 Safe & trusted', '⚡ Instant booking', '💬 24/7 support'].map((b) => (
              <span key={b} className="flex items-center gap-1.5">{b}</span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-4">
        <StatsSection />
      </section>

      {/* ── ACTIVITIES ── */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="section-title">What Would You Like to Do?</h2>
          <p className="section-sub">40+ activities across 6 categories. Every moment covered.</p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {ACTIVITY_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 ${
                activeCategory === i
                  ? `bg-gradient-to-r ${cat.gradient} border-white/20 text-white`
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Activity grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {ACTIVITY_CATEGORIES[activeCategory].items.map((act) => (
            <Link
              key={act.name}
              to={`/companions?activity=${encodeURIComponent(act.name)}`}
              className={`group relative bg-gradient-to-br ${ACTIVITY_CATEGORIES[activeCategory].gradient}
                border ${ACTIVITY_CATEGORIES[activeCategory].border} rounded-2xl p-5 text-center
                transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                ${ACTIVITY_CATEGORIES[activeCategory].glow} card-lift`}
            >
              <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-125">
                {act.emoji}
              </div>
              <p className="text-sm font-bold text-white leading-tight">{act.name}</p>
              <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/companions" className="text-violet-400 hover:text-violet-300 font-semibold text-sm transition-colors">
            Browse all companions →
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">Three steps to your perfect day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className="relative glass rounded-2xl p-8 border border-white/10 text-center group hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {s.emoji}
                </div>
                <div className={`text-xs font-black tracking-widest bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-2`}>
                  STEP {s.step}
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-600 text-2xl z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COMPANIONS ── */}
      {featured.length > 0 && (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Meet Our Top Companions</h2>
            <p className="section-sub">Verified, highly rated, and ready to make your day special.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c) => <CompanionCard key={c.id} companion={c} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/companions" className="btn-primary py-3.5 px-10 text-base">
              View All 7 Companions ✨
            </Link>
          </div>
        </section>
      )}

      {/* ── TESTIMONIAL BANNER ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/60 to-fuchsia-900/60 border border-violet-500/30 p-12 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="text-5xl mb-6">💬</div>
              <blockquote className="text-2xl font-bold text-white mb-6 leading-relaxed">
                "I was nervous going alone to my first concert. My companion Lily made it the most magical night of my life. I can't imagine the evening without her!"
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <img
                  src="https://randomuser.me/api/portraits/women/33.jpg"
                  alt="Sarah"
                  className="w-12 h-12 rounded-full border-2 border-violet-400"
                />
                <div className="text-left">
                  <p className="font-bold text-white">Sarah M.</p>
                  <p className="text-violet-300 text-sm">Booked: Concerts & Live Music</p>
                </div>
                <div className="ml-4 flex text-amber-400 text-lg">★★★★★</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to Make a<br />
            <span className="text-gradient-gold">Memory? 🌟</span>
          </h2>
          <p className="text-gray-400 text-xl mb-10">
            Join thousands of people who have already found their perfect companion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary py-4 px-10 text-lg rounded-2xl">
              Sign Up — It's Free
            </Link>
            <Link to="/companions" className="bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white font-bold py-4 px-10 rounded-2xl text-lg transition-all duration-300">
              Browse Companions
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">
              💛
            </div>
            <span className="font-bold text-white">A Day to Remember</span>
          </div>
          <p className="text-gray-600 text-sm">Making every day memorable, one companion at a time.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link to="/companions" className="hover:text-gray-400 transition-colors">Find Companions</Link>
            <Link to="/register" className="hover:text-gray-400 transition-colors">Become a Companion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
