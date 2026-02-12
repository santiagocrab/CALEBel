import { motion } from "framer-motion";
import { UserCheck, ClipboardList, Cpu, Heart, MessageCircle, Unlock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageBackground } from "@/components/PageBackground";

const steps = [
  {
    icon: UserCheck,
    title: "Register & Verify",
    desc: "Sign up with your WVSU email (@wvsu.edu.ph) and submit GCash proof of payment. We verify you're a legit Taga-West student.",
    detail: "Age 18+ required · PHP 30 registration fee",
  },
  {
    icon: ClipboardList,
    title: "Fill the Compatibility Blueprint",
    desc: "Complete your profile — identity, SOGIE-SC, personality (MBTI, astrology), love languages, and interests. Choose Full Disclosure or Secret Identity.",
    detail: "6 sections · Takes ~10 minutes",
  },
  {
    icon: Cpu,
    title: "Algorithm Matching",
    desc: "Our matching engine finds your Ka-Label based on 3+ shared interests, compatible SOGIE preferences, and personality alignment.",
    detail: "Results within 24 hours via email",
  },
  {
    icon: Heart,
    title: "Match Reveal",
    desc: "See your match's alias, personality summary, interests, and love language. Decide: enter the CALEBration Chamber or recalibrate.",
    detail: "Anonymous until you both choose to reveal",
  },
  {
    icon: MessageCircle,
    title: "CALEBration Chamber",
    desc: "Chat with your match — 25 messages each, 150 characters max. Get to know them within the safe, structured space.",
    detail: "No profanity · Timer-based · Consent-first",
  },
  {
    icon: Unlock,
    title: "Reveal, Recalibrate, or End",
    desc: "Both choose: Reveal identities, recalibrate for a new match (PHP 15), or end the connection. Mutual consent required for reveal.",
    detail: "Full Disclosure → direct reveal · Anonymous → SC booth meetup",
  },
];

const HowItWorks = () => (
  <PageBackground className="pt-24 pb-16">
    <div className="container mx-auto px-4 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
          How <span className="text-gradient-gold">CALEBel</span> Works
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">From registration to Ka-Label reveal — here's the full flow.</p>
      </motion.div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-10">
          {steps.map(({ icon: Icon, title, desc, detail }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-16 md:pl-20"
            >
              <div className="absolute left-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 border border-border flex items-center justify-center z-10">
                <Icon className="w-6 h-6 md:w-7 md:h-7 text-gold" />
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 md:p-6 hover:border-gold/20 transition-colors">
                <span className="text-xs font-display font-bold text-gold uppercase tracking-widest">Step {i + 1}</span>
                <h3 className="font-display text-xl font-bold text-foreground mt-1 mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{desc}</p>
                <span className="text-xs text-gold/70 font-medium">{detail}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-14">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-gold text-navy-deep font-bold shadow-gold hover:scale-105 transition-transform"
        >
          Start My Blueprint <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  </PageBackground>
);

export default HowItWorks;
