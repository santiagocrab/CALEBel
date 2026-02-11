import { motion } from "framer-motion";
import { Heart, MapPin, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const RevealResult = () => {
  const isFullDisclosure = true; // would come from state

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <Heart className="w-16 h-16 text-rose fill-rose/30" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-gold animate-pulse-gold" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">It's a Match! 💕</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Both of you chose <span className="text-gold font-semibold">Reveal</span>. Here's your Ka-Label.
          </p>
        </motion.div>

        {isFullDisclosure ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-hero p-8 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center mb-4">
                <span className="font-display text-3xl font-bold text-gold">M</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-primary-foreground">Maria Clara Santos</h2>
              <p className="text-primary-foreground/60 text-sm mt-1">CICT · BS Information Technology · 3rd Year</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Social Media</p>
                <a href="#" className="inline-flex items-center gap-2 text-sm text-gold hover:underline">
                  <ExternalLink className="w-4 h-4" /> facebook.com/mariaclara
                </a>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Suggested First Meet-Up</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">Meet at the WVSU Canteen or Library. Always choose a public place and let a friend know! 💛</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-6 text-center">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Anonymous Meet-Up Card</h2>
            <p className="text-sm text-muted-foreground mb-4">Since you both chose Secret Identity, meet via the SC Booth:</p>
            <div className="bg-muted/50 rounded-xl p-5 space-y-3">
              <p className="text-sm text-foreground"><strong>Your alias:</strong> <span className="text-gold">StarDust42</span></p>
              <p className="text-sm text-foreground"><strong>Their alias:</strong> <span className="text-gold">MoonlitCoder</span></p>
              <p className="text-sm text-foreground"><strong>When:</strong> February 14, 10AM – 4PM</p>
              <p className="text-sm text-foreground"><strong>Where:</strong> CICT SC Booth, WVSU Main Campus</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Show your CALEBel confirmation email at the booth to claim your meet-up.</p>
          </motion.div>
        )}

        <div className="bg-muted/50 border border-border rounded-xl p-4 mt-6">
          <p className="text-xs text-muted-foreground text-center">
            🛡️ <strong className="text-foreground">Safety Reminder:</strong> Always meet in public. Tell a friend where you're going. Respect each other's boundaries. The CICT SC is not responsible for off-platform interactions.
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gold hover:underline font-medium">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default RevealResult;
