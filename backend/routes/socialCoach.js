const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'adaytoremember_secret';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

const ACTIVITY_TIPS = {
  'Shopping': {
    icebreakers: [
      "What's your go-to store when you need to treat yourself?",
      "Are you more of a bargain hunter or a splurge shopper?",
      "Do you have a shopping list or do you prefer to browse spontaneously?",
    ],
    sharedTopics: [
      "Favorite fashion trends right now",
      "Best shopping neighborhoods in the city",
      "Sustainable or thrift shopping experiences",
    ],
    activityTip: "Try starting at a smaller boutique before hitting bigger stores — it sets a relaxed, exploratory tone.",
  },
  'Hiking & Nature Walks': {
    icebreakers: [
      "What's the most scenic trail you've ever been on?",
      "Do you prefer morning hikes or evening ones?",
      "Are you a 'push to the summit' type or enjoy stopping often to take it in?",
    ],
    sharedTopics: [
      "Favorite national parks or nature reserves",
      "Wildlife and nature photography",
      "Post-hike meal traditions",
    ],
    activityTip: "Agree on the pace before you start — a comfortable rhythm makes conversation flow naturally.",
  },
  'Dining & Cafes': {
    icebreakers: [
      "Are you a foodie who researches menus ahead or do you decide on the spot?",
      "What's your favorite cuisine that you could eat every day?",
      "Do you prefer cozy cafes or lively restaurants?",
    ],
    sharedTopics: [
      "Best hidden-gem restaurants you've discovered",
      "Favorite comfort foods and childhood meals",
      "Cooking at home vs eating out preferences",
    ],
    activityTip: "Order a sharing platter if possible — it creates natural conversation and a sense of adventure.",
  },
  'Movies & Entertainment': {
    icebreakers: [
      "What genre of movie never gets old for you?",
      "Do you talk during movies or prefer complete silence?",
      "What's a movie you've watched more than three times?",
    ],
    sharedTopics: [
      "Favorite directors and why their style resonates",
      "Movies that changed your perspective on something",
      "Underrated gems vs blockbuster favorites",
    ],
    activityTip: "Pick the movie together if you can — it's a great low-pressure collaborative decision to start with.",
  },
  'Yoga & Meditation': {
    icebreakers: [
      "How long have you been practicing yoga or meditation?",
      "Do you prefer guided sessions or self-directed practice?",
      "What's your favorite post-session ritual — tea, journaling, or just resting?",
    ],
    sharedTopics: [
      "Mindfulness routines and morning habits",
      "Dealing with stress through movement",
      "Favorite meditation apps or instructors",
    ],
    activityTip: "Start with a shared breathing exercise — it immediately syncs your energy and reduces first-meeting jitters.",
  },
  'Museum & Art Gallery': {
    icebreakers: [
      "Do you have a favorite art style or historical period?",
      "Do you like reading every placard or soaking in the vibe as you walk?",
      "Is there a piece of art that's ever genuinely moved you?",
    ],
    sharedTopics: [
      "Art that sparks emotion vs art that sparks thought",
      "Local vs international art scenes",
      "Creative outlets in your own life",
    ],
    activityTip: "Pick one exhibit to spend extra time in rather than rushing through everything — depth over breadth.",
  },
  'Gym & Workout': {
    icebreakers: [
      "What's your current fitness goal?",
      "Are you more of a morning workout or evening workout person?",
      "What exercise do you actually enjoy vs what you force yourself to do?",
    ],
    sharedTopics: [
      "Motivation strategies that actually work",
      "Nutrition and recovery habits",
      "Favorite workout music or podcasts",
    ],
    activityTip: "Warm up together and check in on fitness level — it builds trust and ensures a comfortable shared session.",
  },
  'Concerts & Live Music': {
    icebreakers: [
      "What's the best live performance you've ever been to?",
      "Are you front-row energy or hang-back-and-vibe type?",
      "Do you follow the artist beforehand or prefer to discover them live?",
    ],
    sharedTopics: [
      "Music genres and how they evolved for you",
      "The difference between hearing and listening to music",
      "Concerts as emotional experiences",
    ],
    activityTip: "Arrive early to explore the venue together — it turns the waiting into its own experience.",
  },
  'Outdoor & City Tours': {
    icebreakers: [
      "What's the most surprising thing you've discovered in a city you thought you knew?",
      "Do you prefer structured tours or wandering without a plan?",
      "What kind of neighborhood stories interest you most — history, food, or local characters?",
    ],
    sharedTopics: [
      "Best cities you've explored and what made them special",
      "Hidden gems in your own hometown",
      "Travel styles: planner vs improviser",
    ],
    activityTip: "Let your companion lead one section of the tour — their local knowledge often reveals the best spots.",
  },
  'Food Tour': {
    icebreakers: [
      "What's the most adventurous food you've ever tried?",
      "Do you have any dietary deal-breakers or things you're curious to try?",
      "Do you prioritize ambiance or taste when eating out?",
    ],
    sharedTopics: [
      "Food memories tied to places or people",
      "Cooking traditions from different cultures",
      "Street food vs fine dining preferences",
    ],
    activityTip: "Share small bites from each stop — it creates a bonding ritual throughout the tour.",
  },
  'Karaoke': {
    icebreakers: [
      "Are you a 'go-to song' person or do you pick something different every time?",
      "Solo performer or duet enthusiast?",
      "What's a song that always gets the room going?",
    ],
    sharedTopics: [
      "Music that defined different chapters of your life",
      "Guilty pleasure songs you secretly love",
      "Best karaoke memories",
    ],
    activityTip: "Start with a duet to lower the pressure — singing together first makes solo performances feel easier.",
  },
  'Dancing': {
    icebreakers: [
      "Do you have a signature move or are you a freestyle dancer?",
      "What type of music gets you on the dance floor instantly?",
      "Have you ever taken dance classes or is it all self-taught?",
    ],
    sharedTopics: [
      "Music that makes movement feel effortless",
      "Dance styles you'd love to learn",
      "Best dance floor memories",
    ],
    activityTip: "Start with a casual warm-up song before getting into full dancing — it relaxes both of you.",
  },
  'Book Club & Reading': {
    icebreakers: [
      "What's the last book that genuinely surprised you?",
      "Are you a fiction or non-fiction reader by default?",
      "Do you dog-ear pages, use bookmarks, or read digitally?",
    ],
    sharedTopics: [
      "Books that changed how you think",
      "Favorite authors and their writing styles",
      "How reading habits have changed over time",
    ],
    activityTip: "Bring a short passage from something you're currently reading — sharing it opens up immediate genuine conversation.",
  },
  'Photography Walk': {
    icebreakers: [
      "What subject do you find yourself photographing most often?",
      "Are you more interested in candid moments or composed shots?",
      "Do you edit your photos heavily or prefer them natural?",
    ],
    sharedTopics: [
      "The story behind a favorite photo you've taken",
      "How photography changes the way you observe places",
      "Film vs digital photography",
    ],
    activityTip: "Challenge each other to capture the same scene from completely different perspectives — it sparks creativity and friendly comparison.",
  },
  'Cooking Together': {
    icebreakers: [
      "What's your signature dish that you always feel confident making?",
      "Do you follow recipes strictly or improvise as you go?",
      "What cuisine are you most curious to learn?",
    ],
    sharedTopics: [
      "Food memories and family recipes",
      "Kitchen disasters that turned into great stories",
      "Ingredient obsessions and pantry staples",
    ],
    activityTip: "Split the prep work intentionally — it creates natural rhythm and collaboration from the start.",
  },
};

