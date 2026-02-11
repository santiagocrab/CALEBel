import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { requestVerification, confirmVerification } from "@/lib/api";

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") || localStorage.getItem("calebelUserId") || "";

  useEffect(() => {
    if (!userId) {
      navigate("/register");
    }
  }, [userId, navigate]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await confirmVerification(userId, code);
      localStorage.setItem("calebelUserId", userId);
      navigate("/finding-match");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const email = localStorage.getItem("calebelEmail") || "";
      if (email) {
        await requestVerification(userId, email);
        setError("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush-pink via-rose-pink/20 to-ivory-cream flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-ivory-cream rounded-3xl shadow-xl p-8 border-2 border-rose-pink/30">
          <div className="text-center mb-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-wine-rose/60 hover:text-wine-rose mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-body">Back</span>
            </Link>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-wine-rose mb-2">
              Verify Your Email
            </h1>
            <p className="text-wine-rose/70 font-body">
              Enter the 6-digit code we sent to your email
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-wine-rose mb-2 font-body">
                Verification Code
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-pink/60" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(val);
                  }}
                  placeholder="000000"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-rose-pink/20 rounded-xl text-wine-rose placeholder-wine-rose/40 focus:outline-none focus:border-rose-pink focus:ring-2 focus:ring-rose-pink/20 transition-all text-center text-2xl tracking-widest font-mono font-bold"
                  maxLength={6}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify();
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full py-3.5 bg-gradient-primary text-ivory-cream font-bold rounded-xl shadow-soft hover:shadow-rose-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-ivory-cream/30 border-t-ivory-cream rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  <span>Verify Email</span>
                </>
              )}
            </button>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-rose-pink hover:text-wine-rose font-body transition-colors disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
