import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, CheckCircle, AlertCircle, Loader, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const TestSetup = () => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [accountCheck, setAccountCheck] = useState<any>(null);
  const [email1, setEmail1] = useState("adatamia.misplacido@wvsu.edu.ph");
  const [email2, setEmail2] = useState("james.remegio@wvsu.edu.ph");

  const createTestAccounts = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:4000/api/test/create-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.existing && (data.existing.user1 || data.existing.user2)) {
          setResult({
            success: true,
            message: "Test accounts already exist. You can use them to sign in.",
            accounts: {
              user1: { email: "testuser1@wvsu.edu.ph", userId: data.existing.user1 },
              user2: { email: "testuser2@wvsu.edu.ph", userId: data.existing.user2 }
            },
            existing: true
          });
          return;
        }
        throw new Error(data.error || "Failed to create test accounts");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to create test accounts. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const checkAccounts = async () => {
    setChecking(true);
    setError("");
    setAccountCheck(null);

    try {
      const response = await fetch("http://localhost:4000/api/test/check-accounts", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();
      setAccountCheck(data);
    } catch (err: any) {
      setError(err.message || "Failed to check accounts. Make sure the backend is running.");
    } finally {
      setChecking(false);
    }
  };

  const matchUsers = async () => {
    if (!email1 || !email2) {
      setError("Please enter both email addresses");
      return;
    }

    setMatching(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:4000/api/test/match-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email1, email2 })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to match users");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to match users. Make sure the backend is running and both users are registered.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <PageBackground className="flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 border-2 border-rose-pink/30"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-wine-rose mb-2">
            Create Test Accounts
          </h1>
          <p className="text-wine-rose/70 font-body">
            Create two test accounts that are already matched for chat debugging
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

        {accountCheck && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
          >
            <p className="text-blue-600 font-semibold mb-2">Account Status:</p>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">testuser1@wvsu.edu.ph:</span>{" "}
                {accountCheck.user1.exists ? (
                  <span className="text-green-600">✅ Exists (ID: {accountCheck.user1.userId})</span>
                ) : (
                  <span className="text-red-600">❌ Not found</span>
                )}
              </div>
              <div>
                <span className="font-semibold">testuser2@wvsu.edu.ph:</span>{" "}
                {accountCheck.user2.exists ? (
                  <span className="text-green-600">✅ Exists (ID: {accountCheck.user2.userId})</span>
                ) : (
                  <span className="text-red-600">❌ Not found</span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {result && result.matchId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="text-green-600 font-bold text-lg mb-2">Users matched successfully! 💕</p>
                <div className="space-y-3 text-sm">
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="font-semibold text-wine-rose mb-1">User 1:</p>
                    <p className="text-wine-rose/80">Email: <span className="font-mono">{result.user1.email}</span></p>
                    <p className="text-wine-rose/80">Alias: <span className="font-semibold">{result.user1.alias}</span></p>
                    <p className="text-wine-rose/80">User ID: <span className="font-mono text-xs">{result.user1.userId}</span></p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="font-semibold text-wine-rose mb-1">User 2:</p>
                    <p className="text-wine-rose/80">Email: <span className="font-mono">{result.user2.email}</span></p>
                    <p className="text-wine-rose/80">Alias: <span className="font-semibold">{result.user2.alias}</span></p>
                    <p className="text-wine-rose/80">User ID: <span className="font-mono text-xs">{result.user2.userId}</span></p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="font-semibold text-wine-rose mb-1">Match Info:</p>
                    <p className="text-wine-rose/80">Match ID: <span className="font-mono text-xs">{result.matchId}</span></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 font-semibold mb-2">Next Steps:</p>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Both users can now sign in</li>
                <li>They will be redirected to /chat automatically</li>
                <li>They can start chatting immediately!</li>
              </ol>
            </div>
          </motion.div>
        )}

        {result && result.accounts && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl"
          >
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="text-green-600 font-bold text-lg mb-2">Test accounts created successfully!</p>
                <div className="space-y-3 text-sm">
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="font-semibold text-wine-rose mb-1">Account 1:</p>
                    <p className="text-wine-rose/80">Email: <span className="font-mono">{result.accounts.user1.email}</span></p>
                    <p className="text-wine-rose/80">Alias: <span className="font-semibold">{result.accounts.user1.alias}</span></p>
                    <p className="text-wine-rose/80">User ID: <span className="font-mono text-xs">{result.accounts.user1.userId}</span></p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="font-semibold text-wine-rose mb-1">Account 2:</p>
                    <p className="text-wine-rose/80">Email: <span className="font-mono">{result.accounts.user2.email}</span></p>
                    <p className="text-wine-rose/80">Alias: <span className="font-semibold">{result.accounts.user2.alias}</span></p>
                    <p className="text-wine-rose/80">User ID: <span className="font-mono text-xs">{result.accounts.user2.userId}</span></p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="font-semibold text-wine-rose mb-1">Match Info:</p>
                    <p className="text-wine-rose/80">Match ID: <span className="font-mono text-xs">{result.match.matchId}</span></p>
                    <p className="text-wine-rose/80">Compatibility: <span className="font-semibold">{result.match.compatibilityScore}%</span></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 font-semibold mb-2">Next Steps:</p>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Go to the Sign In page</li>
                <li>Enter one of the test emails: <span className="font-mono font-semibold">{result.accounts.user1.email}</span> or <span className="font-mono font-semibold">{result.accounts.user2.email}</span></li>
                <li>Request OTP code (check backend console for the code)</li>
                <li>Enter the OTP code to sign in</li>
                <li>You'll be redirected to the chat page automatically!</li>
              </ol>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={createTestAccounts}
            disabled={loading}
            className="w-full py-4 bg-gradient-primary text-ivory-cream font-bold rounded-xl shadow-soft hover:shadow-rose-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Creating test accounts...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Create Test Accounts</span>
              </>
            )}
          </button>

          <button
            onClick={checkAccounts}
            disabled={checking}
            className="w-full py-3 border-2 border-wine-rose/40 text-wine-rose font-semibold rounded-xl hover:border-wine-rose hover:bg-wine-rose/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <span>Check Existing Accounts</span>
            )}
          </button>

          <div className="pt-4 border-t border-rose-pink/20">
            <h3 className="text-wine-rose font-bold mb-3 text-sm">Match Two Users</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-wine-rose mb-1">Email 1</label>
                <input
                  type="email"
                  value={email1}
                  onChange={(e) => setEmail1(e.target.value)}
                  placeholder="user1@wvsu.edu.ph"
                  className="w-full px-3 py-2 rounded-lg bg-white border-2 border-rose-pink/30 text-wine-rose text-sm focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-wine-rose mb-1">Email 2</label>
                <input
                  type="email"
                  value={email2}
                  onChange={(e) => setEmail2(e.target.value)}
                  placeholder="user2@wvsu.edu.ph"
                  className="w-full px-3 py-2 rounded-lg bg-white border-2 border-rose-pink/30 text-wine-rose text-sm focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                />
              </div>
              <button
                onClick={matchUsers}
                disabled={matching || !email1 || !email2}
                className="w-full py-3 bg-gradient-primary text-ivory-cream font-bold rounded-xl shadow-soft hover:shadow-rose-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {matching ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Matching users...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Match These Users</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <Link
            to="/signin"
            className="block w-full py-3 text-center border-2 border-wine-rose/40 text-wine-rose font-semibold rounded-xl hover:border-wine-rose hover:bg-wine-rose/5 transition-all"
          >
            Go to Sign In
          </Link>

          <Link
            to="/chat-debug"
            className="block w-full py-3 text-center border-2 border-rose-pink/40 text-rose-pink font-semibold rounded-xl hover:border-rose-pink hover:bg-rose-pink/5 transition-all"
          >
            Chat Debug Helper
          </Link>
        </div>
      </motion.div>
    </PageBackground>
  );
};

export default TestSetup;
