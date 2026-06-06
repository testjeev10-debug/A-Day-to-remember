import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CompanionCard from '../components/CompanionCard';

const MOODS = [
  { id: 'Lonely',      emoji: '🥺', label: 'Lonely',       description: 'Could use some company',       color: 'from-blue-100 to-indigo-100',   border: 'border-blue-200',   hover: 'hover:border-blue-400' },
  { id: 'Bored',       emoji: '😴', label: 'Bored',        description: 'Need something fun to do',     color: 'from-amber-100 to-orange-100',  border: 'border-amber-200',  hover: 'hover:border-amber-400' },
  { id: 'Stressed',    emoji: '😮‍💨', label: 'Stressed',     description: 'Need to unwind and breathe',  color: 'from-green-100 to-teal-100',    border: 'border-green-200',  hover: 'hover:border-green-400' },
  { id: 'Adventurous', emoji: '🌟', label: 'Adventurous',  description: 'Ready to explore!',            color: 'from-yellow-100 to-amber-100',  border: 'border-yellow-200', hover: 'hover:border-yellow-400' },
  { id: 'Curious',     emoji: '🧐', label: 'Curious',      description: 'Want to learn something new',  color: 'from-purple-100 to-violet-100', border: 'border-purple-200', hover: 'hover:border-purple-400' },
  { id: 'Motivated',   emoji: '💪', label: 'Motivated',    description: "Let's get things done!",       color: 'from-red-100 to-pink-100',      border: 'border-red-200',    hover: 'hover:border-red-400' },
  { id: 'Celebrating', emoji: '🎉', label: 'Celebrating',  description: 'Something great happened!',    color: 'from-fuchsia-100 to-pink-100',  border: 'border-fuchsia-200',hover: 'hover:border-fuchsia-400' },
  { id: 'New in town', emoji: '🗺️', label: 'New in town',  description: 'Just arrived, need a guide',  color: 'from-cyan-100 to-sky-100',      border: 'border-cyan-200',   hover: 'hover:border-cyan-400' },
];

function AvailableNowBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
      Available Now
    </span>
  );
}

function ScenarioCard({ scenario, onSelect, selected }) {
  const availCount = scenario.availableCompanions?.length || 0;
  return (
    <button
      onClick={() => onSelect(scenario)}
      className={`group w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 bg-white shadow-sm hover:shadow-md hover:scale-[1.02] ${
        selected?.id === scenario.id
          ? 'border-violet-500 ring-2 ring-violet-200 shadow-violet-100'
          : 'border-gray-200 hover:border-violet-300'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{scenario.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-extrabold text-gray-900 text-base">{scenario.title}</span>
            {availCount > 0 && <AvailableNowBadge />}
          </div>
          <p className="text-gray-500 text-sm mb-3 leading-relaxed">{scenario.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">⏱ {scenario.duration}</span>
            <span className="text-xs bg-violet-50 text-violet-600 font-semibold px-2.5 py-0.5 rounded-full border border-violet-100">{scenario.vibe}</span>
          </div>
          {availCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {scenario.availableCompanions.slice(0, 3).map((c) => (
                  <img
                    key={c.id}
                    src={c.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}`}
                    alt={c.name}
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-green-600 font-semibold">{availCount} companion{availCount !== 1 ? 's' : ''} ready now</span>
            </div>
          )}
          {availCount === 0 && (
            <p className="mt-2 text-xs text-gray-400 italic">Browse all companions for this activity →</p>
          )}
        </div>
      </div>
    </button>
  );
}

