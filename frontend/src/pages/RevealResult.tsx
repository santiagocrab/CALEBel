import { motion } from "framer-motion";
import { Heart, MapPin, ExternalLink, Sparkles, Shield, Calendar, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchReveal } from "@/lib/api";
import { PageBackground } from "@/components/PageBackground";

const RevealResult = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const matchId = localStorage.getItem("calebelMatchId") || "";
    const userId = localStorage.getItem("calebelUserId") || "";
    if (!matchId || !userId) {
      setError("Missing match details.");
      setLoading(false);
      return;
    }
    fetchReveal(matchId, userId)
      .then((res) => setData(res))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load reveal."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageBackground className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-rose-pink border-t-transparent"
            />
            <p className="text-wine-rose/70 font-semibold">Loading your reveal...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center"
          >
            <p className="text-red-600 font-semibold">{error}</p>
            <Link to="/" className="text-sm text-red-600 hover:underline mt-4 inline-block">
              ← Back to Home
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative inline-block mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                  <Heart className="w-12 h-12 text-white fill-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-gold animate-pulse" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl"
                />
              </motion.div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-wine-rose mb-3">
                It's a Match! 💕
              </h1>
              <p className="text-wine-rose/70 text-base md:text-lg">
                Both of you chose <span className="text-emerald-600 font-bold">Reveal</span>. Here's your Ka-Label.
              </p>
            </motion.div>

            {data?.mode === "full" ? (
              // Full Disclosure Reveal
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-300"
              >
                <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-8 md:p-10 text-center relative overflow-hidden">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="relative z-10"
                  >
                    <div className="w-28 h-28 mx-auto rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/50 flex items-center justify-center mb-4 shadow-xl">
                      <span className="font-display text-5xl font-bold text-white">
                        {data?.name?.first?.[0] || "K"}
                      </span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                      {data?.name?.first} {data?.name?.middle} {data?.name?.last}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-white/90 text-sm md:text-base">
                      <Users className="w-4 h-4" />
                      <span>{data?.college}</span>
                      <span>•</span>
                      <span>{data?.course}</span>
                      <span>•</span>
                      <span>{data?.yearLevel}</span>
                    </div>
                  </motion.div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {data?.socialLink && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-rose-pink/10 to-wine-rose/10 rounded-xl p-5 border border-rose-pink/20"
                    >
                      <p className="text-xs font-display font-bold text-wine-rose uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Social Media
                      </p>
                      <a
                        href={data.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm md:text-base text-wine-rose font-semibold hover:text-rose-pink transition-colors"
                      >
                        <span>{data.socialLink}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <MapPin className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-display font-bold text-amber-900 uppercase tracking-wider mb-2">
                          Suggested First Meet-Up
                        </p>
                        <p className="text-sm md:text-base text-amber-800 leading-relaxed">
                          Meet at the <strong>WVSU Canteen</strong> or <strong>Library</strong>. Always choose a public place and let a friend know! 💛
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <div className="flex items-center gap-2 text-xs text-amber-700">
                        <Calendar className="w-4 h-4" />
                        <span>Best times: Weekdays 10AM-4PM</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              // Anonymous Meet-Up
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-rose-pink/30"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-wine-rose mb-2">
                    Anonymous Meet-Up Card
                  </h2>
                  <p className="text-wine-rose/70 text-sm md:text-base">
                    Since you both chose Secret Identity, meet via the SC Booth
                  </p>
                </div>

                <div className="bg-gradient-to-br from-rose-pink/10 to-wine-rose/10 rounded-2xl p-6 md:p-8 space-y-4 border-2 border-rose-pink/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-pink/20 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-rose-pink" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-wine-rose/60 uppercase tracking-wider">Their Alias</p>
                      <p className="text-lg font-bold text-wine-rose">{data?.alias || "Ka-Label"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-wine-rose/60 uppercase tracking-wider">When</p>
                      <p className="text-lg font-bold text-wine-rose">{data?.meetup?.time || "February 14, 10AM – 4PM"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-wine-rose/60 uppercase tracking-wider">Where</p>
                      <p className="text-lg font-bold text-wine-rose">{data?.meetup?.location || "CICT SC Booth, WVSU Main Campus"}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-wine-rose/60 text-center mt-6 bg-wine-rose/5 rounded-lg p-3">
                  📧 Show your CALEBel confirmation email at the booth to claim your meet-up.
                </p>
              </motion.div>
            )}

            {/* Safety Reminder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mt-8"
            >
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-2">🛡️ Safety Reminder</p>
                  <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                    Always meet in public. Tell a friend where you're going. Respect each other's boundaries. The CICT SC is not responsible for off-platform interactions.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-8"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm md:text-base text-wine-rose hover:text-rose-pink font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </PageBackground>
  );
};

export default RevealResult;
