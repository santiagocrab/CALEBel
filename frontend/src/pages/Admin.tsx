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
  Shield,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";
import { PageBackground } from "@/components/PageBackground";

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

interface RematchRequest {
  id: string;
  userId: string;
  alias: string;
  email: string;
  gcashRef: string;
  paymentProofUrl: string;
  status: string;
  createdAt: string;
}

const Admin = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "";
  const resolveProofUrl = (proofUrl: string | null) => {
    if (!proofUrl) return null;
    
    // If it's already a full URL
    if (proofUrl.startsWith("http://") || proofUrl.startsWith("https://")) {
      // If it's a backend URL (onrender.com), convert to use /api proxy
      if (proofUrl.includes("onrender.com") || proofUrl.includes("localhost:4000") || proofUrl.includes("localhost:1000")) {
        // Extract the path from the URL (e.g., /uploads/filename.jpg)
        const urlObj = new URL(proofUrl);
        const path = urlObj.pathname;
        // Use the /api proxy route
        return `/api${path}`;
      }
      // If it's already a valid external URL, use it as-is
      return proofUrl;
    }
    
    // If it's a relative path starting with /uploads/
    if (proofUrl.startsWith("/uploads/")) {
      // Use the /api proxy route
      return `/api${proofUrl}`;
    }
    
    // If it's just a filename or path without leading slash
    if (proofUrl.includes("uploads/") || proofUrl.match(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/)) {
      return `/api/uploads/${proofUrl.replace(/^.*uploads\//, "")}`;
    }
    
    return proofUrl;
  };

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rematchRequests, setRematchRequests] = useState<RematchRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"users" | "matches" | "stats" | "rematch">("users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<any>(null);
  const [matchingUsers, setMatchingUsers] = useState<{ user1: string; user2: string } | null>(null);
  const [compatibilitySuggestions, setCompatibilitySuggestions] = useState<Record<string, any[]>>({});
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<string, boolean>>({});

  // Check if already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (username === "admin" && password === "cictsc123") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");
    } else {
      setAuthError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
    setUsername("");
    setPassword("");
  };

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
        await fetch("/health", { method: "GET", signal: AbortSignal.timeout(3000) });
      } catch (healthErr) {
        throw new Error("Cannot connect to backend server. Please make sure the backend is running.");
      }

      const [usersRes, matchesRes, statsRes, rematchRes] = await Promise.all([
        fetch("/api/admin/users", { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).catch((e) => {
          throw new Error(`Failed to fetch users: ${e.message}`);
        }),
        fetch("/api/admin/matches", { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).catch((e) => {
          throw new Error(`Failed to fetch matches: ${e.message}`);
        }),
        fetch("/api/admin/stats", { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).catch((e) => {
          throw new Error(`Failed to fetch stats: ${e.message}`);
        }),
        fetch("/api/rematch/requests", { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }).catch((e) => {
          console.warn("Failed to fetch rematch requests:", e);
          return { ok: true, json: async () => ({ requests: [], total: 0 }) };
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
      const rematchData = await rematchRes.json();

      setUsers(usersData.users || []);
      setMatches(matchesData.matches || []);
      setRematchRequests(rematchData.requests || []);
      setStats(statsData);
      setError(""); // Clear any previous errors
    } catch (err: any) {
      console.error("Error loading admin data:", err);
      setError(err.message || "Failed to load admin data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (userId: string, verified: boolean) => {
    try {
      const response = await fetch("/api/admin/verify-payment", {
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
      const response = await fetch(`/api/admin/compatibility-suggestions/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load suggestions: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Compatibility suggestions loaded:", data);
      
      const suggestions = data.suggestions || [];
      if (suggestions.length === 0) {
        console.warn(`No compatibility suggestions found for user ${userId}`);
        setError(`No compatible users found. Try adjusting the search criteria or verify that there are other users in the system.`);
      }
      
      setCompatibilitySuggestions((prev) => ({ 
        ...prev, 
        [userId]: suggestions
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
      const response = await fetch("/api/admin/calculate-compatibility", {
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
      const response = await fetch("/api/admin/create-match", {
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

  const verifyRematchPayment = async (requestId: string, verified: boolean) => {
    try {
      const response = await fetch("/api/rematch/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, verified })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify rematch payment");
      }

      const data = await response.json();
      setError("");
      await loadData(); // Refresh data
      alert(verified 
        ? `✅ Rematch payment verified! ${data.matched ? "Match found immediately!" : "User is now in matching queue."}`
        : "❌ Rematch payment rejected."
      );
    } catch (err: any) {
      setError(err.message || "Failed to verify rematch payment");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <PageBackground className="flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-rose-pink/30 max-w-md w-full mx-4"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-wine-rose mb-2">Admin Login</h1>
            <p className="text-wine-rose/70">Enter your credentials to access the admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm">
                {authError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-wine-rose mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wine-rose mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-rose-pink to-wine-rose text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
            >
              Login
            </button>
          </form>
        </motion.div>
      </PageBackground>
    );
  }

  if (loading) {
    return (
      <PageBackground className="flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 mx-auto mb-4 text-rose-pink animate-spin" />
          <p className="text-wine-rose font-semibold">Loading admin panel...</p>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground className="pt-20 pb-8">
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
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-all font-semibold"
              >
                Logout
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-rose-pink/10 text-rose-pink rounded-lg hover:bg-rose-pink/20 transition-all"
              >
                Refresh
              </button>
            </div>
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
            <button
              onClick={() => setSelectedTab("rematch")}
              className={`px-6 py-3 font-semibold transition-all ${
                selectedTab === "rematch"
                  ? "text-rose-pink border-b-2 border-rose-pink"
                  : "text-wine-rose/60 hover:text-wine-rose"
              }`}
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              Rematch Requests ({rematchRequests.filter(r => r.status === "pending").length})
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
                              href={resolveProofUrl(user.paymentProofUrl) || undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-rose-pink hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Proof
                            </a>
                          )}
                        </div>
                        {/* Compatibility Suggestions - Enhanced UI */}
                        {compatibilitySuggestions[user.id] && compatibilitySuggestions[user.id].length > 0 ? (
                          <div className="mt-4 pt-4 border-t-2 border-rose-pink/30">
                            <div className="flex items-center gap-2 mb-3">
                              <Heart className="w-4 h-4 text-rose-pink" />
                              <p className="text-sm font-bold text-wine-rose">Top Compatibility Matches</p>
                            </div>
                            <div className="space-y-3">
                              {compatibilitySuggestions[user.id].slice(0, 5).map((suggestion: any, idx: number) => {
                                const scoreColor = 
                                  suggestion.compatibilityScore >= 80 ? "from-green-500 to-emerald-600" :
                                  suggestion.compatibilityScore >= 60 ? "from-rose-pink to-wine-rose" :
                                  "from-yellow-500 to-orange-500";
                                
                                return (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative overflow-hidden rounded-xl border-2 border-rose-pink/30 bg-gradient-to-br from-white/90 to-rose-pink/5 hover:border-rose-pink/50 transition-all shadow-md hover:shadow-lg"
                                  >
                                    <div className="p-4">
                                      <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-wine-rose text-sm">{suggestion.alias}</h4>
                                            {idx === 0 && (
                                              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                                                BEST MATCH
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs text-wine-rose/60 mb-2">{suggestion.email}</p>
                                          
                                          {/* Compatibility Score Badge */}
                                          <div className="inline-flex items-center gap-2 mb-2">
                                            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${scoreColor} text-white font-bold text-xs shadow-lg`}>
                                              {suggestion.compatibilityScore}% Match
                                            </div>
                                            {suggestion.personality?.mbti && (
                                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                {suggestion.personality.mbti}
                                              </span>
                                            )}
                                          </div>

                                          {/* Reasons */}
                                          <div className="flex flex-wrap gap-1.5 mt-2">
                                            {suggestion.reasons.slice(0, 3).map((reason: string, rIdx: number) => (
                                              <span
                                                key={rIdx}
                                                className="px-2 py-0.5 bg-rose-pink/20 text-wine-rose rounded-full text-xs"
                                              >
                                                {reason}
                                              </span>
                                            ))}
                                          </div>

                                          {/* Common Interests */}
                                          {suggestion.commonInterests && suggestion.commonInterests.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-rose-pink/20">
                                              <p className="text-xs font-semibold text-wine-rose/70 mb-1">Shared Interests:</p>
                                              <div className="flex flex-wrap gap-1">
                                                {suggestion.commonInterests.slice(0, 4).map((interest: string, iIdx: number) => (
                                                  <span
                                                    key={iIdx}
                                                    className="px-2 py-0.5 bg-gradient-to-r from-rose-pink/30 to-wine-rose/30 text-wine-rose rounded text-xs font-medium"
                                                  >
                                                    {interest}
                                                  </span>
                                                ))}
                                                {suggestion.commonInterests.length > 4 && (
                                                  <span className="px-2 py-0.5 text-wine-rose/60 text-xs">
                                                    +{suggestion.commonInterests.length - 4} more
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {/* Action Button */}
                                        <button
                                          onClick={() => {
                                            setMatchingUsers({ user1: user.id, user2: suggestion.userId });
                                            calculateCompatibility(user.id, suggestion.userId);
                                          }}
                                          className="px-4 py-2 bg-gradient-to-r from-rose-pink to-wine-rose text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all hover:scale-105 shrink-0"
                                        >
                                          Match Now
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Score Bar */}
                                    <div className="h-1.5 bg-wine-rose/10">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${suggestion.compatibilityScore}%` }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        className={`h-full bg-gradient-to-r ${scoreColor}`}
                                      />
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        ) : compatibilitySuggestions[user.id] && compatibilitySuggestions[user.id].length === 0 && !loadingSuggestions[user.id] ? (
                          <div className="mt-4 pt-4 border-t-2 border-rose-pink/30">
                            <div className="text-center py-4">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-wine-rose/50" />
                              <p className="text-sm text-wine-rose/70 font-semibold">No compatible users found</p>
                              <p className="text-xs text-wine-rose/50 mt-1">Try again later or manually match users</p>
                            </div>
                          </div>
                        ) : null}
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

          {/* Rematch Requests Tab */}
          {selectedTab === "rematch" && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {rematchRequests.length === 0 ? (
                <div className="text-center py-12 text-wine-rose/70">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 text-wine-rose/40" />
                  <p className="font-semibold">No rematch requests yet</p>
                  <p className="text-sm mt-2">Rematch requests will appear here when users submit them.</p>
                </div>
              ) : (
                rematchRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 rounded-xl p-6 border-2 border-rose-pink/20 hover:border-rose-pink/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-wine-rose text-lg">{request.alias}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                                : request.status === "verified"
                                ? "bg-green-100 text-green-700 border-2 border-green-300"
                                : "bg-red-100 text-red-700 border-2 border-red-300"
                            }`}
                          >
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-wine-rose/70">
                            <span className="font-semibold">Email:</span> {request.email}
                          </p>
                          <p className="text-sm text-wine-rose/70">
                            <span className="font-semibold">GCash Reference:</span>{" "}
                            <span className="font-mono bg-wine-rose/10 px-2 py-1 rounded">{request.gcashRef}</span>
                          </p>
                          <p className="text-sm text-wine-rose/70">
                            <span className="font-semibold">Requested:</span>{" "}
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {request.paymentProofUrl && (
                          <div className="mt-4 p-4 bg-rose-pink/10 rounded-xl border-2 border-rose-pink/20">
                            <div className="flex items-center gap-2 mb-2">
                              <ImageIcon className="w-4 h-4 text-rose-pink" />
                              <span className="text-sm font-semibold text-wine-rose">Payment Proof</span>
                            </div>
                            <a
                              href={resolveProofUrl(request.paymentProofUrl) || undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-rose-pink hover:text-wine-rose font-semibold hover:underline"
                            >
                              <Eye className="w-4 h-4" />
                              View Payment Screenshot
                            </a>
                          </div>
                        )}
                      </div>
                      {request.status === "pending" && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => verifyRematchPayment(request.id, true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Verify Payment
                          </button>
                          <button
                            onClick={() => verifyRematchPayment(request.id, false)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Payment
                          </button>
                        </div>
                      )}
                      {request.status === "verified" && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <CheckCircle className="w-5 h-5" />
                          <span>Verified</span>
                        </div>
                      )}
                      {request.status === "rejected" && (
                        <div className="flex items-center gap-2 text-red-600 font-semibold">
                          <XCircle className="w-5 h-5" />
                          <span>Rejected</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
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
    </PageBackground>
  );
};

export default Admin;
