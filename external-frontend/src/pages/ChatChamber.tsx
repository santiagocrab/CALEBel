import { useState } from "react";
import { motion } from "framer-motion";
import { Send, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const MAX_MESSAGES = 25;
const MAX_CHARS = 150;

interface Message {
  id: number;
  text: string;
  sender: "user" | "match";
  time: string;
}

const ChatChamber = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey there, Ka-Label! 👋", sender: "match", time: "Just now" },
  ]);
  const [input, setInput] = useState("");
  const userMsgCount = messages.filter((m) => m.sender === "user").length;
  const remaining = MAX_MESSAGES - userMsgCount;

  const send = () => {
    if (!input.trim() || remaining <= 0) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text: input.trim().slice(0, MAX_CHARS), sender: "user", time: "Now" },
    ]);
    setInput("");
    // Simulate reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: "That's really interesting! Tell me more 😊", sender: "match", time: "Now" },
      ]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-4 flex flex-col">
      <div className="container mx-auto px-4 max-w-lg flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-3 border-b border-border mb-3">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">CALEBration Chamber</h1>
            <p className="text-xs text-muted-foreground">Chatting with <span className="text-gold font-semibold">MoonlitCoder</span></p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold font-display ${remaining <= 5 ? "text-destructive" : "text-gold"}`}>
              {remaining}/{MAX_MESSAGES}
            </div>
            <p className="text-[10px] text-muted-foreground">messages left</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-muted mb-4">
          <motion.div
            className="h-full rounded-full bg-gradient-gold"
            animate={{ width: `${(userMsgCount / MAX_MESSAGES) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {remaining <= 5 && remaining > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-xs text-destructive">Only {remaining} messages remaining! Make them count.</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender === "user"
                  ? "bg-gradient-gold text-navy-deep rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        {remaining > 0 ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="w-full px-4 py-3 pr-16 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 placeholder:text-muted-foreground"
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${input.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
                {input.length}/{MAX_CHARS}
              </span>
            </div>
            <button onClick={send} disabled={!input.trim()} className="px-4 rounded-xl bg-gradient-gold text-navy-deep disabled:opacity-40 hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">You've used all 25 messages. Time to decide!</p>
            <Link to="/post-chat" className="inline-flex px-6 py-2.5 rounded-full bg-gradient-gold text-navy-deep font-bold text-sm shadow-gold hover:scale-105 transition-transform">
              Make Your Decision
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatChamber;
