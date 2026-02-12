import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Mail, Home } from "lucide-react";
import { PageBackground } from "@/components/PageBackground";

const NoPartner = () => {
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
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center">
            <Heart className="w-16 h-16 text-ivory-cream" />
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl font-bold text-wine-rose mb-4 font-display"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          No Partner Yet
        </motion.h1>

        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-wine-rose/80 text-lg font-body">
            We're still searching for your perfect Ka-Label!
          </p>
          
          <div className="bg-ivory-cream/80 rounded-2xl p-6 border border-rose-pink/30 shadow-soft">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-6 h-6 text-rose-pink flex-shrink-0 mt-1" />
              <div className="text-left">
                <p className="text-wine-rose font-semibold mb-2 font-body">
                  We'll notify you via email
                </p>
                <p className="text-wine-rose/70 text-sm font-body leading-relaxed">
                  Once we find your perfect match, we'll send you an email notification. 
                  Just check your inbox and sign in again to start chatting with your Ka-Label!
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-rose-pink/20">
              <p className="text-wine-rose/60 text-xs font-body">
                💕 Our algorithm is working hard to find someone compatible with your interests, 
                personality, and preferences. This may take up to 24 hours.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-ivory-cream font-bold rounded-xl shadow-soft hover:shadow-rose-glow transition-all font-body"
          >
            <Home className="w-5 h-5" />
            <span>Go Back to Home Page</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NoPartner;
