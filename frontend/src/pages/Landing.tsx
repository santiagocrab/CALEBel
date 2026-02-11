import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const Landing = () => {
  const [showContent, setShowContent] = useState(false);
  const [exit, setExit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {!exit && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <div className="absolute inset-0">
            <img
              src="/bg.png"
              alt="CALEBel background"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-8 lg:gap-12 xl:gap-16"
                >
                  {/* Character - Left side on desktop, top on mobile */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      y: [0, -15, 0],
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.8,
                      y: -30,
                    }}
                    transition={{
                      opacity: { duration: 0.6 },
                      scale: { duration: 0.6 },
                      y: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="mb-6 sm:mb-8 md:mb-10 lg:mb-0 flex-shrink-0"
                  >
                    <motion.img
                      src="/caleb.png"
                      alt="CALEB character"
                      className="w-48 h-48 xs:w-56 xs:h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] object-contain drop-shadow-2xl"
                      animate={{
                        rotate: [0, 3, -3, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                  
                  {/* Text Content - Right side on desktop, bottom on mobile */}
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 max-w-2xl lg:max-w-none">

                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 200 }}
                      className="mb-4 sm:mb-5 md:mb-6 lg:mb-8"
                    >
                      <motion.h1
                        className="font-display font-bold text-white"
                        style={{
                          fontSize: 'clamp(3rem, 6vw + 2rem, 7rem)',
                          textShadow: '0 0 30px rgba(238, 105, 131, 0.7), 0 0 60px rgba(133, 14, 53, 0.5), 0 2px 4px rgba(0, 0, 0, 0.15)',
                          letterSpacing: '0.05em',
                          lineHeight: '1.1',
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                        }}
                        animate={{
                          textShadow: [
                            '0 0 30px rgba(238, 105, 131, 0.7), 0 0 60px rgba(133, 14, 53, 0.5), 0 2px 4px rgba(0, 0, 0, 0.15)',
                            '0 0 45px rgba(238, 105, 131, 0.9), 0 0 80px rgba(133, 14, 53, 0.7), 0 2px 4px rgba(0, 0, 0, 0.15)',
                            '0 0 30px rgba(238, 105, 131, 0.7), 0 0 60px rgba(133, 14, 53, 0.5), 0 2px 4px rgba(0, 0, 0, 0.15)',
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <span className="bg-gradient-to-r from-rose-pink via-white via-rose-pink to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient" style={{ WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.3)' }}>
                          CALEBel
                        </span>
                      </motion.h1>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1, duration: 0.6 }}
                      className="text-white/95 font-body font-medium mb-6 sm:mb-8 md:mb-10 lg:mb-12"
                      style={{
                        fontSize: 'clamp(1.125rem, 2vw + 0.5rem, 2rem)',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)',
                        lineHeight: '1.6'
                      }}
                    >
                      The Search for your Ka-Label
                    </motion.p>

                    <motion.button
                      onClick={() => {
                        setExit(true);
                        setTimeout(() => {
                          navigate("/home", { replace: true });
                        }, 500);
                      }}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 1.4, duration: 0.5, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 md:px-12 lg:px-16 py-4 sm:py-4.5 md:py-5 lg:py-6 rounded-full bg-gradient-primary text-ivory-cream font-bold shadow-soft hover:shadow-rose-glow transition-all duration-300 overflow-hidden w-full sm:w-auto"
                      style={{
                        fontSize: 'clamp(1rem, 1.5vw + 0.5rem, 1.25rem)',
                        minHeight: 'clamp(48px, 5vw + 20px, 64px)',
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-rose-pink via-wine-rose to-rose-pink opacity-0 group-hover:opacity-20 blur-xl"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "linear",
                        }}
                      />
                      
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10"
                      >
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 fill-current" />
                      </motion.div>
                      <span className="relative z-10">Find your Ka-Label now!!</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Landing;
