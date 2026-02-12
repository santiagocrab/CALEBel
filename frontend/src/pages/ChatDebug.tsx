import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, Loader, CheckCircle, AlertCircle, Copy, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const ChatDebug = () => {
  const [matchId, setMatchId] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Auto-detect match ID from localStorage on component mount
  useEffect(() => {
    const storedMatchId = localStorage.getItem("calebelMatchId");
    const storedUserId = localStorage.getItem("calebelUserId");
    
    if (storedMatchId) {
      setMatchId(storedMatchId);
    }
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const sendMessageAsPartner = async () => {
    if (!matchId || !message.trim()) {
      setError("Please enter matchId and message");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/test/send-message-as-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          matchId, 
          message: message.trim(),
          userId: userId || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setResult(data);
      setMessage(""); // Clear message on success
    } catch (err: any) {
      setError(err.message || "Failed to send message. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground className="flex items-center justify-center p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 border-2 border-rose-pink/30"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-wine-rose mb-2">
            Chat Debug Helper
          </h1>
          <p className="text-wine-rose/70 font-body">
            Send messages as your match partner for testing
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 font-semibold mb-1">Error</p>
              <p className="text-red-600/80 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-green-600 font-semibold mb-1">Message sent successfully!</p>
              <div className="text-sm text-green-700 space-y-1">
                <p>Partner ID: <span className="font-mono text-xs">{result.partnerId}</span></p>
                <p>Partner Alias: <span className="font-semibold">{result.partnerAlias}</span></p>
                <p>Message ID: <span className="font-mono text-xs">{result.messageId}</span></p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-wine-rose mb-2 font-body">
              Match ID <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                placeholder="Match ID will auto-fill if you're signed in..."
                className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose text-sm focus:outline-none focus:ring-2 focus:ring-rose-pink/40 placeholder:text-wine-rose/40 font-mono text-xs"
              />
              <button
                onClick={() => {
                  const stored = localStorage.getItem("calebelMatchId");
                  if (stored) {
                    setMatchId(stored);
                  } else {
                    setError("No match ID found in localStorage. Make sure you're signed in and have a match.");
                  }
                }}
                className="px-4 py-3 rounded-xl bg-rose-pink/20 border-2 border-rose-pink/30 text-rose-pink hover:bg-rose-pink/30 transition-all"
                title="Auto-fill from localStorage"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {matchId && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(matchId);
                    setResult({ ...result, copied: true });
                    setTimeout(() => setResult((prev: any) => prev?.copied ? { ...prev, copied: false } : prev), 2000);
                  }}
                  className="px-4 py-3 rounded-xl bg-wine-rose/20 border-2 border-wine-rose/30 text-wine-rose hover:bg-wine-rose/30 transition-all"
                  title="Copy match ID"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-wine-rose/60">
                {matchId ? (
                  <span className="text-green-600 font-semibold">✅ Match ID detected: {matchId.substring(0, 8)}...</span>
                ) : (
                  <span className="text-rose-pink">⚠️ No match ID found. Make sure you're signed in and have a match.</span>
                )}
              </p>
              <p className="text-xs text-wine-rose/60">
                Get it manually: Open browser console (F12) and type: <code className="bg-rose-pink/10 px-1 rounded">localStorage.getItem("calebelMatchId")</code>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-wine-rose mb-2 font-body">
              Your User ID (Optional - Auto-filled)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Your user ID (auto-filled if signed in)"
                className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose text-sm focus:outline-none focus:ring-2 focus:ring-rose-pink/40 placeholder:text-wine-rose/40 font-mono text-xs"
              />
              <button
                onClick={() => {
                  const stored = localStorage.getItem("calebelUserId");
                  if (stored) {
                    setUserId(stored);
                  }
                }}
                className="px-4 py-3 rounded-xl bg-rose-pink/20 border-2 border-rose-pink/30 text-rose-pink hover:bg-rose-pink/30 transition-all"
                title="Auto-fill from localStorage"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-wine-rose/60 mt-1">
              {userId ? (
                <span className="text-green-600">✅ User ID detected: {userId.substring(0, 8)}...</span>
              ) : (
                "If provided, the other user in the match will be used as the partner"
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-wine-rose mb-2 font-body">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 150))}
              placeholder="Type a message to send as your match partner..."
              rows={3}
              maxLength={150}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose text-sm focus:outline-none focus:ring-2 focus:ring-rose-pink/40 placeholder:text-wine-rose/40 resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-wine-rose/60">
                {message.length}/150 characters
              </p>
              <p className="text-xs text-wine-rose/60">
                This message will appear as if sent by your match partner
              </p>
            </div>
          </div>

          <button
            onClick={sendMessageAsPartner}
            disabled={loading || !matchId || !message.trim()}
            className="w-full py-4 bg-gradient-primary text-ivory-cream font-bold rounded-xl shadow-soft hover:shadow-rose-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Sending message...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Message as Partner</span>
              </>
            )}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-blue-800 font-semibold mb-2 text-sm">📋 What is Match ID?</p>
            <p className="text-blue-700 text-xs mb-2">
              The <strong>Match ID</strong> is a unique identifier for your match. It's automatically stored when you:
            </p>
            <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside mb-3">
              <li>Sign in and have a match</li>
              <li>Visit the chat page</li>
              <li>View your match result</li>
            </ul>
            <p className="text-blue-800 font-semibold mb-2 text-sm">🚀 How to use:</p>
            <ol className="text-blue-700 text-xs space-y-1 list-decimal list-inside">
              <li>The Match ID should auto-fill if you're signed in (click the refresh button if it doesn't)</li>
              <li>If not auto-filled, open browser console (F12) and type: <code className="bg-blue-100 px-1 rounded">localStorage.getItem("calebelMatchId")</code></li>
              <li>Type a message below</li>
              <li>Click "Send Message as Partner"</li>
              <li>Go back to your chat page - the message should appear as if sent by your match!</li>
            </ol>
          </div>

          <Link
            to="/chat"
            className="block w-full py-3 text-center border-2 border-wine-rose/40 text-wine-rose font-semibold rounded-xl hover:border-wine-rose hover:bg-wine-rose/5 transition-all"
          >
            Go to Chat
          </Link>
        </div>
      </motion.div>
    </PageBackground>
  );
};

export default ChatDebug;
