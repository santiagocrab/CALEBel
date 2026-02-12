import { motion } from "framer-motion";
import { Heart, X, Sparkles, Star, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMatch } from "@/lib/api";
import { PageBackground } from "@/components/PageBackground";

interface MatchData {
  alias: string;
  sogie?: string;
  mbti?: string;
  zodiac?: string;
  socialBattery?: string;
  loveLangReceive?: string[];
  loveLangGive?: string[];
  interests?: string[];
  compatibility?: number;
  matchId?: string;
}

const MatchResult = () => {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMatch, setHasMatch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMatch = async () => {
      const userId = localStorage.getItem("calebelUserId");
      if (!userId) {
        navigate("/signin");
        return;
      }

      try {
        setLoading(true);
        const data = await fetchMatch(userId);
        console.log("Match data received:", data);
        
        if (data.status === "matched" && data.matchId) {
          setHasMatch(true);
          const partnerProfile = data.partner || {};
          const sogiesc = partnerProfile.sogiesc || {};
          
          console.log("Partner profile:", partnerProfile);
          console.log("Partner alias:", partnerProfile.alias);
          
          setMatchData({
            alias: partnerProfile.alias || "Unknown",
            sogie: `${sogiesc.pronouns || ""}${sogiesc.pronouns && sogiesc.sexualOrientation ? " · " : ""}${sogiesc.sexualOrientation || ""}`,
            mbti: partnerProfile.personality?.mbti || "N/A",
            zodiac: partnerProfile.personality?.sunSign || "N/A",
            socialBattery: partnerProfile.personality?.socialBattery || "N/A",
            loveLangReceive: partnerProfile.loveLanguageReceive || [],
            loveLangGive: partnerProfile.loveLanguageProvide || [],
            interests: partnerProfile.interests || [],
            compatibility: data.compatibilityScore || 0,
            matchId: data.matchId
          });

          if (data.matchId) {
            localStorage.setItem("calebelMatchId", data.matchId);
          }
          if (partnerProfile.alias) {
            localStorage.setItem("calebelMatchAlias", partnerProfile.alias);
          }
        } else {
          console.log("No match found or invalid match data");
          setHasMatch(false);
        }
      } catch (err) {
        console.error("Error loading match:", err);
        setHasMatch(false);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [navigate]);

  if (loading) {
    return (
      <PageBackground className="pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-gold animate-pulse-gold" />
          </div>
          <p className="text-muted-foreground">Loading your match...</p>
        </motion.div>
      </PageBackground>
    );
  }

  if (!hasMatch || !matchData) {
    return (
      <PageBackground className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              You have no match yet
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              We're still searching for your perfect Ka-Label. We'll notify you via email once we find a match!
            </p>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-gold text-navy-deep font-bold text-sm shadow-gold hover:scale-105 transition-transform"
            >
              <Heart className="w-4 h-4" />
              Go Back Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
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
            <span className="font-display text-2xl font-bold text-gold">{matchData.alias[0]?.toUpperCase() || "?"}</span>
          </div>
          <h2 className="font-display text-xl font-bold text-primary-foreground">{matchData.alias}</h2>
          {matchData.sogie && (
            <p className="text-sm text-primary-foreground/60 mt-1">{matchData.sogie}</p>
          )}
          {matchData.compatibility !== undefined && (
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
              <Star className="w-3 h-3" /> {matchData.compatibility}% Compatible
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "MBTI", value: matchData.mbti || "N/A" },
              { label: "Zodiac", value: matchData.zodiac || "N/A" },
              { label: "Social", value: matchData.socialBattery || "N/A" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">{label}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {matchData.loveLangReceive && matchData.loveLangReceive.length > 0 && (
            <div>
              <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Love Language</p>
              <div className="flex flex-wrap gap-1.5">
                {matchData.loveLangReceive.map((l) => (
                  <span key={l} className="px-2.5 py-1 rounded-full bg-rose-light/20 text-rose text-xs font-medium">{l}</span>
                ))}
              </div>
            </div>
          )}

          {matchData.interests && matchData.interests.length > 0 && (
            <div>
              <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Shared Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {matchData.interests.map((i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium border border-gold/20">{i}</span>
                ))}
              </div>
            </div>
          )}
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
  </PageBackground>
  );
};

export default MatchResult;