const SAFETY_REMINDERS = [
  "Meet in a well-lit public place, especially for the first hour.",
  "Share your location and companion's name with a friend or family member before the outing.",
];

function getTipsForActivity(activity) {
  if (ACTIVITY_TIPS[activity]) {
    return ACTIVITY_TIPS[activity];
  }
  // Fuzzy match — check if any key is contained in the activity string
  for (const key of Object.keys(ACTIVITY_TIPS)) {
    if (activity.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(activity.toLowerCase())) {
      return ACTIVITY_TIPS[key];
    }
  }
  // Generic fallback
  return {
    icebreakers: [
      "What made you choose this activity today?",
      "How do you usually spend your free time?",
      "Is there something specific you're hoping to get out of today?",
    ],
    sharedTopics: [
      "Hobbies and what drew you to them",
      "Best experiences you've had doing activities with others",
      "Things on your bucket list",
    ],
    activityTip: "Check in with each other early on about pace and comfort — it sets a collaborative, pressure-free tone.",
  };
}

// GET /:bookingId — get social coach tips for a booking
router.get('/:bookingId', authenticate, (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Verify booking belongs to user (as client or companion)
    let isAuthorized = false;
    if (req.user.role === 'client' && booking.client_id === req.user.userId) {
      isAuthorized = true;
    } else if (req.user.role === 'companion') {
      const companion = db.prepare('SELECT * FROM companions WHERE user_id = ?').get(req.user.userId);
      if (companion && booking.companion_id === companion.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to view this booking.' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Social coach tips are only available for confirmed bookings.' });
    }

    const clientUser = db.prepare('SELECT name FROM users WHERE id = ?').get(booking.client_id);
    const companionRecord = db.prepare('SELECT * FROM companions WHERE id = ?').get(booking.companion_id);
    const companionUser = db.prepare('SELECT name FROM users WHERE id = ?').get(companionRecord.user_id);

    const activityType = booking.activity;
    const tips = getTipsForActivity(activityType);

    res.json({
      icebreakers: tips.icebreakers,
      sharedTopics: tips.sharedTopics,
      safetyReminders: SAFETY_REMINDERS,
      activityTip: tips.activityTip,
      companionName: companionUser ? companionUser.name : 'Your companion',
      clientName: clientUser ? clientUser.name : 'You',
      activityType,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
