import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { requestSignIn, verifySignIn, fetchMatch } from "@/lib/api";
import LoadingScreen from "@/components/LoadingScreen";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async () => {
    if (!email || !email.includes("@wvsu.edu.ph")) {
      setError("Please enter a valid WVSU email address.");
      return;
    }

    setLoading(true);
    setError("");
    setAccountNotFound(false);
    try {
      await requestSignIn(email);
      setStage("otp");
      setError("");
    } catch (err) {
      console.error("Sign-in error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send sign-in code. Please check if the backend is running.";
      
      const isAccountNotFound = 
        message.toLowerCase().includes("no account found") ||
        message.toLowerCase().includes("couldn't find account") ||
        message.toLowerCase().includes("account not found") ||
        message.toLowerCase().includes("please register first");
      
      if (isAccountNotFound) {
        setAccountNotFound(true);
        setError("");
      } else {
        setError(message);
        setAccountNotFound(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await verifySignIn(email, otp);
      console.log("Sign-in result:", result);
      
      if (result.userId) {
        localStorage.setItem("calebelUserId", result.userId);
      }
      
      const userStatus = result.status?.toLowerCase() || "";
      console.log("User status:", userStatus);
      
      try {
        const matchData = await fetchMatch(result.userId);
        console.log("Match data:", matchData);
        
        if (matchData && matchData.status === "matched" && matchData.matchId) {
          localStorage.setItem("calebelMatchId", matchData.matchId);
          if (matchData.partner?.alias) {
            localStorage.setItem("calebelMatchAlias", matchData.partner.alias);
          }
          if (matchData.compatibilityScore) {
            localStorage.setItem("calebelCompatibilityScore", String(matchData.compatibilityScore));
          }
          setTimeout(() => {
            navigate("/chat");
          }, 1000);
          return;
        }
      } catch (matchErr) {
        console.error("Error fetching match:", matchErr);
      }
      
      if (userStatus === "matched") {
        console.log("Status is matched, navigating to chat");
        setTimeout(() => {
          navigate("/chat");
        }, 1000);
      } else {
        console.log(`Status is "${userStatus}", navigating to no-partner page`);
        setTimeout(() => {
          navigate("/no-partner");
        }, 1000);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError("");
    try {
      await requestSignIn(email);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  if (loading && stage === "otp" && otp.length === 6) {
    return <LoadingScreen message="Verifying your code..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-pink via-ivory-cream to-blush-pink flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-ivory-cream rounded-3xl shadow-soft p-8 border border-rose-pink/20">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-wine-rose/60 hover:text-wine-rose mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-body">Back to home</span>
            </Link>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-rose-pink" />
              <h1 className="font-display text-3xl font-bold text-wine-rose">
                Welcome Back
              </h1>
            </div>
            <p className="text-wine-rose/70 font-body">
              {stage === "email"
                ? "Enter your WVSU account email and we'll send your 6-digit OTP."
                : "Enter the OTP we sent to your WVSU email, then continue to your match and chat."}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-pink/10 border border-rose-pink/30 rounded-xl text-wine-rose text-sm font-body"
            >
              {error}
            </motion.div>
          )}

          {accountNotFound && stage === "email" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-pink/10 border-2 border-rose-pink/40 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-pink/20 flex items-center justify-center mt-0.5">
                  <span className="text-rose-pink text-sm">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-wine-rose font-body mb-2">
                    Couldn't find account
                  </p>
                  <p className="text-sm text-wine-rose/80 font-body mb-4">
                    We couldn't find an account with this email address. Please register first to create your CALEBel account.
                  </p>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full py-3 bg-gradient-primary text-ivory-cream font-bold rounded-lg hover:shadow-rose-glow transition-all shadow-soft"
                  >
                    Go to Registration
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {stage === "email" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-wine-rose mb-2 font-body">
                  WVSU Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-pink/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@wvsu.edu.ph"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-rose-pink/20 rounded-xl text-wine-rose placeholder-wine-rose/40 focus:outline-none focus:border-rose-pink focus:ring-2 focus:ring-rose-pink/20 transition-all font-body"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRequestOTP();
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleRequestOTP}
                disabled={loading || !email}
                className="w-full py-3.5 bg-gradient-primary text-ivory-cream font-bold rounded-xl shadow-soft hover:shadow-rose-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2 relative z-10"
                style={{ minHeight: '48px' }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-ivory-cream/30 border-t-ivory-cream rounded-full animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Send Sign-In Code</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {stage === "otp" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-wine-rose mb-2 font-body">
                  Verification Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-pink/60" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(val);
                    }}
                    placeholder="000000"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-rose-pink/20 rounded-xl text-wine-rose placeholder-wine-rose/40 focus:outline-none focus:border-rose-pink focus:ring-2 focus:ring-rose-pink/20 transition-all text-center text-2xl tracking-widest font-mono font-bold"
                    maxLength={6}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleVerifyOTP();
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-wine-rose/60 font-body">
                  Code sent to <span className="font-semibold">{email}</span>
                </p>
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 bg-gradient-primary text-ivory-cream font-bold rounded-xl shadow-soft hover:shadow-rose-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2 relative z-10"
                style={{ minHeight: '48px' }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-ivory-cream/30 border-t-ivory-cream rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    <span>Submit OTP</span>
                  </>
                )}
              </button>

              <div className="text-center space-y-2">
                <button
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-sm text-rose-pink hover:text-wine-rose font-body transition-colors disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
                <span className="text-wine-rose/40 mx-2">•</span>
                <button
                  onClick={() => {
                    setStage("email");
                    setOtp("");
                    setError("");
                  }}
                  className="text-sm text-rose-pink hover:text-wine-rose font-body transition-colors"
                >
                  Change email
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-rose-pink/20 text-center">
            <p className="text-sm text-wine-rose/60 font-body">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-rose-pink hover:text-wine-rose font-semibold transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
