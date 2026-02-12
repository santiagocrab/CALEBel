import { motion } from "framer-motion";
import { Heart, MapPin, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchReveal } from "@/lib/api";
import { PageBackground } from "@/components/PageBackground";

const RevealResult = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const matchId = localStorage.getItem("calebelMatchId") || "";
    const userId = localStorage.getItem("calebelUserId") || "";
    if (!matchId || !userId) {
      setError("Missing match details.");
      setLoading(false);
      return;
    }
    fetchReveal(matchId, userId)
      .then((res) => setData(res))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load reveal."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageBackground className="pt-24 pb-16">
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

        {loading ? (
          <div className="text-center text-muted-foreground">Loading reveal...</div>
        ) : error ? (
          <div className="text-center text-destructive">{error}</div>
        ) : data?.mode === "full" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-gradient-hero p-8 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center mb-4">
                <span className="font-display text-3xl font-bold text-gold">{data?.name?.first?.[0] || "K"}</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-primary-foreground">
                {data?.name?.first} {data?.name?.middle} {data?.name?.last}
              </h2>
              <p className="text-primary-foreground/60 text-sm mt-1">
                {data?.college} · {data?.course} · {data?.yearLevel}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Social Media</p>
                {data?.socialLink ? (
                  <a href={data.socialLink} className="inline-flex items-center gap-2 text-sm text-gold hover:underline">
                    <ExternalLink className="w-4 h-4" /> {data.socialLink}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No social link provided.</p>
                )}
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
              <p className="text-sm text-foreground"><strong>Their alias:</strong> <span className="text-gold">{data?.alias || "Ka-Label"}</span></p>
              <p className="text-sm text-foreground"><strong>When:</strong> {data?.meetup?.time || "February 14, 10AM – 4PM"}</p>
              <p className="text-sm text-foreground"><strong>Where:</strong> {data?.meetup?.location || "CICT SC Booth, WVSU Main Campus"}</p>
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
