import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Menu, X, LogOut, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isAuthenticated, signOut } from "@/lib/auth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHero = location.pathname === "/";

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, [location.pathname]);

  const handleSignOut = () => {
    signOut();
    setAuthenticated(false);
    navigate("/");
    setOpen(false);
  };
  return <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isHero ? "bg-transparent" : "bg-navy-deep/95 backdrop-blur-md border-b border-gold/10"}`}>
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <img 
              src="/caleb.png" 
              alt="CALEBel Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="font-display font-bold text-white text-lg group-hover:text-gold transition-colors">
            CALEBel
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/how-it-works" className="text-sm font-medium transition-colors text-white">
            How It Works
          </Link>
          {authenticated ? (
            <>
              <Link to="/match" className="text-sm font-medium transition-colors text-white hover:text-gold">
                My Match
              </Link>
              <button
                onClick={handleSignOut}
                className="px-5 py-2 rounded-full border-2 border-gold/30 text-gold font-semibold text-sm hover:bg-gold/10 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-sm font-medium transition-colors text-white hover:text-gold flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link to="/register" className="px-5 py-2 rounded-full bg-gradient-gold text-navy-deep font-semibold text-sm shadow-gold hover:scale-105 transition-transform">
                Find My Ka-Label
              </Link>
            </>
          )}
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
              {authenticated ? (
                <>
                  <Link to="/match" onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-gold py-2">
                    My Match
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setOpen(false);
                    }}
                    className="text-center px-5 py-2.5 rounded-full border-2 border-gold/30 text-gold font-semibold text-sm hover:bg-gold/10 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-gold py-2 flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="text-center px-5 py-2.5 rounded-full bg-gradient-gold text-navy-deep font-semibold text-sm shadow-gold">
                    Find My Ka-Label
                  </Link>
                </>
              )}
            </div>
          </motion.div>}
      </AnimatePresence>
    </nav>;
};
export default Navbar;