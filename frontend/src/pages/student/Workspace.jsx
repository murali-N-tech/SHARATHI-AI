import { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, Users, Hash, Search, 
  MoreVertical, Phone, Video, Mic, 
  Smile, Paperclip, Sparkles, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_API } from '../../lib/apiConfig';

// --- Mock Data ---
const CURRENT_LEVEL = 5;
const CHANNELS = [
  { id: 'general', name: 'general-lounge', desc: 'Chill vibes for Level 5 students' },
  { id: 'doubts', name: 'doubt-solving', desc: 'Get help with specific problems' },
  { id: 'collab', name: 'project-collab', desc: 'Find teammates for hackathons' },
  { id: 'wins', name: 'daily-wins', desc: 'Share your achievements!' },
];

// Preset avatars from Settings page
const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sorelle",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Cuddles",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Bandit",
];

const Workspace = () => {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [messages, setMessages] = useState([
    { id: 1, userId: 1, text: "Hey everyone! Anyone successfully implemented the Binary Search Tree logic yet?", time: "10:30 AM" },
    { id: 2, userId: 2, text: "I'm close! Just stuck on the deletion node case. 😅", time: "10:32 AM" },
    { id: 3, userId: 4, text: "Check the helper function in the docs, it handles the edge cases nicely.", time: "10:35 AM" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showAiChat, setShowAiChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  // Determine if user is the current logged-in user
  const isCurrentUser = (userEmail) => currentUser?.email === userEmail;

  // Get current user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('userData');
      if (raw) {
        const parsed = JSON.parse(raw);
        const userEmail = parsed?.email || parsed?.user?.email || parsed?.profile?.email || null;
        const userName = parsed?.name || parsed?.displayName || parsed?.user?.name || parsed?.profile?.name || 'User';
        const userAvatar = parsed?.avatar || parsed?.picture || PRESET_AVATARS[0];
        
        setCurrentUser({
          email: userEmail,
          name: userName,
          avatar: userAvatar,
        });

        // Register presence in online users
        if (userEmail) {
          fetch(`${BACKEND_API}/api/online-users/presence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, name: userName })
          })
            .then(res => res.json())
            .then(data => console.log('[Workspace] Presence registered:', data))
            .catch(err => console.error('[Workspace] Error registering presence:', err));
        }
      }
    } catch (err) {
      console.error('[Workspace] Error reading current user from localStorage:', err);
    }
  }, []);

  // Fetch online users from API
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_API}/api/online-users`);
        if (response.ok) {
          const result = await response.json();
          console.log('[Workspace] Online users from API:', result.users);
          
          // Map API response to UI format
          const formattedUsers = result.users.map((user, index) => ({
            id: user._id || index + 1,
            name: user.name || 'User',
            email: user.email,
            status: 'online',
            avatar: isCurrentUser(user.email) 
              ? currentUser?.avatar || PRESET_AVATARS[index % PRESET_AVATARS.length]
              : PRESET_AVATARS[index % PRESET_AVATARS.length],
            role: isCurrentUser(user.email) ? 'You' : 'Peer',
          }));
          
          setOnlineUsers(formattedUsers);
        } else {
          console.error('[Workspace] Failed to fetch online users');
          setOnlineUsers([]);
        }
      } catch (err) {
        console.error('[Workspace] Error fetching online users:', err);
        setOnlineUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchOnlineUsers();
      // Refresh online users every 30 seconds
      const interval = setInterval(fetchOnlineUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.email]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg = {
      id: Date.now(),
      userId: currentUser?.email || 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputValue("");
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-white overflow-hidden rounded-tl-3xl border-t border-l border-slate-200 shadow-2xl">
      
      {/* ================= LEFT SIDEBAR: CHANNELS ================= */}
      <div className="hidden md:flex w-64 bg-slate-50 border-r border-slate-200 flex-col">
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <span className="bg-brand-600 text-white text-xs px-2 py-1 rounded-md">Lvl {CURRENT_LEVEL}</span>
            Squad
          </h2>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2">Text Channels</div>
          {CHANNELS.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeChannel.id === channel.id 
                  ? 'bg-brand-100 text-brand-700' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Hash size={18} className={activeChannel.id === channel.id ? 'text-brand-500' : 'text-slate-400'} />
              {channel.name}
            </button>
          ))}
        </div>

        {/* User Status Area */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center gap-3">
          <div className="relative">
            {currentUser && (
              <>
                <img src={currentUser.avatar} className="w-9 h-9 rounded-full" alt="Me" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-100 rounded-full"></div>
              </>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="font-bold text-sm text-slate-900 truncate">{currentUser?.name || 'Loading...'}</div>
            <div className="text-xs text-slate-500 truncate">Online</div>
          </div>
          <button className="text-slate-500 hover:text-slate-900"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* ================= CENTER: CHAT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Hash size={24} className="text-slate-400" />
            <div>
              <h3 className="font-bold text-slate-900">{activeChannel.name}</h3>
              <p className="text-xs text-slate-500 hidden sm:block">{activeChannel.desc}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* AI Toggle Button */}
            <button 
              onClick={() => setShowAiChat(!showAiChat)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                showAiChat 
                  ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-200' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
              }`}
            >
              <Sparkles size={16} className={showAiChat ? 'animate-pulse' : ''} />
              <span className="text-sm font-bold">Ask AI</span>
            </button>
            
            <Users size={20} className="hover:text-slate-700 cursor-pointer md:hidden text-slate-400" />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => {
            const user = onlineUsers.find(p => p.email === msg.userId) || 
                        { name: 'Unknown', avatar: PRESET_AVATARS[0] };
            const isMe = isCurrentUser(msg.userId);
            return (
              <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''} group`}>
                <img src={user.avatar} className="w-10 h-10 rounded-full shadow-sm mt-1" alt={user.name} />
                
                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-900">{user.name}</span>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-100 focus-within:border-brand-300 transition-all">
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg">
              <Paperclip size={20} />
            </button>
            <input
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
              placeholder={`Message #${activeChannel.name}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg">
              <Smile size={20} />
            </button>
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>

      {/* ================= RIGHT: MEMBERS / AI BOT ================= */}
      <AnimatePresence mode="wait">
        {showAiChat ? (
          /* AI CHATBOT PANEL */
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-slate-200 bg-white flex flex-col z-20 shadow-xl"
          >
            <div className="h-16 bg-gradient-to-r from-brand-600 to-indigo-600 flex items-center justify-between px-4 text-white">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold">Genius Bot</span>
              </div>
              <button onClick={() => setShowAiChat(false)} className="hover:bg-white/20 p-1 rounded"><MoreVertical size={16}/></button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-600 shadow-sm mb-4">
                👋 Hi {currentUser?.name}! I can help you solve doubts, explain concepts, or debug code. Just ask!
              </div>
              {/* Fake AI Conversation would go here */}
            </div>

            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="relative">
                <input 
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-brand-300" 
                  placeholder="Ask a doubt..." 
                />
                <button className="absolute right-2 top-2 text-brand-600"><Send size={16}/></button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* MEMBERS LIST PANEL */
          <div className="w-64 border-l border-slate-200 bg-slate-50 hidden xl:flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Online — {loading ? '...' : onlineUsers.length}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-slate-400 text-sm">Loading...</div>
                </div>
              ) : onlineUsers.length > 0 ? (
                onlineUsers.map(peer => (
                  <div 
                    key={peer.email} 
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer group ${
                      isCurrentUser(peer.email)
                        ? 'bg-brand-50 border border-brand-200 hover:bg-brand-100'
                        : 'hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="relative">
                      <img src={peer.avatar} className="w-8 h-8 rounded-full ring-2 ring-green-400" alt={peer.name} />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800 truncate">
                        {peer.name}
                        {isCurrentUser(peer.email) && <span className="text-xs text-brand-600 ml-1">(You)</span>}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{peer.role}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-slate-400 text-sm text-center">No online users</div>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Workspace;