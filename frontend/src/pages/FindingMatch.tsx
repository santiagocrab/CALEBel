import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";

export default function FindingMatch() {
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("calebelUserId");
    if (!userId) {
      navigate("/register");
      return;
    }
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
          className="text-4xl font-bold text-wine-rose mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Finding Your Ka-Label...
        </motion.h1>

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-rose-pink text-xl font-semibold mb-4">
            We are currently finding your ka-label
          </p>
          <p className="text-wine-rose/80 text-lg">
            We will email you if we find it 📧
          </p>
        </motion.div>
        
        <motion.p
          className="text-wine-rose/70 text-sm mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Please check your email inbox for updates. 
          <br />
          <span className="font-semibold">You'll receive a notification email once we find your perfect match! 💕</span>
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
