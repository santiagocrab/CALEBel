import { motion, AnimatePresence } from "framer-motion";
import { Eye, RefreshCw, XCircle, Heart, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { consentReveal } from "@/lib/api";
import { PageBackground } from "@/components/PageBackground";

const PostChat = () => {
  const [choice, setChoice] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isCancelled = new URLSearchParams(location.search).get("state") === "cancelled";
  const matchId = localStorage.getItem("calebelMatchId") || "";
  const userId = localStorage.getItem("calebelUserId") || "";

  const options = isCancelled
    ? [
        {
          id: "recalibrate",
          icon: RefreshCw,
          gradient: "from-amber-500 to-orange-600",
          bgGradient: "from-amber-50 to-orange-50",
          borderColor: "border-amber-300",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          title: "🔄 RECALIBRATE",
          desc: "Pay ₱15 to re-enter the matching pool and find a new Ka-Label.",
          price: "₱15.00",
          highlight: "New match guaranteed"
        },
        {
          id: "end",
          icon: XCircle,
          gradient: "from-gray-500 to-gray-700",
          bgGradient: "from-gray-50 to-gray-100",
          borderColor: "border-gray-300",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          title: "⚫ END PARTICIPATION",
          desc: "Close this connection. You can still join future CALEBel events.",
          price: "Free",
          highlight: "No charge"
        },
      ]
    : [
        {
          id: "reveal",
          icon: Eye,
          gradient: "from-emerald-500 to-teal-600",
          bgGradient: "from-emerald-50 to-teal-50",
          borderColor: "border-emerald-300",
          iconBg: "bg-emerald-100",
          iconColor: "text-emerald-600",
          title: "💚 REVEAL",
          desc: "Both must choose Reveal to share identities. See each other's full profile if mutual.",
          price: "Free",
          highlight: "Mutual reveal required"
        },
        {
          id: "recalibrate",
          icon: RefreshCw,
          gradient: "from-amber-500 to-orange-600",
          bgGradient: "from-amber-50 to-orange-50",
          borderColor: "border-amber-300",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          title: "🔄 RECALIBRATE",
          desc: "Not feeling it? Pay PHP 15 to re-enter the matching pool and try again with a new Ka-Label.",
          price: "₱15.00",
          highlight: "Blueprint update included"
        },
        {
          id: "end",
          icon: XCircle,
          gradient: "from-gray-500 to-gray-700",
          bgGradient: "from-gray-50 to-gray-100",
          borderColor: "border-gray-300",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          title: "⚫ END CONNECTION",
          desc: "Close this connection entirely. No reveal, no rematch. You can still participate in future events.",
          price: "Free",
          highlight: "Final decision"
        },
      ];

  const handleConfirm = async () => {
    setError("");
    setSubmitting(true);

    try {
      if (choice === "reveal") {
        await consentReveal(matchId, userId, true);
        navigate("/reveal");
        return;
      }
      if (choice === "recalibrate") {
        navigate("/rematch");
        return;
      }
      if (choice === "end") {
        navigate("/");
        return;
      }
    } catch (err) {
      setError("Unable to process your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageBackground className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative inline-block mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center shadow-xl">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-gold animate-pulse" />
          </motion.div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-wine-rose mb-3">
            {isCancelled ? "CALEBration Cancelled" : "The Moment of Truth"}
          </h1>
          <p className="text-wine-rose/70 text-base md:text-lg max-w-md mx-auto">
            {isCancelled
              ? "Your match declined the chamber. Choose your next step."
              : "Your CALEBration Chamber has ended. What happens next is up to you — and your Ka-Label."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <AnimatePresence>
            {options.map((option, index) => {
              const Icon = option.icon;
              const isSelected = choice === option.id;
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setChoice(option.id)}
                  className={`relative text-left p-6 rounded-2xl border-2 transition-all overflow-hidden ${
                    isSelected
                      ? `${option.borderColor} ${option.bgGradient} shadow-xl ring-2 ring-offset-2 ring-offset-white`
                      : "border-rose-pink/30 bg-white/80 hover:border-rose-pink/50 hover:shadow-lg"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${option.gradient} opacity-10 blur-2xl`}
                    />
                  )}
                  <div className="relative flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${option.iconBg} ${isSelected ? "scale-110" : ""} transition-transform`}>
                      <Icon className={`w-6 h-6 ${option.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display font-bold text-wine-rose text-lg">{option.title}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          option.price === "Free" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {option.price}
                        </span>
                      </div>
                      <p className="text-sm text-wine-rose/70 mb-2">{option.desc}</p>
                      <p className="text-xs font-semibold text-wine-rose/60">{option.highlight}</p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {choice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border-2 border-rose-pink/30 shadow-xl"
            >
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-wine-rose">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-semibold">
                    {choice === "reveal" && "Your match must also choose Reveal for identities to be shared."}
                    {choice === "recalibrate" && "You'll be redirected to complete payment (₱15) and update your blueprint."}
                    {choice === "end" && "This action is final and cannot be undone."}
                  </p>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-rose-pink to-wine-rose text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm: {choice === "reveal" ? "Reveal" : choice === "recalibrate" ? "Recalibrate" : "End Connection"}</span>
                      <Heart className="w-5 h-5" />
                    </>
                  )}
                </button>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-600 mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageBackground>
  );
};

export default PostChat;
