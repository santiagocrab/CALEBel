import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6
    }
  })
};
const Index = () => {
  return <section className="relative min-h-screen flex items-center justify-center bg-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto">
          <motion.h1 variants={fadeUp} custom={0} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-navy-deep leading-tight mb-4">
            Organic Encounter?{" "}
            <span className="block text-gradient-gold">More like Organized Encounter.</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={1} className="text-lg md:text-xl text-navy-deep/60 max-w-xl mx-auto mb-10 font-body">
        </motion.p>

          <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-gold text-navy-deep font-bold text-base shadow-gold hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
              Find My Ka-Label
            </Link>
            <Link to="/how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border-2 border-navy-deep/20 text-navy-deep font-semibold text-base hover:border-navy-deep/40 transition-all">
              How CALEBel Works
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>;
};
export default Index;