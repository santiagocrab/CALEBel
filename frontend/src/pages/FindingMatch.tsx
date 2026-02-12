import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchMatch } from "@/lib/api";
import { PageBackground } from "@/components/PageBackground";

const PROCESSING_MESSAGES = [
  "Scanning compatibility matrices...",
  "Analyzing love languages...",
  "Matching zodiac signs...",
  "Calculating social battery compatibility...",
  "Finding your perfect Ka-Label...",
  "Almost there...",
];

export default function FindingMatch() {
  const [messageIndex, setMessageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("calebelUserId");
    if (!userId) {
      navigate("/register");
      return;
    }

    const checkMatch = async () => {
      try {
        const data = await fetchMatch(userId);
        if (data.status === "matched") {
          // Save match info and redirect to match result/chat
          if (data.matchId) {
            localStorage.setItem("calebelMatchId", data.matchId);
            localStorage.setItem("calebelMatchAlias", data.alias || "");
          }
          navigate("/match");
        } else if (data.status === "waiting") {
          // User is waiting for a match - keep showing this page
          // The page will continue polling
        }
      } catch (err) {
        console.error("Error checking match:", err);
      }
    };

    const pollInterval = setInterval(checkMatch, 3000);
    checkMatch();

    return () => clearInterval(pollInterval);
  }, [navigate]);

  return (
    <PageBackground className="flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          className="w-32 h-32 mx-auto mb-8 relative"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity },
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center">
            <span className="text-6xl">💕</span>
          </div>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              animate={{
                rotate: i * 60,
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `translateX(-50%) translateY(-50%) rotate(${i * 60}deg)`,
                }}
              >
                <span className="text-2xl">✨</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.h1
          className="text-4xl font-bold text-wine-rose mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Finding Your Ka-Label...
        </motion.h1>

        <motion.p
          key={messageIndex}
          className="text-rose-pink text-lg mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {PROCESSING_MESSAGES[messageIndex]}
        </motion.p>
        
        <motion.p
          className="text-wine-rose/70 text-sm mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          We're searching for your perfect match. This may take up to 24 hours.
          <br />
          <span className="font-semibold">You'll receive an email when we find your Ka-Label! 📧</span>
        </motion.p>

        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-rose-pink"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </PageBackground>
  );
}
