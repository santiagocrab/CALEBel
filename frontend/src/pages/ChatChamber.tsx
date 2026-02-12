import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertTriangle, MessageCircle, Star, Heart, X, Clock, CheckCheck, Bug, Copy, RefreshCw, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchMatch, fetchChat, sendChatMessage } from "@/lib/api";
import { PageBackground } from "@/components/PageBackground";

const MAX_MESSAGES = 25;
const MAX_CHARS = 150;
const POLL_INTERVAL = 2000; // Poll every 2 seconds for new messages

interface Message {
  id: string;
  text: string;
  sender: "user" | "match";
  time: string;
  createdAt: string;
}

const ChatChamber = () => {
  const [showMatchInfo, setShowMatchInfo] = useState(true);
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [matchMsgCount, setMatchMsgCount] = useState(0);
  const [matchId, setMatchId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);
  const [debugMessage, setDebugMessage] = useState("");
  const [sendingDebug, setSendingDebug] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const userId = localStorage.getItem("calebelUserId") || "";
  const remaining = MAX_MESSAGES - userMsgCount;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial data
  useEffect(() => {
    const loadMatchAndChat = async () => {
      if (!userId) {
        navigate("/signin");
        return;
      }

      try {
        // Fetch match info first - this will give us matchId if not in localStorage
        const matchData = await fetchMatch(userId);
        if (matchData.status === "matched" && matchData.partner) {
          // Get matchId from API or localStorage
          const currentMatchId = matchData.matchId || localStorage.getItem("calebelMatchId") || "";
          if (!currentMatchId) {
            navigate("/no-partner");
            return;
          }

          // Store matchId in state and localStorage
          setMatchId(currentMatchId);
          if (currentMatchId) {
            localStorage.setItem("calebelMatchId", currentMatchId);
          }

          setMatchInfo({
            alias: matchData.partner.alias || "Your Ka-Label",
            compatibilityScore: matchData.compatibilityScore || 0,
            reasons: matchData.reasons || [],
            partner: matchData.partner
          });

          // Fetch initial chat messages
          await loadMessages(currentMatchId);
        } else {
          navigate("/no-partner");
        }
      } catch (err) {
        console.error("Error loading match/chat:", err);
        navigate("/no-partner");
      } finally {
        setLoading(false);
      }
    };

    loadMatchAndChat();
  }, [userId, navigate]);

  // Poll for new messages
  useEffect(() => {
    if (!matchId || loading) return;

    const pollMessages = async () => {
      try {
        await loadMessages(matchId);
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    };

    const interval = setInterval(pollMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [matchId, loading]);

  const loadMessages = async (currentMatchId: string) => {
    try {
      const chatData = await fetchChat(currentMatchId);
      if (chatData.messages) {
        const formattedMessages: Message[] = chatData.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.senderId === userId ? "user" : "match",
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: msg.createdAt
        }));
        setMessages(formattedMessages);
        
        // Update message counts
        const userCount = formattedMessages.filter((m: Message) => m.sender === "user").length;
        const matchCount = formattedMessages.filter((m: Message) => m.sender === "match").length;
        setUserMsgCount(userCount);
        setMatchMsgCount(matchCount);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const send = async () => {
    if (!input.trim() || remaining <= 0 || !matchId || !userId || sending) return;
    
    const messageText = input.trim().slice(0, MAX_CHARS);
    setInput("");
    setSending(true);
    setError("");
    
    // Optimistically add message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      text: messageText,
      sender: "user",
      time: "Now",
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setUserMsgCount((prev) => prev + 1);

    try {
      await sendChatMessage(matchId, userId, messageText);
      // Reload messages to get the real one
      await loadMessages(matchId);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message. Please try again.");
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      setUserMsgCount((prev) => prev - 1);
    } finally {
      setSending(false);
    }
  };

  const sendDebugMessage = async () => {
    if (!debugMessage.trim() || !matchId || sendingDebug) return;

    setSendingDebug(true);
    setError("");

    try {
      const response = await fetch("http://localhost:4000/api/test/send-message-as-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          message: debugMessage.trim(),
          userId: userId || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send debug message");
      }

      // Clear message and reload chat
      setDebugMessage("");
      await loadMessages(matchId);
      setShowDebug(false);
    } catch (err: any) {
      setError(err.message || "Failed to send debug message");
    } finally {
      setSendingDebug(false);
    }
  };

  if (loading) {
    return (
      <PageBackground className="flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center"
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-wine-rose font-semibold">Loading your match...</p>
        </div>
      </div>
    );
  }

  return (
    <PageBackground className="pt-16 sm:pt-20 pb-4 flex flex-col">
      <div className="container mx-auto px-4 max-w-2xl flex-1 flex flex-col">
        {/* Match Info Card - Collapsible */}
        <AnimatePresence>
          {showMatchInfo && matchInfo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-4 shadow-xl border-2 border-rose-pink/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center shadow-lg">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {matchInfo.alias?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-bold text-wine-rose text-base sm:text-lg">{matchInfo.alias || "Your Ka-Label"}</h2>
                    <div className="flex items-center gap-1 text-rose-pink text-xs sm:text-sm">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      <span className="font-semibold">{matchInfo.compatibilityScore}% Compatible</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMatchInfo(false)}
                  className="text-wine-rose/60 hover:text-wine-rose transition-colors p-1"
                  aria-label="Close match info"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {matchInfo.reasons && matchInfo.reasons.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-wine-rose/70 mb-2">Why you matched:</p>
                  <div className="flex flex-wrap gap-2">
                    {matchInfo.reasons.map((reason: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-rose-pink/20 text-wine-rose rounded-full text-xs font-medium border border-rose-pink/30">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between py-3 border-b-2 border-rose-pink/20 mb-3">
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-wine-rose">CALEBration Chamber</h1>
            <p className="text-xs text-wine-rose/70">
              Chatting with <span className="text-rose-pink font-semibold">{matchInfo?.alias || "Your Ka-Label"}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-sm font-bold font-display ${remaining <= 5 ? "text-red-600" : "text-rose-pink"}`}>
                {remaining}/{MAX_MESSAGES}
              </div>
              <p className="text-[10px] text-wine-rose/60">messages left</p>
            </div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="p-2 rounded-lg bg-rose-pink/10 hover:bg-rose-pink/20 text-rose-pink transition-all"
              title="Toggle debug panel"
            >
              <Bug className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        <AnimatePresence>
          {showDebug && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-blue-50/80 border-2 border-blue-200 rounded-xl p-4 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-blue-800 text-sm">Debug Panel</h3>
                </div>
                <button
                  onClick={() => setShowDebug(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-blue-800 mb-1">
                    Match ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={matchId}
                      readOnly
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-blue-300 text-blue-900 text-xs font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(matchId);
                        setError("");
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-800 transition-all"
                      title="Copy Match ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-800 mb-1">
                    Send Message as Partner (Debug)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={debugMessage}
                      onChange={(e) => setDebugMessage(e.target.value.slice(0, MAX_CHARS))}
                      placeholder="Type a message to send as your match partner..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendDebugMessage();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-blue-300 text-blue-900 text-sm placeholder:text-blue-400"
                      maxLength={MAX_CHARS}
                    />
                    <button
                      onClick={sendDebugMessage}
                      disabled={!debugMessage.trim() || sendingDebug}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {sendingDebug ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {debugMessage.length}/150 chars • This will appear as if sent by your match partner
                  </p>
                </div>

                <div className="pt-2 border-t border-blue-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-blue-700">
                      <RefreshCw className="w-3 h-3" />
                      <span>Messages auto-refresh every 2 seconds</span>
                    </div>
                    <div className="text-blue-600">
                      User ID: <span className="font-mono text-[10px]">{userId.substring(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-rose-pink/20 mb-4">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-pink to-wine-rose"
            initial={{ width: 0 }}
            animate={{ width: `${(userMsgCount / MAX_MESSAGES) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Warning for low messages */}
        <AnimatePresence>
          {remaining <= 5 && remaining > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border-2 border-red-200 mb-3"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs text-red-600 font-semibold">Only {remaining} messages remaining! Make them count.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border-2 border-red-200 mb-3"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs text-red-600 font-semibold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[300px] max-h-[500px] px-1">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-rose-pink/40" />
              <p className="text-wine-rose/70 font-body">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              const showTime = index === 0 || 
                new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000; // 5 minutes
              
              return (
                <div key={msg.id}>
                  {showTime && (
                    <div className="text-center my-2">
                      <span className="text-xs text-wine-rose/50 bg-white/60 px-2 py-1 rounded-full">
                        {new Date(msg.createdAt).toLocaleDateString()} {msg.time}
                      </span>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {matchInfo?.alias?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm shadow-md ${
                      isUser
                        ? "bg-gradient-to-r from-rose-pink to-wine-rose text-white rounded-br-md"
                        : "bg-white/90 text-wine-rose rounded-bl-md border-2 border-rose-pink/20"
                    }`}>
                      <p className="break-words">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] opacity-70">{msg.time}</span>
                        {isUser && (
                          <CheckCheck className="w-3 h-3 opacity-70" />
                        )}
                      </div>
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-wine-rose to-rose-pink flex items-center justify-center text-white text-xs font-bold shadow-md">
                        You
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {remaining > 0 ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message (max 150 chars)..."
                disabled={sending}
                className="w-full px-4 py-3 pr-20 rounded-xl bg-white/95 border-2 border-rose-pink/30 text-wine-rose text-sm focus:outline-none focus:ring-2 focus:ring-rose-pink/40 placeholder:text-wine-rose/40 disabled:opacity-50 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className={`text-xs font-semibold ${input.length >= MAX_CHARS ? "text-red-600" : "text-wine-rose/60"}`}>
                  {input.length}/{MAX_CHARS}
                </span>
              </div>
            </div>
            <motion.button 
              onClick={send} 
              disabled={!input.trim() || remaining <= 0 || sending} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 sm:px-6 rounded-xl bg-gradient-primary text-ivory-cream disabled:opacity-40 hover:shadow-lg transition-all shadow-md flex items-center justify-center min-w-[56px]"
            >
              {sending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        ) : (
          <div className="text-center py-4 bg-white/90 rounded-xl border-2 border-rose-pink/30 shadow-lg">
            <p className="text-sm text-wine-rose font-semibold mb-3">You've used all {MAX_MESSAGES} messages. Time to decide!</p>
            <Link 
              to="/post-chat" 
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-primary text-ivory-cream font-bold text-sm shadow-lg hover:scale-105 transition-transform"
            >
              <Heart className="w-4 h-4" />
              Make Your Decision
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatChamber;