function GroupActivityCard({ group }) {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl border border-violet-100 p-5">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{group.emoji}</div>
        <div>
          <h4 className="font-extrabold text-gray-900 text-sm mb-1">{group.title}</h4>
          <p className="text-gray-500 text-xs leading-relaxed mb-2">{group.description}</p>
          <span className="inline-flex items-center gap-1 text-xs text-violet-600 font-semibold bg-white px-2.5 py-0.5 rounded-full border border-violet-200">
            👥 {group.spots}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MoodMatcher() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Step 1: mood select | Step 2: scenario select | Step 3: companion list
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [groupActivities, setGroupActivities] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    setStep(2);
    try {
      // Log mood (non-blocking, works without auth too)
      axios.post('/api/mood', { selected_mood: mood.id }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});

      const res = await axios.get(`/api/mood/scenarios/${encodeURIComponent(mood.id)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setScenarios(res.data.scenarios || []);
      setGroupActivities(res.data.groupActivities || []);
    } catch {
      setScenarios([]);
      setGroupActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioSelect = async (scenario) => {
    setSelectedScenario(scenario);
    setLoading(true);
    setStep(3);
    try {
      const res = await axios.get('/api/mood/companions-for-activity', {
        params: { activity: scenario.activity },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCompanions(res.data || []);
    } catch {
      setCompanions([]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedMood(null);
    setSelectedScenario(null);
    setScenarios([]);
    setGroupActivities([]);
    setCompanions([]);
    setLoading(false);
  };

  const goBack = () => {
    if (step === 3) { setStep(2); setSelectedScenario(null); setCompanions([]); }
    else { reset(); }
  };

  // Step breadcrumb
  const steps = ['Choose Mood', 'Pick an Activity', 'Book a Companion'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 px-4 py-12 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl" />
        <div className="max-w-4xl mx-auto relative">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Mood-Based Matching 💭</h1>
          <p className="text-white/75 text-base">Tell us how you feel — we'll suggest the perfect activity and companion</p>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mt-6">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                  i + 1 === step ? 'bg-white text-violet-700' :
                  i + 1 < step ? 'bg-white/30 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                    i + 1 < step ? 'bg-white text-violet-600' : 'bg-current/20'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-white/20 max-w-8" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Back button */}
        {step > 1 && (
          <button onClick={goBack} className="flex items-center gap-2 text-gray-500 hover:text-violet-600 font-semibold text-sm mb-6 transition-colors">
            ← Back
          </button>
        )}

        {/* Guest banner */}
        {!user && step > 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm mb-6 flex items-center justify-between flex-wrap gap-2">
            <span>💡 Sign in to save your mood history and get personalised recommendations</span>
            <Link to="/login" className="text-amber-700 font-bold underline text-xs">Sign in →</Link>
          </div>
        )}

        {/* STEP 1 — Mood selection */}
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">How are you feeling today?</h2>
              <p className="text-gray-500">Pick a mood and we'll find the perfect way to spend your time</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood)}
                  className={`bg-gradient-to-br ${mood.color} rounded-2xl border-2 ${mood.border} ${mood.hover} p-5 text-center hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer`}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <div className="font-extrabold text-gray-800 text-sm mb-1">{mood.label}</div>
                  <div className="text-xs text-gray-500 leading-snug">{mood.description}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 — Scenario selection */}
        {step === 2 && (
          <>
            <div className="mb-7">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{selectedMood?.emoji}</span>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">You're feeling <span className="text-gradient">{selectedMood?.label}</span></h2>
                  <p className="text-gray-500 text-sm">Pick an activity that sounds right for you</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-5 animate-pulse h-28" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-10">
                  {scenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onSelect={handleScenarioSelect}
                      selected={selectedScenario}
                    />
                  ))}
                </div>

                {/* Group activities */}
                {groupActivities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="font-extrabold text-gray-900 text-lg">👥 Group Activities Near You</h3>
                      <span className="text-xs bg-violet-100 text-violet-600 font-bold px-2.5 py-0.5 rounded-full">Community</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Meet new people at local events happening this week</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {groupActivities.map((g, i) => (
                        <GroupActivityCard key={i} group={g} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      Group events are community-organised. A Day to Remember ensures safe, public, platonic meetups only. 🛡️
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* STEP 3 — Companion list */}
        {step === 3 && (
          <>
            <div className="mb-7">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="text-3xl">{selectedScenario?.emoji}</span>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">{selectedScenario?.title}</h2>
                  <p className="text-gray-500 text-sm">{selectedScenario?.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs bg-violet-50 text-violet-600 font-semibold px-3 py-1 rounded-full border border-violet-100">{selectedScenario?.activity}</span>
                <span className="text-xs text-gray-400">⏱ {selectedScenario?.duration}</span>
                <span className="text-xs text-gray-400">• {selectedScenario?.vibe}</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse shadow-sm">
                    <div className="h-52 bg-gray-100" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : companions.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">No companions found</h3>
                <p className="text-gray-500 mb-6">Try a different activity or browse all companions</p>
                <Link to="/companions" className="btn-primary inline-block py-3 px-8">Browse All Companions</Link>
              </div>
            ) : (
              <>
                {/* Available now section */}
                {companions.some((c) => c.is_available_now) && (
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse inline-block" />
                      <h3 className="font-extrabold text-gray-900 text-lg">Available Right Now</h3>
                      <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-0.5 rounded-full border border-green-200">Instant Book</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-2">
                      {companions.filter((c) => c.is_available_now).map((c) => (
                        <div key={c.id} className="relative">
                          <div className="absolute top-3 left-3 z-10">
                            <AvailableNowBadge />
                          </div>
                          <CompanionCard companion={c} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All companions */}
                {companions.some((c) => !c.is_available_now) && (
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg mb-4">
                      {companions.some((c) => c.is_available_now) ? 'Other Companions for This Activity' : `All Companions — ${selectedScenario?.activity}`}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {companions.filter((c) => !c.is_available_now).map((c) => (
                        <CompanionCard key={c.id} companion={c} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <Link to="/available-now" className="btn-outline inline-flex items-center gap-2 py-3 px-7 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    See All Available Companions
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
