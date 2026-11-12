import React, { useState, useEffect, useMemo } from 'react';
import Countdown from './Countdown.jsx';
import { 
  Gift, 
  Calendar, 
  List, 
  Lock, 
  EyeOff, 
  UserCheck, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Snowflake, 
  Shuffle, 
  Check, 
  HelpCircle,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  User,
  AlertCircle,
  KeyRound
} from 'lucide-react';

// Pre-loaded realistic demo data
const INITIAL_PARTICIPANTS = [
  { id: '1', name: 'alex', pin: '', drawnId: '', isDrawn: true },
  { id: '2', name: 'syd', pin: '', drawnId: '', isDrawn: true },
  { id: '3', name: 'angie', pin: '', drawnId: '', isDrawn: true },
  { id: '4', name: 'nina', pin: '', drawnId: '', isDrawn: false },
  { id: '5', name: 'keyla', pin: '', drawnId: '', isDrawn: false },
  { id: '6', name: 'ella', pin: '', drawnId: '', isDrawn: false },
];

const INITIAL_WISHLISTS = {
  '1': [
    { id: 'w1', title: 'how to not be a loser', price: '$35', url: 'https://www.amazon.com/dp/B0D35VLHX1?lv=shuf&channelId=520&plpRedirect=mhFallback', notes: 'i suck', store: 'amazon' }
  ],
  '2': [
    { id: 'w2',title: 'how to not be a loser', price: '$35', url: 'https://www.amazon.com/dp/B0D35VLHX1?lv=shuf&channelId=520&plpRedirect=mhFallback', notes: 'i suck', store: 'amazon' }
  ],
  '3': [
    { id: 'w3', title: 'how to not be a loser', price: '$35', url: 'https://www.amazon.com/dp/B0D35VLHX1?lv=shuf&channelId=520&plpRedirect=mhFallback', notes: 'i suck', store: 'amazon' }
  ],
  '4': [
    { id: 'w4', title: 'how to not be a loser', price: '$35', url: 'https://www.amazon.com/dp/B0D35VLHX1?lv=shuf&channelId=520&plpRedirect=mhFallback', notes: 'i suck', store: 'amazon' }
  ],
  '5': [
    { id: 'w5', title: 'how to not be a loser', price: '$35', url: 'https://www.amazon.com/dp/B0D35VLHX1?lv=shuf&channelId=520&plpRedirect=mhFallback', notes: 'i suck', store: 'amazon' }
  ]
};

// December dates for availability
const DECEMBER_DATES = [
  // Dec 15 to Dec 31
  ...Array.from({ length: 17 }, (_, i) => ({
    day: 15 + i,
    dateStr: `2026-12-${15 + i}`,
    label: `dec ${15 + i}`
  })),
  // Jan 1 to Jan 4
  ...Array.from({ length: 4 }, (_, i) => ({
    day: 1 + i,
    dateStr: `2027-01-0${1 + i}`,
    label: `jan ${1 + i}`
  }))
];

const INITIAL_AVAILABILITY = {
  '1': { },
  '2': {  },
  '3': {  },
  '4': { },
  '5': { }
}

