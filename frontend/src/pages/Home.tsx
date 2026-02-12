import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut"
    }
  })
};

const Home = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 1000);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 -z-10"
      >
        <img
          src="/bg.png"
          alt="CALEBel background"
          className="w-full h-full object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 text-center relative z-10 w-full max-w-7xl">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto"
        >
          <motion.h1 
            variants={fadeUp} 
            custom={0} 
            className="font-display font-bold text-wine-rose leading-tight mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2 sm:px-4"
            style={{
              fontSize: 'clamp(2rem, 6vw + 0.5rem, 5.5rem)',
              lineHeight: '1.15',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span className="block">Organic Encounter?</span>
            <motion.span 
              className="block mt-2 sm:mt-3 md:mt-4 lg:mt-5 text-wine-rose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                fontSize: 'clamp(1.75rem, 5.5vw + 0.5rem, 4.5rem)',
                lineHeight: '1.15',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              More like Organized Encounter.
            </motion.span>
          </motion.h1>

          <motion.p 
            variants={fadeUp} 
            custom={1} 
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-wine-rose/90 max-w-3xl lg:max-w-4xl mx-auto mb-10 sm:mb-12 md:mb-16 lg:mb-20 font-body px-4 leading-relaxed"
          >
            Find your perfect match through our compatibility algorithm. Join CALEBel today!
          </motion.p>

          <motion.div 
            variants={fadeUp} 
            custom={2} 
            className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 justify-center items-stretch sm:items-center px-4 sm:px-0"
          >
            <Link 
              to="/register" 
              className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 md:px-12 lg:px-16 py-4 sm:py-4.5 md:py-5 lg:py-6 rounded-full bg-gradient-primary text-ivory-cream font-bold text-base sm:text-lg md:text-xl lg:text-2xl shadow-soft hover:shadow-rose-glow transition-all duration-300 hover:scale-105 min-h-[56px] sm:min-h-[64px] md:min-h-[72px] lg:min-h-[80px]"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 fill-current" />
              </motion.div>
              <span>Find My Ka-Label</span>
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 blur-xl"
                transition={{ duration: 0.3 }}
              />
            </Link>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6">
              <Link 
                to="/signin" 
                className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 md:px-12 lg:px-16 py-4 sm:py-4.5 md:py-5 lg:py-6 rounded-full border-2 border-wine-rose/40 text-wine-rose font-semibold text-base sm:text-lg md:text-xl lg:text-2xl hover:border-wine-rose hover:bg-wine-rose/5 transition-all duration-300 min-h-[56px] sm:min-h-[64px] md:min-h-[72px] lg:min-h-[80px]"
              >
                Sign In
              </Link>
              <Link 
                to="/how-it-works" 
                className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 md:px-12 lg:px-16 py-4 sm:py-4.5 md:py-5 lg:py-6 rounded-full border-2 border-wine-rose/40 text-wine-rose font-semibold text-base sm:text-lg md:text-xl lg:text-2xl hover:border-wine-rose hover:bg-wine-rose/5 transition-all duration-300 min-h-[56px] sm:min-h-[64px] md:min-h-[72px] lg:min-h-[80px]"
              >
                <span className="hidden sm:inline">How CALEBel Works</span>
                <span className="sm:hidden">How It Works</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </Link>
            </div>
            
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12 sm:mt-16 flex justify-center gap-2"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-rose-pink/60"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Home;
