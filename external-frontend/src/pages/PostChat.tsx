import { motion } from "framer-motion";
import { Eye, RefreshCw, XCircle, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const PostChat = () => {
  const [choice, setChoice] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Heart className="w-12 h-12 text-gold mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground">The Moment of Truth</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
            Your CALEBration Chamber has ended. What happens next is up to you — and your Ka-Label.
          </p>
        </motion.div>

        <div className="space-y-4">
          {[
            {
              id: "reveal",
              icon: Eye,
              color: "text-success",
              bg: "bg-success/10 border-success/20",
              title: "🟢 REVEAL",
              desc: "Both of you must choose Reveal for identities to be shared. If mutual, you'll see each other's full profile.",
            },
            {
              id: "recalibrate",
              icon: RefreshCw,
              color: "text-warning",
              bg: "bg-warning/10 border-warning/20",
              title: "🔴 RECALIBRATE",
              desc: "Not feeling it? Pay PHP 20 to re-enter the matching pool and try again with a new Ka-Label.",
            },
            {
              id: "end",
              icon: XCircle,
              color: "text-muted-foreground",
              bg: "bg-muted border-border",
              title: "⚫ END CONNECTION",
              desc: "Close this connection entirely. No reveal, no rematch. You can still participate in future events.",
            },
          ].map(({ id, icon: Icon, color, bg, title, desc }) => (
            <motion.button
              key={id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setChoice(id)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                choice === id ? `${bg} shadow-lg` : "border-border hover:border-gold/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {choice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
            <Link
              to={choice === "reveal" ? "/reveal" : "/"}
              className="inline-flex px-8 py-3 rounded-full bg-gradient-gold text-navy-deep font-bold shadow-gold hover:scale-105 transition-transform"
            >
              Confirm: {choice === "reveal" ? "Reveal" : choice === "recalibrate" ? "Recalibrate" : "End Connection"}
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              {choice === "reveal" && "Your match must also choose Reveal for identities to be shared."}
              {choice === "recalibrate" && "PHP 20 will be charged via GCash for re-entry."}
              {choice === "end" && "This action is final and cannot be undone."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PostChat;