export default function App() {
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem('holiday_participants');
    return saved ? JSON.parse(saved) : INITIAL_PARTICIPANTS;
  });

  const [wishlists, setWishlists] = useState(() => {
    const saved = localStorage.getItem('holiday_wishlists');
    return saved ? JSON.parse(saved) : INITIAL_WISHLISTS;
  });

  const [availability, setAvailability] = useState(() => {
    const saved = localStorage.getItem('holiday_availability');
    return saved ? JSON.parse(saved) : INITIAL_AVAILABILITY;
  });

  // App settings & UI State
  const [activeTab, setActiveTab] = useState('draw'); // 'draw', 'wishlists', 'calendar', 'admin'
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [organizerPinInput, setOrganizerPinInput] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // Active user simulation
  const [activeUser, setActiveUser] = useState(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [revealedAssignment, setRevealedAssignment] = useState(false);
  const [settingUpPin, setSettingUpPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Wishlist Form State
  const [itemTitle, setItemTitle] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [itemStore, setItemStore] = useState('amazon');
  const [wishlistFilter, setWishlistFilter] = useState('all');

  // Load festive Google Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    localStorage.setItem('holiday_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('holiday_wishlists', JSON.stringify(wishlists));
  }, [wishlists]);

  useEffect(() => {
    localStorage.setItem('holiday_availability', JSON.stringify(availability));
  }, [availability]);

  // Helper: Secret Santa Derangement Algorithm
  const performDraw = () => {
    if (participants.length < 3) {
      alert('you need at least 3 members to draw secret santas!');
      return;
    }

    let ids = participants.map(p => p.id);
    let shuffled = [...ids];
    let isValid = false;
    let attempts = 0;

    while (!isValid && attempts < 500) {
      attempts++;
      shuffled.sort(() => Math.random() - 0.5);
      isValid = ids.every((id, idx) => id !== shuffled[idx]);
    }

    if (!isValid) {
      alert('could not solve draw automatically. please try again.');
      return;
    }

    const updated = participants.map((p, idx) => ({
      ...p,
      drawnId: shuffled[idx],
      isDrawn: false,
      pin: p.pin || ''
    }));

    setParticipants(updated);
    alert('🎉 secret santa draw completed successfully!');
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newId = Date.now().toString();
    const newParticipant = {
      id: newId,
      name: newMemberName.trim(),
      pin: '',
      drawnId: '',
      isDrawn: false
    };

    setParticipants([...participants, newParticipant]);
    setWishlists({ ...wishlists, [newId]: [] });
    setNewMemberName('');
  };

  const handleRemoveMember = (id) => {
    if (confirm('are you sure you want to remove this member?')) {
      setParticipants(participants.filter(p => p.id !== id));
      const updatedWishlists = { ...wishlists };
      delete updatedWishlists[id];
      setWishlists(updatedWishlists);
      if (activeUser?.id === id) setActiveUser(null);
    }
  };

  // Login / PIN logic
  const handleSelectUser = (user) => {
    setActiveUser(user);
    setEnteredPin('');
    setPinError('');
    setRevealedAssignment(false);
    setSettingUpPin(!user.pin);
  };

  const handleSetPin = () => {
    if (newPinInput.length < 4) {
      setPinError('pin must be at least 4 digits');
      return;
    }
    const updated = participants.map(p => p.id === activeUser.id ? { ...p, pin: newPinInput } : p);
    setParticipants(updated);
    setActiveUser({ ...activeUser, pin: newPinInput });
    setSettingUpPin(false);
    setNewPinInput('');
    setPinError('');
  };

  const handleVerifyPin = () => {
    if (enteredPin === activeUser.pin) {
      setRevealedAssignment(true);
      setPinError('');
    } else {
      setPinError('incorrect pin. please try again.');
    }
  };

  const handleOrganizerSignIn = (e) => {
    e.preventDefault();
    if (organizerPinInput === '2580' || organizerPinInput === 'admin') {
      setIsOrganizer(true);
      setShowOrganizerModal(false);
      setActiveTab('admin');
      setOrganizerPinInput('');
    } else {
      alert('incorrect organizer password. (default demo pass: ur mom)');
    }
  };

  // Add Item to active user's wishlist
  const handleAddWishlistItem = (e) => {
    e.preventDefault();
    if (!activeUser) {
      alert('please select your name first to manage your wishlist!');
      return;
    }
    if (!itemTitle.trim()) return;

    let finalUrl = itemUrl.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const newItem = {
      id: Date.now().toString(),
      title: itemTitle.trim(),
      price: itemPrice.trim() || 'n/a',
      url: finalUrl,
      notes: itemNotes.trim(),
      store: itemStore
    };

    const userWishlist = wishlists[activeUser.id] || [];
    setWishlists({
      ...wishlists,
      [activeUser.id]: [...userWishlist, newItem]
    });

    setItemTitle('');
    setItemPrice('');
    setItemUrl('');
    setItemNotes('');
  };

  const handleDeleteWishlistItem = (itemId) => {
    if (!activeUser) return;
    const userWishlist = wishlists[activeUser.id] || [];
    setWishlists({
      ...wishlists,
      [activeUser.id]: userWishlist.filter(item => item.id !== itemId)
    });
  };

  // Availability toggle
  const toggleAvailability = (userId, dateStr) => {
    const userDates = availability[userId] || {};
    const current = userDates[dateStr] || 'none';
    let next = 'available';
    if (current === 'available') next = 'if-needed';
    else if (current === 'if-needed') next = 'unavailable';
    else if (current === 'unavailable') next = 'none';

    setAvailability({
      ...availability,
      [userId]: {
        ...userDates,
        [dateStr]: next
      }
    });
  };

  // Get recipient assigned to active user
  const assignedRecipient = useMemo(() => {
    if (!activeUser || !activeUser.drawnId) return null;
    return participants.find(p => p.id === activeUser.drawnId);
  }, [activeUser, participants]);

  // Festive Light Dots Banner Array
  const lightColors = ['#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#e76f51', '#2a9d8f', '#e63946', '#f4a261'];
  const lightDots = Array.from({ length: 36 }).map((_, i) => lightColors[i % lightColors.length]);

  return (
    <div 
      className="min-h-screen text-emerald-950 relative selection:bg-red-200 selection:text-red-900 pb-16 font-sans"
      style={{
        backgroundColor: '#f3f6f1',
        backgroundImage: 'radial-gradient(#b0c2b4 0.75px, transparent 0.75px)',
        backgroundSize: '24px 24px',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {/* Top Colorful Lights Banner */}
      <div className="w-full flex justify-between items-center px-2 py-3 overflow-hidden bg-emerald-950/5">
        <div className="w-full flex justify-between items-center max-w-6xl mx-auto px-4">
          {lightDots.map((color, index) => (
            <div
              key={index}
              className="w-3.5 h-3.5 rounded-full shadow-sm transition-transform duration-300 hover:scale-125"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Main Vintage Header */}
      <header className="pt-6 pb-4 px-4 text-center max-w-4xl mx-auto">
        <p className="text-xs font-extrabold tracking-widest uppercase text-emerald-800 mb-1">
          gift swap
        </p>
        <h1 
          className="text-5xl sm:text-7xl font-bold text-emerald-950 tracking-wide mb-4 leading-tight"
          style={{ fontFamily: "'Mountains of Christmas', cursive" }}
        >
          super secret gift swap
        </h1>

        {/* Candy Cane Striped Divider Line */}
        <div 
          className="w-full h-3.5 rounded-full shadow-sm mb-6 border border-red-800/20"
          style={{
            background: 'repeating-linear-gradient(135deg, #cc2936, #cc2936 12px, #ffffff 12px, #ffffff 24px)'
          }}
        />

        {/* Organizer Sign In Link & Profile Selector Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm pt-1">
          <button
            onClick={() => setShowOrganizerModal(true)}
            className="text-emerald-800 hover:text-emerald-950 underline underline-offset-4 font-medium flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700 rounded px-1"
          >
            <KeyRound className="w-4 h-4 text-emerald-700" />
            {isOrganizer ? 'organizer mode (active)' : 'organizer sign in'}
          </button>

          <div className="flex items-center gap-2 bg-white/80 backdrop-blur border border-emerald-900/10 p-1.5 rounded-xl shadow-sm">
            <User className="w-4 h-4 text-emerald-800 ml-1.5" />
            <span className="text-xs font-semibold text-emerald-900">participant:</span>
            <select
              aria-label="select active participant profile"
              value={activeUser ? activeUser.id : ''}
              onChange={(e) => {
                const u = participants.find(p => p.id === e.target.value);
                handleSelectUser(u || null);
              }}
              className="bg-transparent text-sm font-semibold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 rounded px-2 py-0.5 cursor-pointer"
            >
              <option value="" className="text-gray-900">-- choose your name --</option>
              {participants.map(p => (
                <option key={p.id} value={p.id} className="text-gray-900">
                  {p.name} {p.pin ? '🔒' : '⚠️ set pin'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Winter break countdown */}
      <Countdown />

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-4 relative z-10">
        
        {/* Active User Status Banner */}
        {activeUser ? (
          <div className="mb-6 p-4 rounded-2xl bg-white/90 border border-emerald-900/10 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                {activeUser.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-emerald-700 font-semibold tracking-wider">signed in as</p>
                <p className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  {activeUser.name}
                  {activeUser.pin ? (
                    <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <Lock className="w-3 h-3" /> protected
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> pin required
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveUser(null)}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium transition-colors"
            >
              switch user
            </button>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl bg-white/70 border border-emerald-900/10 shadow-sm flex items-center gap-3 text-emerald-900 text-sm">
            <HelpCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <p>
              select your name from the menu at the top right to check your secret santa draw recipient, manage your wishlist, or set availability!
            </p>
          </div>
        )}

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-emerald-900/15 mb-6 gap-2 overflow-x-auto pb-1" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'draw'}
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
              activeTab === 'draw'
                ? 'bg-white text-emerald-950 shadow-md border-t-4 border-red-600'
                : 'bg-emerald-900/5 text-emerald-800 hover:bg-white/50'
            }`}
          >
            <Gift className="w-4 h-4 text-red-600" /> my secret santa
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'wishlists'}
            onClick={() => setActiveTab('wishlists')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
              activeTab === 'wishlists'
                ? 'bg-white text-emerald-950 shadow-md border-t-4 border-red-600'
                : 'bg-emerald-900/5 text-emerald-800 hover:bg-white/50'
            }`}
          >
            <List className="w-4 h-4 text-emerald-700" /> wishlist hub
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'calendar'}
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
              activeTab === 'calendar'
                ? 'bg-white text-emerald-950 shadow-md border-t-4 border-red-600'
                : 'bg-emerald-900/5 text-emerald-800 hover:bg-white/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-600" /> party dates
          </button>

          {isOrganizer && (
            <button
              role="tab"
              aria-selected={activeTab === 'admin'}
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
                activeTab === 'admin'
                  ? 'bg-white text-emerald-950 shadow-md border-t-4 border-red-600'
                  : 'bg-emerald-900/5 text-emerald-800 hover:bg-white/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-700" /> organizer controls
            </button>
          )}
        </div>

        {/* TAB 1: SECRET SANTA DRAW & PIN */}
        {activeTab === 'draw' && (
          <div className="space-y-6">
            <div className="bg-white/95 border border-emerald-900/10 shadow-sm p-6 sm:p-8 rounded-2xl">
              <h2 className="text-2xl font-bold text-emerald-950 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-6 h-6 text-red-600" />
                secret santa draw reveal
              </h2>
              <p className="text-emerald-800 text-sm mb-6">
                enter your secret 4-digit pin to safely reveal who you are gifting this year.
              </p>

              {!activeUser ? (
                <div className="text-center py-10 border-2 border-dashed border-emerald-800/20 rounded-2xl bg-emerald-50/50">
                  <Lock className="w-10 h-10 text-emerald-700 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-emerald-950 mb-1">please select your profile above</h3>
                  <p className="text-sm text-emerald-800 max-w-md mx-auto">
                    choose your name from the participant menu at the top right to access your assigned recipient.
                  </p>
                </div>
              ) : settingUpPin ? (
                <div className="max-w-md mx-auto bg-emerald-50/80 p-6 rounded-2xl border border-emerald-200 text-center shadow-sm">
                  <Lock className="w-8 h-8 text-emerald-800 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-emerald-950 mb-1">create security pin</h3>
                  <p className="text-xs text-emerald-700 mb-4">
                    create a 4-digit pin so only you can see your recipient and modify your wishlist.
                  </p>
                  
                  <div className="space-y-3">
                    <input
                      type="password"
                      maxLength={8}
                      placeholder="enter 4-digit pin"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="w-full text-center tracking-widest text-xl bg-white border border-emerald-300 rounded-xl py-2.5 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                    {pinError && <p className="text-xs text-red-600 font-semibold">{pinError}</p>}
                    <button
                      onClick={handleSetPin}
                      className="w-full py-2.5 rounded-xl font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-md transition-colors"
                    >
                      save pin & reveal
                    </button>
                  </div>
                </div>
              ) : !revealedAssignment ? (
                <div className="max-w-md mx-auto bg-emerald-50/80 p-6 rounded-2xl border border-emerald-200 text-center shadow-sm">
                  <Lock className="w-8 h-8 text-emerald-800 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-emerald-950 mb-1">enter pin</h3>
                  <p className="text-xs text-emerald-700 mb-4">
                    welcome <strong>{activeUser.name}</strong>, enter your secret pin to unlock your assignment.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="4-digit pin"
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                      className="w-full text-center tracking-widest text-xl bg-white border border-emerald-300 rounded-xl py-2 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                    {pinError && <p className="text-xs text-red-600 font-semibold">{pinError}</p>}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleVerifyPin}
                        className="flex-1 py-2.5 rounded-xl font-bold bg-red-700 hover:bg-red-800 text-white shadow-md transition-colors"
                      >
                        unlock gift card
                      </button>
                      <button
                        onClick={() => setSettingUpPin(true)}
                        className="px-3 py-2.5 text-xs bg-white text-emerald-800 rounded-xl border border-emerald-300 hover:bg-emerald-100 font-medium"
                      >
                        reset pin
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto relative">
                  <div className="bg-white border-2 border-red-700 p-6 rounded-2xl text-center space-y-4 shadow-xl relative overflow-hidden">
                    <div className="h-2 w-full bg-red-700 absolute top-0 left-0"></div>
                    <div className="flex justify-between items-center border-b border-emerald-900/10 pb-3">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-500" /> secret santa match
                      </span>
                      <button
                        onClick={() => setRevealedAssignment(false)}
                        className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> hide
                      </button>
                    </div>

                    {assignedRecipient ? (
                      <div className="py-4 space-y-3">
                        <p className="text-xs text-emerald-800 font-medium">you are buying a holiday gift for:</p>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-inner">
                          <p 
                            className="text-4xl font-bold text-red-700 tracking-wide"
                            style={{ fontFamily: "'Mountains of Christmas', cursive" }}
                          >
                            🎁 {assignedRecipient.name} 🎁
                          </p>
                        </div>
                        
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setWishlistFilter(assignedRecipient.id);
                              setActiveTab('wishlists');
                            }}
                            className="inline-flex items-center gap-2 text-sm text-white font-bold bg-emerald-800 hover:bg-emerald-900 px-5 py-2.5 rounded-xl transition-all shadow-md"
                          >
                            <ShoppingBag className="w-4 h-4" /> view {assignedRecipient.name}'s wishlist <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-emerald-900">
                        <p className="text-base font-semibold">the secret santa draw hasn't happened yet!</p>
                        <p className="text-xs text-emerald-700 mt-1">ask the organizer to run the draw once everyone sets up their name.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WISHLISTS */}
        {activeTab === 'wishlists' && (
          <div className="space-y-6">
            <div className="bg-white/95 border border-emerald-900/10 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-800" />
                <span className="font-bold text-emerald-950 text-sm">filter wishlist:</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setWishlistFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    wishlistFilter === 'all'
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  all members
                </button>
                {participants.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setWishlistFilter(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      wishlistFilter === p.id
                        ? 'bg-emerald-800 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {p.name}
                    {assignedRecipient?.id === p.id && (
                      <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">match</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {activeUser && (
              <div className="bg-white/95 border border-emerald-900/10 p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-emerald-950 mb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-red-600" /> add to my wishlist ({activeUser.name})
                </h3>

                <form onSubmit={handleAddWishlistItem} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-emerald-800 font-semibold mb-1">item title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. cozy wool blanket"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-emerald-800 font-semibold mb-1">price estimate</label>
                    <input
                      type="text"
                      placeholder="e.g. $25 - $30"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-emerald-800 font-semibold mb-1">store choice</label>
                    <select
                      value={itemStore}
                      onChange={(e) => setItemStore(e.target.value)}
                      className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      <option value="amazon">amazon</option>
                      <option value="target">target</option>
                      <option value="walmart">walmart</option>
                      <option value="etsy">etsy</option>
                      <option value="other">other store</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-emerald-800 font-semibold mb-1">product web link (url)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={itemUrl}
                      onChange={(e) => setItemUrl(e.target.value)}
                      className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-emerald-800 font-semibold mb-1">color/size notes</label>
                    <input
                      type="text"
                      placeholder="e.g. size medium, olive green preferred"
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-4 flex justify-end mt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-md flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> save item
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-6">
              {participants
                .filter(p => wishlistFilter === 'all' || wishlistFilter === p.id)
                .map(member => {
                  const items = wishlists[member.id] || [];
                  const isRecipient = assignedRecipient?.id === member.id;

                  return (
                    <div key={member.id} className={`bg-white/95 border ${isRecipient ? 'border-2 border-red-600' : 'border-emerald-900/10'} p-6 rounded-2xl shadow-sm`}>
                      <div className="flex justify-between items-center mb-4 border-b border-emerald-900/10 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-base">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                              {member.name}'s Wishlist
                              {isRecipient && (
                                <span className="text-xs bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                                  🎁 your match
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-emerald-700">{items.length} item(s)</p>
                          </div>
                        </div>
                      </div>

                      {items.length === 0 ? (
                        <p className="text-sm text-emerald-700 italic py-2">no wishlist items added yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map(item => (
                            <div key={item.id} className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex flex-col justify-between space-y-3">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-emerald-950 text-base">{item.title}</h4>
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 flex-shrink-0">
                                    {item.price}
                                  </span>
                                </div>
                                {item.notes && (
                                  <p className="text-xs text-emerald-800 mt-1 italic bg-white/70 p-2 rounded border border-emerald-100">
                                    "{item.notes}"
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between border-t border-emerald-200/60 pt-2 text-xs">
                                <span className="text-emerald-700 font-semibold">{item.store}</span>
                                
                                <div className="flex items-center gap-2">
                                  {item.url && (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                    >
                                      buy online <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  
                                  {activeUser?.id === member.id && (
                                    <button
                                      onClick={() => handleDeleteWishlistItem(item.id)}
                                      className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                                      title="delete item"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3: CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white/95 border border-emerald-900/10 p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-emerald-950 mb-2 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-600" /> holiday exchange dates
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 mb-6">
                click under your name to set availability: 
                <span className="text-emerald-700 font-bold ml-1">green = available</span> • 
                <span className="text-amber-700 font-bold ml-1">yellow = if needed</span> • 
                <span className="text-red-700 font-bold ml-1">red = busy</span>.
              </p>

              <div className="overflow-x-auto pb-4">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-emerald-900/15">
                      <th className="p-3 text-emerald-900 font-bold min-w-[120px]">member</th>
                      {DECEMBER_DATES.map(d => (
                        <th key={d.dateStr} className="p-2 text-center text-xs font-bold text-emerald-950 min-w-[55px]">
                          {d.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/10">
                    {participants.map(member => (
                      <tr key={member.id} className={activeUser?.id === member.id ? 'bg-emerald-50/80' : ''}>
                        <td className="p-3 font-semibold text-emerald-950 flex items-center gap-2">
                          {member.name}
                          {activeUser?.id === member.id && (
                            <span className="text-[10px] bg-emerald-800 text-white font-bold px-1.5 py-0.5 rounded">you</span>
                          )}
                        </td>
                        {DECEMBER_DATES.map(d => {
                          const status = availability[member.id]?.[d.dateStr] || 'none';
                          const isCurrentUser = activeUser?.id === member.id;

                          let bg = 'bg-gray-100 border-gray-300 text-gray-400';
                          let icon = null;

                          if (status === 'available') {
                            bg = 'bg-emerald-700 border-emerald-800 text-white';
                            icon = <CheckCircle2 className="w-4 h-4 mx-auto" />;
                          } else if (status === 'if-needed') {
                            bg = 'bg-amber-400 border-amber-500 text-amber-950 font-bold';
                            icon = <Clock className="w-4 h-4 mx-auto" />;
                          } else if (status === 'unavailable') {
                            bg = 'bg-red-700 border-red-800 text-white';
                            icon = <XCircle className="w-4 h-4 mx-auto" />;
                          }

                          return (
                            <td key={d.dateStr} className="p-1 text-center">
                              <button
                                disabled={!isCurrentUser}
                                onClick={() => toggleAvailability(member.id, d.dateStr)}
                                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${bg} ${
                                  isCurrentUser ? 'hover:scale-105 cursor-pointer focus:ring-2 focus:ring-emerald-700' : 'cursor-default opacity-80'
                                }`}
                                aria-label={`${member.name.toLowerCase()} availability for ${d.label.toLowerCase()}: ${status}`}
                              >
                                {icon}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORGANIZER CONTROLS */}
        {activeTab === 'admin' && isOrganizer && (
          <div className="space-y-6">
            <div className="bg-white/95 border border-emerald-900/10 p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-emerald-950 mb-2 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-emerald-800" /> organizer dashboard
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 mb-6">
                manage members, add new participants, and execute the secret santa draw.
              </p>

              <form onSubmit={handleAddMember} className="flex gap-2 max-w-md mb-8">
                <input
                  type="text"
                  placeholder="friend / family member name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="flex-1 bg-emerald-50/50 border border-emerald-300 rounded-xl px-4 py-2.5 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-md flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> add
                </button>
              </form>

              <div className="p-5 rounded-xl bg-red-50 border border-red-200 mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-red-950 text-lg flex items-center gap-2">
                    <Shuffle className="w-5 h-5 text-red-700" /> execute secret santa draw
                  </h3>
                  <p className="text-xs text-red-800 mt-0.5">
                    generates random unique assignments for all {participants.length} members with zero self-picks.
                  </p>
                </div>

                <button
                  onClick={performDraw}
                  className="px-6 py-3 rounded-xl font-bold bg-red-700 hover:bg-red-800 text-white shadow-md flex items-center gap-2 transition-colors text-base"
                >
                  <Shuffle className="w-5 h-5" /> run draw now
                </button>
              </div>

              <h3 className="font-bold text-emerald-950 text-base mb-3">group roster</h3>
              <div className="space-y-3">
                {participants.map((member) => (
                  <div key={member.id} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                        {member.name}
                        {member.pin ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                            pin active
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                            no pin
                          </span>
                        )}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg border border-red-300 text-xs flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-4 h-4" /> remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Organizer Password Modal */}
      {showOrganizerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-emerald-900/20 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-900/10 pb-3">
              <h3 className="font-bold text-emerald-950 text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-700" /> organizer sign in
              </h3>
              <button 
                onClick={() => setShowOrganizerModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOrganizerSignIn} className="space-y-3">
              <p className="text-xs text-emerald-800">
                enter organizer password to manage members & trigger the secret santa draw. (demo passcode: <strong>1234</strong>)
              </p>

              <input
                type="password"
                placeholder="organizer password"
                value={organizerPinInput}
                onChange={(e) => setOrganizerPinInput(e.target.value)}
                className="w-full bg-emerald-50 border border-emerald-300 rounded-xl py-2 px-3 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-md text-sm"
                >
                  sign in
                </button>
                <button
                  type="button"
                  onClick={() => setShowOrganizerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtle Footer */}
      <footer className="mt-12 text-center text-xs text-emerald-800 border-t border-emerald-900/10 pt-6 max-w-4xl mx-auto px-4">
        <p>🎄 super secret gift swap • Vintage Theme Design</p>
      </footer>
    </div>
  );
}
