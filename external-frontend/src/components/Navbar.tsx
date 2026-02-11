import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHero = location.pathname === "/";
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isHero ? "bg-transparent" : "bg-navy-deep/95 backdrop-blur-md border-b border-gold/10"}`}>
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Heart className="w-7 h-7 text-gold fill-gold/30 group-hover:fill-gold/60 transition-all" />
            <div className="absolute inset-0 animate-pulse-gold opacity-50">
              
            </div>
          </div>
          
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/how-it-works" className="text-sm font-medium transition-colors text-white">
            How It Works
          </Link>
          <Link to="/register" className="px-5 py-2 rounded-full bg-gradient-gold text-navy-deep font-semibold text-sm shadow-gold hover:scale-105 transition-transform">
            Find My Ka-Label
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-primary-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: "auto"
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden bg-navy-deep/98 backdrop-blur-md border-t border-gold/10">
            <div className="flex flex-col gap-3 p-4">
              <Link to="/how-it-works" onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-gold py-2">
                How It Works
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="text-center px-5 py-2.5 rounded-full bg-gradient-gold text-navy-deep font-semibold text-sm shadow-gold">
                Find My Ka-Label
              </Link>
            </div>
          </motion.div>}
      </AnimatePresence>
    </nav>;
};
export default Navbar;