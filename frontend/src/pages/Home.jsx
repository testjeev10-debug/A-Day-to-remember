import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CompanionCard from '../components/CompanionCard';

const ACTIVITY_CATEGORIES = [
  {
    label: '🌿 Outdoor & Nature',
    tabLabel: '🌿 Outdoor',
    gradientBar: 'from-emerald-400 to-teal-400',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
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
    tabLabel: '🎮 Entertainment',
    gradientBar: 'from-violet-400 to-purple-400',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-700',
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
    tabLabel: '🍜 Food',
    gradientBar: 'from-amber-400 to-orange-400',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-700',
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
    tabLabel: '💆 Wellness',
    gradientBar: 'from-pink-400 to-rose-400',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-700',
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
    tabLabel: '🛍️ Shopping',
    gradientBar: 'from-fuchsia-400 to-pink-400',
    bgLight: 'bg-fuchsia-50',
    textColor: 'text-fuchsia-700',
    items: [
      { name: 'Shopping', emoji: '🛍️' },
      { name: 'Thrift Shopping', emoji: '👗' },
      { name: 'Grocery Shopping', emoji: '🛒' },
    ],
  },
  {
    label: '🖼️ Social & Cultural',
    tabLabel: '🖼️ Cultural',
    gradientBar: 'from-cyan-400 to-blue-400',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-700',
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
  { value: '2,400+', label: 'Happy Clients', emoji: '😊', color: 'text-violet-600', bg: 'bg-violet-50' },
  { value: '340+', label: 'Companions', emoji: '🤝', color: 'text-pink-600', bg: 'bg-pink-50' },
  { value: '40+', label: 'Activities', emoji: '🎯', color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: '4.9★', label: 'Avg Rating', emoji: '⭐', color: 'text-orange-600', bg: 'bg-orange-50' },
];

const STEPS = [
  { step: '01', title: 'Browse', desc: 'Explore companion profiles filtered by activity, city, and budget.', emoji: '🔍', color: 'from-violet-600 to-purple-600', shadow: 'shadow-violet-200' },
  { step: '02', title: 'Book', desc: 'Pick your activity, date, and duration. Instant confirmation.', emoji: '📅', color: 'from-fuchsia-500 to-pink-500', shadow: 'shadow-pink-200' },
  { step: '03', title: 'Enjoy', desc: 'Meet your companion and make a memory that lasts forever.', emoji: '✨', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200' },
];

const HERO_PHOTOS = [
  { src: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Priya', rating: '4.9', act: 'Hiking' },
  { src: 'https://randomuser.me/api/portraits/men/32.jpg', name: 'James', rating: '5.0', act: 'Gaming' },
  { src: 'https://randomuser.me/api/portraits/women/65.jpg', name: 'Aisha', rating: '4.8', act: 'Wellness' },
  { src: 'https://randomuser.me/api/portraits/women/17.jpg', name: 'Sofia', rating: '4.9', act: 'Shopping' },
];

const ACTIVITY_PILLS = ['🧺 Picnic','🎬 Movies','☕ Cafes','🥾 Hiking','💃 Dancing','🎤 Karaoke','🏖️ Beach Day','🍜 Food Tour','🎨 Art','🧘 Yoga','📷 Photography','🛍️ Shopping','🎵 Concerts','💪 Gym','🔭 Stargazing'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    axios.get('/api/companions').then((res) => setFeatured(res.data.slice(0, 3))).catch(() => {});
  }, []);

  const cat = ACTIVITY_CATEGORIES[activeCategory];

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-pink-50 pt-16 pb-20 px-4">
        {/* Blob decorations */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left — Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-violet-100 rounded-full px-5 py-2 mb-7 text-sm font-semibold text-violet-700 animate-fade-up">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                340+ companions ready for you today
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight animate-fade-up delay-100">
                Your Perfect<br />
                <span className="shimmer-text">Companion</span><br />
                <span className="text-gray-900">Awaits 💛</span>
              </h1>

              <p className="text-xl text-gray-500 mb-9 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-up delay-200">
                Hire a caring companion for shopping, movies, dining, city tours,
                emotional support — and <strong className="text-gray-700">40+ more activities</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up delay-300">
                <Link
                  to="/companions"
                  className="btn-primary py-4 px-9 text-lg rounded-2xl animate-pulse-glow"
                >
                  🔍 Find a Companion
                </Link>
                <Link
                  to="/register"
                  className="btn-outline py-4 px-9 text-lg"
                >
                  💼 Become a Companion
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mt-9 text-sm text-gray-400 animate-fade-up delay-500">
                {['✅ Verified companions', '🔒 Safe & trusted', '⚡ Instant booking'].map((b) => (
                  <span key={b} className="flex items-center gap-1.5 font-medium">{b}</span>
                ))}
              </div>
            </div>

            {/* Right — Photo collage */}
            <div className="flex-1 relative w-full max-w-md mx-auto lg:mx-0">
              <div className="grid grid-cols-2 gap-4 relative">
                {HERO_PHOTOS.map((p, i) => (
                  <div
                    key={p.name}
                    className={`relative rounded-2xl overflow-hidden shadow-xl group card-lift ${i === 1 ? 'mt-8' : ''} ${i === 3 ? '-mt-4' : ''}`}
                  >
                    <img
                      src={p.src}
                      alt={p.name}
                      className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold text-sm">{p.name}</p>
                          <p className="text-white/70 text-xs">{p.act}</p>
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                          <span className="text-amber-400 text-xs">★</span>
                          <span className="text-gray-800 text-xs font-bold">{p.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-float">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-lg">🤝</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">New booking</p>
                  <p className="text-sm font-bold text-gray-900">Priya just booked!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity pill scroll */}
          <div className="mt-14 overflow-hidden">
            <div className="flex gap-3 animate-none flex-wrap justify-center">
              {ACTIVITY_PILLS.map((pill) => (
                <Link
                  key={pill}
                  to={`/companions?activity=${encodeURIComponent(pill.split(' ').slice(1).join(' '))}`}
                  className="flex-shrink-0 bg-white border border-gray-200 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 text-gray-600 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 shadow-sm"
                >
                  {pill}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 px-4 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center group">
              <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {s.emoji}
              </div>
              <div className={`text-3xl font-extrabold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-gray-500 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ACTIVITIES ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">What Would You Like to Do?</h2>
            <p className="section-sub">40+ activities across 6 categories. Every moment covered.</p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {ACTIVITY_CATEGORIES.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all duration-200 ${
                  activeCategory === i
                    ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white border-transparent shadow-md shadow-violet-200'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-violet-700 hover:border-violet-300 hover:bg-violet-50'
                }`}
              >
                {c.tabLabel}
              </button>
            ))}
          </div>

          {/* Activity grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cat.items.map((act) => (
              <Link
                key={act.name}
                to={`/companions?activity=${encodeURIComponent(act.name)}`}
                className={`group bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-violet-200 hover:shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`h-1.5 bg-gradient-to-r ${cat.gradientBar}`} />
                <div className="p-5 text-center">
                  <div className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-125">
                    {act.emoji}
                  </div>
                  <p className={`text-sm font-bold ${cat.textColor} leading-tight`}>{act.name}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/companions" className="text-violet-600 hover:text-violet-700 font-semibold text-sm transition-colors hover:underline">
              Browse all companions →
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">Three easy steps to your perfect day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-md text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mx-auto mb-5 shadow-lg ${s.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  {s.emoji}
                </div>
                <div className={`text-xs font-black tracking-widest bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-2`}>
                  STEP {s.step}
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-300 text-2xl z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COMPANIONS ── */}
      {featured.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="section-title">Meet Our Top Companions</h2>
              <p className="section-sub">Verified, highly rated, and ready to make your day special.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((c) => <CompanionCard key={c.id} companion={c} />)}
            </div>
            <div className="text-center mt-10">
              <Link to="/companions" className="btn-primary py-3.5 px-10 text-base">
                View All Companions ✨
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIAL ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-pink-500 p-12 text-center shadow-2xl shadow-violet-200">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="text-5xl mb-6">💬</div>
              <blockquote className="text-2xl font-bold text-white mb-6 leading-relaxed">
                "I was nervous going alone to my first concert. My companion Lily made it the most magical night of my life. I can't imagine the evening without her!"
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <img
                  src="https://randomuser.me/api/portraits/women/33.jpg"
                  alt="Sarah"
                  className="w-12 h-12 rounded-full border-2 border-white/60 shadow"
                />
                <div className="text-left">
                  <p className="font-bold text-white">Sarah M.</p>
                  <p className="text-white/70 text-sm">Booked: Concerts & Live Music</p>
                </div>
                <div className="ml-4 flex text-amber-300 text-lg">★★★★★</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-50 to-pink-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Ready to Make a<br />
            <span className="shimmer-text">Memory? 🌟</span>
          </h2>
          <p className="text-gray-500 text-xl mb-10">
            Join thousands of people who have already found their perfect companion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary py-4 px-10 text-lg rounded-2xl">
              Sign Up — It's Free
            </Link>
            <Link to="/companions" className="btn-outline py-4 px-10 text-lg">
              Browse Companions
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-sm shadow-md shadow-violet-200">
              💛
            </div>
            <span className="font-bold text-gray-900">A Day to Remember</span>
          </div>
          <p className="text-gray-400 text-sm">Making every day memorable, one companion at a time.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/companions" className="hover:text-violet-600 transition-colors font-medium">Find Companions</Link>
            <Link to="/register" className="hover:text-violet-600 transition-colors font-medium">Become a Companion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
