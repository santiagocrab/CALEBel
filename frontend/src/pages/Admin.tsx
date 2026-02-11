import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  Heart,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Loader,
  Shield
} from "lucide-react";

interface User {
  id: string;
  alias: string;
  email: string;
  fullName: string;
  college: string;
  course: string;
  yearLevel: string;
  status: string;
  paymentStatus: string;
  verificationStatus: string;
  gcashRef: string;
  gcashAccount: string;
  paymentProofUrl: string | null;
  createdAt: string;
  sogiesc: any;
  personality: any;
  loveLanguages: { receive: string[]; provide: string[] };
  interests: string[];
  preferred: any;
}

interface Match {
  id: string;
  user1: { id: string; alias: string; email: string };
  user2: { id: string; alias: string; email: string };
  compatibilityScore: number;
  reasons: string[];
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  waitingUsers: number;
  matchedUsers: number;
  totalMatches: number;
  verifiedPayments: number;
  unverifiedPayments: number;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"users" | "matches" | "stats">("users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [matchingUsers, setMatchingUsers] = useState<{ user1: string; user2: string } | null>(null);
  const [compatibilitySuggestions, setCompatibilitySuggestions] = useState<Record<string, any[]>>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError("");
      
      // Check if backend is reachable first
      try {
        await fetch("http://localhost:4000/health", { method: "GET", signal: AbortSignal.timeout(3000) });
      } catch (healthErr) {
        throw new Error("Cannot connect to backend server. Please make sure the backend is running on port 4000.");
      }

      const [usersRes, matchesRes, statsRes] = await Promise.all([
        fetch("http://localhost:4000/api/admin/users", { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).catch((e) => {
          throw new Error(`Failed to fetch users: ${e.message}`);
        }),
        fetch("http://localhost:4000/api/admin/matches", { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).catch((e) => {
          throw new Error(`Failed to fetch matches: ${e.message}`);
        }),
        fetch("http://localhost:4000/api/admin/stats", { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).catch((e) => {
          throw new Error(`Failed to fetch stats: ${e.message}`);
        })
      ]);

      if (!usersRes.ok) {
        const error = await usersRes.json().catch(() => ({}));
        throw new Error(error.error || `Failed to load users: ${usersRes.status}`);
      }
      if (!matchesRes.ok) {
        const error = await matchesRes.json().catch(() => ({}));
        throw new Error(error.error || `Failed to load matches: ${matchesRes.status}`);
      }
      if (!statsRes.ok) {
        const error = await statsRes.json().catch(() => ({}));
        throw new Error(error.error || `Failed to load stats: ${statsRes.status}`);
      }

      const usersData = await usersRes.json();
      const matchesData = await matchesRes.json();
      const statsData = await statsRes.json();

      setUsers(usersData.users || []);
      setMatches(matchesData.matches || []);
      setStats(statsData);
      setError(""); // Clear any previous errors
    } catch (err: any) {
      console.error("Error loading admin data:", err);
      setError(err.message || "Failed to load admin data. Make sure the backend is running on port 4000.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (userId: string, verified: boolean) => {
    try {
      const response = await fetch("http://localhost:4000/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, verified })
      });

      if (!response.ok) {
        throw new Error("Failed to verify payment");
      }

      await loadData(); // Refresh data
    } catch (err: any) {
      setError(err.message || "Failed to verify payment");
    }
  };

  const loadCompatibilitySuggestions = async (userId: string) => {
    if (loadingSuggestions[userId]) {
      console.log("Already loading suggestions for user:", userId);
      return;
    }

    console.log("Loading compatibility suggestions for user:", userId);
    setLoadingSuggestions((prev) => ({ ...prev, [userId]: true }));
    setError(""); // Clear previous errors
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/compatibility-suggestions/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load suggestions: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Compatibility suggestions loaded:", data);
      
      setCompatibilitySuggestions((prev) => ({ 
        ...prev, 
        [userId]: data.suggestions || [] 
      }));
    } catch (err: any) {
      console.error("Error loading compatibility suggestions:", err);
      setError(err.message || "Failed to load compatibility suggestions. Make sure the backend is running.");
    } finally {
      setLoadingSuggestions((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const calculateCompatibility = async (userId1: string, userId2: string) => {
    setCalculating(true);
    setCompatibilityResult(null);
    try {
      const response = await fetch("http://localhost:4000/api/admin/calculate-compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId1, userId2 })
      });

      if (!response.ok) {
        throw new Error("Failed to calculate compatibility");
      }

      const data = await response.json();
      setCompatibilityResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to calculate compatibility");
    } finally {
      setCalculating(false);
    }
  };

  const createMatch = async (userId1: string, userId2: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/admin/create-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId1, userId2 })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create match");
      }

      const data = await response.json();
      setError("");
      setMatchingUsers(null);
      setCompatibilityResult(null);
      await loadData(); // Refresh data
      alert(`✅ Match created successfully! Compatibility: ${data.compatibilityScore}%`);
    } catch (err: any) {
      setError(err.message || "Failed to create match");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blush-pink via-rose-pink/20 to-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 mx-auto mb-4 text-rose-pink animate-spin" />
          <p className="text-wine-rose font-semibold">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-pink via-rose-pink/20 to-ivory-cream pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border-2 border-rose-pink/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-wine-rose">Admin Panel</h1>
                <p className="text-wine-rose/70">Manage registrants, payments, and matches</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-rose-pink/10 text-rose-pink rounded-lg hover:bg-rose-pink/20 transition-all"
            >
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-rose-pink/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-rose-pink" />
                <p className="text-xs text-wine-rose/70">Total Users</p>
              </div>
              <p className="text-2xl font-bold text-wine-rose">{stats.totalUsers}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-rose-pink/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-xs text-wine-rose/70">Waiting</p>
              </div>
              <p className="text-2xl font-bold text-wine-rose">{stats.waitingUsers}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-rose-pink/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-rose-pink" />
                <p className="text-xs text-wine-rose/70">Matched</p>
              </div>
              <p className="text-2xl font-bold text-wine-rose">{stats.matchedUsers}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-rose-pink/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <p className="text-xs text-wine-rose/70">Matches</p>
              </div>
              <p className="text-2xl font-bold text-wine-rose">{stats.totalMatches}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-rose-pink/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-xs text-wine-rose/70">Verified</p>
              </div>
              <p className="text-2xl font-bold text-wine-rose">{stats.verifiedPayments}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-rose-pink/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-xs text-wine-rose/70">Unverified</p>
              </div>
              <p className="text-2xl font-bold text-wine-rose">{stats.unverifiedPayments}</p>
            </motion.div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="text-red-600 font-semibold">Error</p>
              <p className="text-red-600/80 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-rose-pink/30 mb-6">
          <div className="flex gap-4 mb-6 border-b-2 border-rose-pink/20">
            <button
              onClick={() => setSelectedTab("users")}
              className={`px-6 py-3 font-semibold transition-all ${
                selectedTab === "users"
                  ? "text-rose-pink border-b-2 border-rose-pink"
                  : "text-wine-rose/60 hover:text-wine-rose"
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setSelectedTab("matches")}
              className={`px-6 py-3 font-semibold transition-all ${
                selectedTab === "matches"
                  ? "text-rose-pink border-b-2 border-rose-pink"
                  : "text-wine-rose/60 hover:text-wine-rose"
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Matches ({matches.length})
            </button>
            <button
              onClick={() => setSelectedTab("stats")}
              className={`px-6 py-3 font-semibold transition-all ${
                selectedTab === "stats"
                  ? "text-rose-pink border-b-2 border-rose-pink"
                  : "text-wine-rose/60 hover:text-wine-rose"
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Statistics
            </button>
          </div>

          {/* Users Tab */}
          {selectedTab === "users" && (
            <div>
              <div className="mb-4 flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wine-rose/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by email, name, or alias..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 rounded-xl p-4 border-2 border-rose-pink/20 hover:border-rose-pink/40 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-wine-rose">{user.alias}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.status === "matched"
                                ? "bg-green-100 text-green-700"
                                : user.status === "waiting"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>
                        <p className="text-sm text-wine-rose/70 mb-1">
                          <span className="font-semibold">Email:</span> {user.email}
                        </p>
                        <p className="text-sm text-wine-rose/70 mb-1">
                          <span className="font-semibold">Name:</span> {user.fullName}
                        </p>
                        <p className="text-sm text-wine-rose/70 mb-1">
                          <span className="font-semibold">College:</span> {user.college} - {user.course} ({user.yearLevel})
                        </p>
                        <p className="text-sm text-wine-rose/70 mb-1">
                          <span className="font-semibold">GCash Ref:</span> {user.gcashRef}
                        </p>
                        <p className="text-sm text-wine-rose/70 mb-2">
                          <span className="font-semibold">GCash Account:</span> {user.gcashAccount || "N/A"}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-wine-rose/70">Payment:</span>
                            {user.paymentStatus === "verified" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span
                              className={`text-xs font-semibold ${
                                user.paymentStatus === "verified" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {user.paymentStatus}
                            </span>
                          </div>
                          {user.paymentProofUrl && (
                            <a
                              href={user.paymentProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-rose-pink hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Proof
                            </a>
                          )}
                        </div>
                        {/* Compatibility Suggestions */}
                        {compatibilitySuggestions[user.id] && compatibilitySuggestions[user.id].length > 0 && (
                          <div className="mt-3 pt-3 border-t border-rose-pink/20">
                            <p className="text-xs font-semibold text-wine-rose mb-2">Compatibility Suggestions:</p>
                            <div className="space-y-2">
                              {compatibilitySuggestions[user.id].slice(0, 3).map((suggestion: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-rose-pink/10 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-wine-rose">{suggestion.alias}</p>
                                    <p className="text-xs text-wine-rose/70">{suggestion.email}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-rose-pink">{suggestion.compatibilityScore}%</p>
                                    <button
                                      onClick={() => {
                                        setMatchingUsers({ user1: user.id, user2: suggestion.userId });
                                        calculateCompatibility(user.id, suggestion.userId);
                                      }}
                                      className="text-xs text-blue-600 hover:underline mt-1"
                                    >
                                      Match
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {loadingSuggestions[user.id] && (
                          <div className="mt-3 pt-3 border-t border-rose-pink/20">
                            <Loader className="w-4 h-4 animate-spin text-rose-pink mx-auto" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {user.paymentStatus !== "verified" && (
                          <>
                            <button
                              onClick={() => verifyPayment(user.id, true)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-all"
                            >
                              Verify Payment
                            </button>
                            <button
                              onClick={() => verifyPayment(user.id, false)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-all"
                            >
                              Reject Payment
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setMatchingUsers({ user1: user.id, user2: "" });
                            loadCompatibilitySuggestions(user.id);
                          }}
                          className="px-3 py-1.5 bg-rose-pink text-white rounded-lg text-xs font-semibold hover:bg-wine-rose transition-all"
                        >
                          Match User
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("View Suggestions clicked for user:", user.id);
                            loadCompatibilitySuggestions(user.id);
                          }}
                          disabled={loadingSuggestions[user.id]}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          {loadingSuggestions[user.id] ? (
                            <>
                              <Loader className="w-3 h-3 animate-spin" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            "View Suggestions"
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Matches Tab */}
          {selectedTab === "matches" && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {matches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 rounded-xl p-4 border-2 border-rose-pink/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-wine-rose">{match.user1.alias}</span>
                        <Heart className="w-4 h-4 text-rose-pink" />
                        <span className="font-bold text-wine-rose">{match.user2.alias}</span>
                      </div>
                      <p className="text-sm text-wine-rose/70 mb-1">
                        {match.user1.email} ↔ {match.user2.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-wine-rose">Compatibility:</span>
                        <span className="text-sm font-bold text-rose-pink">{match.compatibilityScore}%</span>
                      </div>
                      {match.reasons.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {match.reasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-rose-pink/20 text-wine-rose rounded-full text-xs"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Stats Tab */}
          {selectedTab === "stats" && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-xl p-4 border-2 border-rose-pink/20">
                  <p className="text-sm font-semibold text-wine-rose/70 mb-2">Payment Verification Rate</p>
                  <p className="text-3xl font-bold text-wine-rose">
                    {stats.totalUsers > 0
                      ? Math.round((stats.verifiedPayments / stats.totalUsers) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border-2 border-rose-pink/20">
                  <p className="text-sm font-semibold text-wine-rose/70 mb-2">Match Rate</p>
                  <p className="text-3xl font-bold text-wine-rose">
                    {stats.totalUsers > 0
                      ? Math.round((stats.matchedUsers / stats.totalUsers) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Match Users Modal */}
        {matchingUsers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setMatchingUsers(null);
              setCompatibilityResult(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-wine-rose mb-4">Match Users</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-wine-rose mb-2">User 1 (Selected)</label>
                  <input
                    type="text"
                    value={users.find((u) => u.id === matchingUsers.user1)?.alias || ""}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 border-2 border-rose-pink/30 text-wine-rose"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-wine-rose mb-2">User 2</label>
                  <select
                    value={matchingUsers.user2}
                    onChange={(e) =>
                      setMatchingUsers({ ...matchingUsers, user2: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                  >
                    <option value="">Select a user...</option>
                    {users
                      .filter((u) => u.id !== matchingUsers.user1 && u.status !== "matched")
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.alias} ({user.email})
                        </option>
                      ))}
                  </select>
                </div>
                {matchingUsers.user2 && (
                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        calculateCompatibility(matchingUsers.user1, matchingUsers.user2)
                      }
                      disabled={calculating}
                      className="w-full px-4 py-2 bg-rose-pink text-white rounded-lg font-semibold hover:bg-wine-rose transition-all disabled:opacity-50"
                    >
                      {calculating ? (
                        <>
                          <Loader className="w-4 h-4 inline animate-spin mr-2" />
                          Calculating...
                        </>
                      ) : (
                        "Calculate Compatibility"
                      )}
                    </button>
                    {compatibilityResult && (
                      <div className="bg-rose-pink/10 rounded-lg p-4 border-2 border-rose-pink/30">
                        <p className="text-lg font-bold text-wine-rose mb-2">
                          Compatibility: {compatibilityResult.compatibilityScore}%
                        </p>
                        <div className="space-y-1">
                          {compatibilityResult.reasons.map((reason: string, idx: number) => (
                            <p key={idx} className="text-sm text-wine-rose/70">
                              • {reason}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => createMatch(matchingUsers.user1, matchingUsers.user2)}
                      className="w-full px-4 py-2 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Create Match
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setMatchingUsers(null);
                  setCompatibilityResult(null);
                }}
                className="mt-4 w-full px-4 py-2 border-2 border-rose-pink/30 text-rose-pink rounded-lg font-semibold hover:bg-rose-pink/10 transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Admin;
