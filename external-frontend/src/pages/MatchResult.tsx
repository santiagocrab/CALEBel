import { motion } from "framer-motion";
import { Heart, X, Sparkles, Star, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const mockMatch = {
  alias: "MoonlitCoder",
  sogie: "She/Her · Bisexual",
  mbti: "INFP",
  zodiac: "Pisces",
  socialBattery: "Ambivert",
  loveLangReceive: ["Quality Time", "Words of Affirmation"],
  loveLangGive: ["Acts of Service", "Quality Time"],
  interests: ["Anime & Manga", "Tech & Coding", "Music & Bands", "Books & Literature"],
  compatibility: 87,
};

const MatchResult = () => (
  <div className="min-h-screen bg-background pt-24 pb-16">
    <div className="container mx-auto px-4 max-w-lg">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-gold animate-pulse-gold" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Your Ka-Label Awaits</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what our algorithm found for you.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-hero p-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center mb-3">
            <span className="font-display text-2xl font-bold text-gold">{mockMatch.alias[0]}</span>
          </div>
          <h2 className="font-display text-xl font-bold text-primary-foreground">{mockMatch.alias}</h2>
          <p className="text-sm text-primary-foreground/60 mt-1">{mockMatch.sogie}</p>
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
            <Star className="w-3 h-3" /> {mockMatch.compatibility}% Compatible
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "MBTI", value: mockMatch.mbti },
              { label: "Zodiac", value: mockMatch.zodiac },
              { label: "Social", value: mockMatch.socialBattery },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">{label}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Love Language</p>
            <div className="flex flex-wrap gap-1.5">
              {mockMatch.loveLangReceive.map((l) => (
                <span key={l} className="px-2.5 py-1 rounded-full bg-rose-light/20 text-rose text-xs font-medium">{l}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Shared Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {mockMatch.interests.map((i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium border border-gold/20">{i}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <Link to="/chat" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-gold text-navy-deep font-bold text-sm shadow-gold hover:scale-[1.02] transition-transform">
            <MessageCircle className="w-4 h-4" /> Enter CALEBration Chamber
          </Link>
          <button className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  </div>
);

export default MatchResult;
