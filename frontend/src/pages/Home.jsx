import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CompanionCard from '../components/CompanionCard';

const ACTIVITIES = [
  // Outdoor & Nature
  { name: 'Shopping', emoji: '🛍️', desc: 'Boutiques, malls & retail therapy', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
  { name: 'Outdoor & City Tours', emoji: '🌳', desc: 'Parks, sights and hidden gems', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { name: 'Picnic', emoji: '🧺', desc: 'Chill in the park with good company', color: 'bg-lime-50 border-lime-200 hover:bg-lime-100' },
  { name: 'Hiking & Nature Walks', emoji: '🥾', desc: 'Trails, forests and fresh air', color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
  { name: 'Beach Day', emoji: '🏖️', desc: 'Sun, waves and sandy adventures', color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100' },
  { name: 'Camping', emoji: '🏕️', desc: 'Campfire nights under the stars', color: 'bg-teal-50 border-teal-200 hover:bg-teal-100' },
  { name: 'Cycling', emoji: '🚴', desc: 'Bike rides through the city or trails', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { name: 'Stargazing', emoji: '🔭', desc: 'Quiet nights watching the universe', color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
  { name: 'Morning Walk', emoji: '🌅', desc: 'Start the day with peaceful strolls', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
  { name: 'Gardening', emoji: '🌱', desc: 'Grow plants and enjoy nature together', color: 'bg-lime-50 border-lime-200 hover:bg-lime-100' },
  // Entertainment & Games
  { name: 'Movies & Entertainment', emoji: '🎬', desc: 'Films, shows and live entertainment', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { name: 'Arcade Gaming', emoji: '🕹️', desc: 'Games, prizes and friendly competition', color: 'bg-violet-50 border-violet-200 hover:bg-violet-100' },
  { name: 'Binge Watching', emoji: '📺', desc: 'Cozy series marathons at home', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { name: 'Board Games & Puzzles', emoji: '🎲', desc: 'Strategy, luck and lots of laughs', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { name: 'Karaoke', emoji: '🎤', desc: 'Sing your heart out together', color: 'bg-rose-50 border-rose-200 hover:bg-rose-100' },
  { name: 'Dancing', emoji: '💃', desc: 'Dance classes or a night out dancing', color: 'bg-fuchsia-50 border-fuchsia-200 hover:bg-fuchsia-100' },
  { name: 'Escape Rooms', emoji: '🔐', desc: 'Solve puzzles and escape together', color: 'bg-red-50 border-red-200 hover:bg-red-100' },
  { name: 'Concerts & Live Music', emoji: '🎵', desc: 'Share the magic of live performances', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
  { name: 'Comedy Shows', emoji: '🎭', desc: 'Laugh the night away at live comedy', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { name: 'Painting & Art', emoji: '🎨', desc: 'Create art and express yourself', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
  // Food & Drinks
  { name: 'Dining & Cafes', emoji: '☕', desc: 'Great food and warm conversation', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { name: 'Cooking Together', emoji: '🍳', desc: 'Whip up meals and learn new recipes', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { name: 'Brunch Date', emoji: '🥞', desc: 'Lazy mornings with good food', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { name: 'Food Tour', emoji: '🍜', desc: 'Explore local cuisines and hidden gems', color: 'bg-red-50 border-red-200 hover:bg-red-100' },
  { name: 'Dessert & Cafe Hopping', emoji: '🍰', desc: 'Sweet spots and coffee crawls', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
  { name: 'Bar & Nightlife', emoji: '🍻', desc: 'Cocktails, dancing and a great night out', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  // Wellness & Self-care
  { name: 'Emotional Support', emoji: '💙', desc: 'A caring presence when you need it most', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { name: 'Cuddling & Comfort', emoji: '🤗', desc: 'Warm, cozy and comforting companionship', color: 'bg-rose-50 border-rose-200 hover:bg-rose-100' },
  { name: 'Yoga & Meditation', emoji: '🧘', desc: 'Find peace and balance together', color: 'bg-teal-50 border-teal-200 hover:bg-teal-100' },
  { name: 'Gym & Workout', emoji: '💪', desc: 'Workout partner for motivation', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
  { name: 'Spa Day', emoji: '💆', desc: 'Relax and recharge with company', color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' },
  // Shopping & Errands
  { name: 'Thrift Shopping', emoji: '👗', desc: 'Hunt for vintage finds together', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
  { name: 'Grocery Shopping', emoji: '🛒', desc: 'Make errands fun with company', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  // Social & Cultural
  { name: 'Museum & Art Gallery', emoji: '🖼️', desc: 'Explore culture and history together', color: 'bg-stone-50 border-stone-200 hover:bg-stone-100' },
  { name: 'Book Club & Reading', emoji: '📚', desc: 'Share stories and discuss books', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { name: 'Sports Watching', emoji: '🏟️', desc: 'Cheer for your team side by side', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { name: 'Photography Walk', emoji: '📷', desc: 'Capture beautiful moments together', color: 'bg-gray-50 border-gray-200 hover:bg-gray-100' },
  { name: 'Volunteering Together', emoji: '🤝', desc: 'Give back and make a difference', color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100' },
  { name: 'DIY Projects', emoji: '🔨', desc: 'Build, fix and create together', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
];

const STEPS = [
  { step: '1', title: 'Browse Companions', desc: 'Explore profiles and find your perfect match based on activities, city, and budget.', emoji: '🔍' },
  { step: '2', title: 'Book a Session', desc: 'Choose your activity, pick a date and time, and confirm your booking instantly.', emoji: '📅' },
  { step: '3', title: 'Enjoy Your Day', desc: 'Meet your companion and create wonderful memories together!', emoji: '✨' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    axios.get('/api/companions').then((res) => {
      setFeatured(res.data.slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-500 via-rose-400 to-amber-400 text-white py-24 px-4">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="text-6xl mb-6">💛</div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Find Your Perfect<br />
            <span className="text-amber-200">Companion</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-rose-100 max-w-2xl mx-auto">
            Hire a caring, fun companion for shopping, dining, movies, city tours, or emotional support. Make every day memorable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/companions" className="bg-white text-rose-600 hover:bg-rose-50 font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-lg">
              Find a Companion
            </Link>
            <Link to="/register" className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-lg">
              Become a Companion
            </Link>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Would You Like to Do?</h2>
          <p className="text-gray-500 text-lg">Choose an experience and find the perfect companion for it.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ACTIVITIES.map((act) => (
            <Link
              key={act.name}
              to={`/companions?activity=${encodeURIComponent(act.name)}`}
              className={`${act.color} border-2 rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1`}
            >
              <div className="text-4xl mb-3">{act.emoji}</div>
              <h3 className="font-bold text-gray-800 mb-1">{act.name}</h3>
              <p className="text-sm text-gray-500">{act.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">Three simple steps to your perfect day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="text-center relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-rose-200 z-0" style={{ width: 'calc(100% - 4rem)', left: 'calc(50% + 2rem)' }}></div>
                )}
                <div className="relative z-10 w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  {s.emoji}
                </div>
                <div className="w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {s.step}
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">{s.title}</h3>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companions */}
      {featured.length > 0 && (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Featured Companions</h2>
            <p className="text-gray-500 text-lg">Meet some of our top-rated companions.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c) => <CompanionCard key={c.id} companion={c} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/companions" className="btn-primary py-3 px-8 text-lg">
              View All Companions
            </Link>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-amber-400 to-rose-500 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Memory?</h2>
          <p className="text-xl mb-8 text-rose-100">Join thousands of people who have already found their perfect companion.</p>
          <Link to="/register" className="bg-white text-rose-600 hover:bg-rose-50 font-bold py-3 px-8 rounded-xl text-lg transition-colors shadow-lg inline-block">
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">💛</span>
          <span className="text-white font-bold">A Day to Remember</span>
        </div>
        <p className="text-sm">Making every day memorable, one companion at a time.</p>
      </footer>
    </div>
  );
}
