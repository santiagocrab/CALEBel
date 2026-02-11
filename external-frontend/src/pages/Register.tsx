import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const SECTIONS = [
  "Identity",
  "Privacy",
  "SOGIE-SC",
  "Personality",
  "Interests",
  "Terms",
];

const Register = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));
  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-gold animate-pulse-gold" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">The CALEBration is Underway!</h1>
          <p className="text-muted-foreground mb-8">Your Compatibility Blueprint has been submitted. Here's what happens next:</p>
          <div className="space-y-4 text-left bg-card border border-border rounded-2xl p-6">
            {[
              { label: "Verification", desc: "We'll confirm your WVSU status and payment" },
              { label: "Matching", desc: "Our algorithm scans for your Ka-Label" },
              { label: "Email Reveal", desc: "Check your inbox (and spam!) within 24 hours" },
            ].map(({ label, desc }, i) => (
              <div key={label} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-gold">{i + 1}</span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-foreground">{label}</h4>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/" className="inline-block mt-8 text-sm text-gold hover:underline font-medium">
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 text-center">
            Compatibility <span className="text-gradient-gold">Blueprint</span>
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">Complete all 6 sections to submit your blueprint.</p>

          {/* Progress */}
          <div className="flex items-center gap-1 mb-8">
            {SECTIONS.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`h-1.5 w-full rounded-full transition-colors ${
                    i < step ? "bg-gold" : i === step ? "bg-gold/60" : "bg-muted"
                  }`}
                />
                <span className={`text-[10px] font-medium hidden sm:block ${i <= step ? "text-gold" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>

          {/* Form sections */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {step === 0 && <StepIdentity data={formData} update={update} />}
                {step === 1 && <StepPrivacy data={formData} update={update} />}
                {step === 2 && <StepSOGIE data={formData} update={update} />}
                {step === 3 && <StepPersonality data={formData} update={update} />}
                {step === 4 && <StepInterests data={formData} update={update} />}
                {step === 5 && <StepTerms data={formData} update={update} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button onClick={prev} disabled={step === 0} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-gold/30 disabled:opacity-30 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < 5 ? (
              <button onClick={next} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-gold text-navy-deep text-sm font-bold shadow-gold hover:scale-105 transition-transform">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setSubmitted(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-gold text-navy-deep text-sm font-bold shadow-gold hover:scale-105 transition-transform">
                <CheckCircle className="w-4 h-4" /> Submit Blueprint
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ─── FORM STEPS ─── */

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 placeholder:text-muted-foreground font-body";
const labelClass = "block text-sm font-semibold text-foreground mb-1.5 font-display";
const selectClass = inputClass + " appearance-none";

interface StepProps {
  data: Record<string, any>;
  update: (key: string, value: any) => void;
}

const StepIdentity = ({ data, update }: StepProps) => (
  <div className="space-y-4">
    <h2 className="font-display text-xl font-bold text-foreground mb-1">Section 1: Identity Verification</h2>
    <p className="text-xs text-muted-foreground mb-4">Please use your WVSU email for verification.</p>
    <div className="grid sm:grid-cols-2 gap-4">
      <div><label className={labelClass}>Full Name</label><input className={inputClass} placeholder="Juan Dela Cruz" value={data.name || ""} onChange={(e) => update("name", e.target.value)} /></div>
      <div><label className={labelClass}>WVSU Email</label><input type="email" className={inputClass} placeholder="you@wvsu.edu.ph" value={data.email || ""} onChange={(e) => update("email", e.target.value)} /></div>
      <div><label className={labelClass}>Date of Birth</label><input type="date" className={inputClass} value={data.dob || ""} onChange={(e) => update("dob", e.target.value)} /></div>
      <div><label className={labelClass}>College</label>
        <select className={selectClass} value={data.college || ""} onChange={(e) => update("college", e.target.value)}>
          <option value="">Select college</option>
          <option>CICT</option><option>CAS</option><option>COE</option><option>CON</option><option>COM</option><option>PESCAR</option>
        </select>
      </div>
      <div><label className={labelClass}>Course</label><input className={inputClass} placeholder="BS Information Technology" value={data.course || ""} onChange={(e) => update("course", e.target.value)} /></div>
      <div><label className={labelClass}>Year Level</label>
        <select className={selectClass} value={data.year || ""} onChange={(e) => update("year", e.target.value)}>
          <option value="">Select year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>5th Year</option>
        </select>
      </div>
    </div>
    <div>
      <label className={labelClass}>GCash Reference Number</label>
      <input className={inputClass} placeholder="e.g. 1234567890" value={data.gcash || ""} onChange={(e) => update("gcash", e.target.value)} />
    </div>
    <div>
      <label className={labelClass}>Proof of Payment</label>
      <label className="flex items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-gold/40 cursor-pointer transition-colors bg-muted/50">
        <Upload className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => update("proof", e.target.files?.[0]?.name)} />
      </label>
      {data.proof && <p className="text-xs text-gold mt-1">Uploaded: {data.proof}</p>}
    </div>
    <div>
      <label className={labelClass}>Social Media Link <span className="text-muted-foreground font-normal">(optional)</span></label>
      <input className={inputClass} placeholder="https://facebook.com/you" value={data.social || ""} onChange={(e) => update("social", e.target.value)} />
    </div>
  </div>
);

const StepPrivacy = ({ data, update }: StepProps) => (
  <div className="space-y-5">
    <h2 className="font-display text-xl font-bold text-foreground mb-1">Section 2: Privacy Gateway</h2>
    <p className="text-sm text-muted-foreground">Choose how you want to participate. This affects how your identity is shared with your match.</p>
    <div className="grid sm:grid-cols-2 gap-4">
      {[
        { mode: "full", title: "Full Disclosure", desc: "Your name, college & socials will be shared upon mutual reveal." },
        { mode: "anonymous", title: "Secret Identity", desc: "Stay anonymous. Meet at the SC Booth via alias if matched." },
      ].map(({ mode, title, desc }) => (
        <button
          key={mode}
          onClick={() => update("privacyMode", mode)}
          className={`text-left p-5 rounded-2xl border-2 transition-all ${data.privacyMode === mode ? "border-gold bg-gold/5 shadow-gold" : "border-border hover:border-gold/20"}`}
        >
          <h3 className="font-display font-bold text-foreground mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </button>
      ))}
    </div>
    <div>
      <label className={labelClass}>Alias <span className="text-muted-foreground font-normal">(required)</span></label>
      <input className={inputClass} placeholder="e.g. StarDust42" value={data.alias || ""} onChange={(e) => update("alias", e.target.value)} />
      <p className="text-xs text-muted-foreground mt-1">This is how your match will see you before any reveal.</p>
    </div>
  </div>
);

const StepSOGIE = ({ data, update }: StepProps) => (
  <div className="space-y-4">
    <h2 className="font-display text-xl font-bold text-foreground mb-1">Section 3: SOGIE-SC</h2>
    <p className="text-xs text-muted-foreground mb-2">All responses are treated with respect and inclusivity. This helps our algorithm match you better.</p>
    {[
      { key: "orientation", label: "Sexual Orientation", options: ["Heterosexual", "Homosexual", "Bisexual", "Pansexual", "Asexual", "Queer", "Prefer not to say", "Other"] },
      { key: "genderIdentity", label: "Gender Identity", options: ["Man", "Woman", "Non-binary", "Genderqueer", "Genderfluid", "Agender", "Prefer not to say", "Other"] },
      { key: "genderExpression", label: "Gender Expression", options: ["Masculine", "Feminine", "Androgynous", "Fluid", "Prefer not to say", "Other"] },
      { key: "sexChar", label: "Sex Characteristics", options: ["Male", "Female", "Intersex", "Prefer not to say"] },
      { key: "pronouns", label: "Preferred Pronouns", options: ["He/Him", "She/Her", "They/Them", "He/They", "She/They", "Any pronouns", "Other"] },
    ].map(({ key, label, options }) => (
      <div key={key}>
        <label className={labelClass}>{label}</label>
        <select className={selectClass} value={data[key] || ""} onChange={(e) => update(key, e.target.value)}>
          <option value="">Select...</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
    ))}
  </div>
);

const StepPersonality = ({ data, update }: StepProps) => {
  const loveLangs = ["Words of Affirmation", "Acts of Service", "Receiving Gifts", "Quality Time", "Physical Touch"];
  const toggleLang = (type: string, lang: string) => {
    const key = `loveLang_${type}`;
    const current: string[] = data[key] || [];
    if (current.includes(lang)) update(key, current.filter((l: string) => l !== lang));
    else if (current.length < 3) update(key, [...current, lang]);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">Section 4: Personality Profile</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Astrology Sun Sign</label>
          <select className={selectClass} value={data.zodiac || ""} onChange={(e) => update("zodiac", e.target.value)}>
            <option value="">Select sign</option>
            {["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>MBTI Type</label>
          <select className={selectClass} value={data.mbti || ""} onChange={(e) => update("mbti", e.target.value)}>
            <option value="">Select MBTI</option>
            {["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"].map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Social Battery</label>
        <select className={selectClass} value={data.socialBattery || ""} onChange={(e) => update("socialBattery", e.target.value)}>
          <option value="">Select...</option>
          <option>Full introvert — recharge alone</option>
          <option>Mostly introverted</option>
          <option>Ambivert — depends on the mood</option>
          <option>Mostly extroverted</option>
          <option>Full extrovert — always charged</option>
        </select>
      </div>
      {["receive", "provide"].map((type) => (
        <div key={type}>
          <label className={labelClass}>Love Language ({type === "receive" ? "How you receive" : "How you give"}) <span className="text-muted-foreground font-normal">— max 3</span></label>
          <div className="flex flex-wrap gap-2">
            {loveLangs.map((lang) => {
              const selected = (data[`loveLang_${type}`] || []).includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLang(type, lang)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selected ? "bg-gold/10 border-gold text-gold" : "border-border text-muted-foreground hover:border-gold/20"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const StepInterests = ({ data, update }: StepProps) => {
  const vibes = ["Music & Bands", "Gaming", "Anime & Manga", "Sports & Fitness", "Arts & Crafts", "Tech & Coding", "Movies & Series", "K-Pop / K-Drama", "Books & Literature", "Food & Cooking", "Travel & Adventure", "Memes & Internet Culture"];
  const toggleVibe = (v: string) => {
    const current: string[] = data.vibes || [];
    if (current.includes(v)) update("vibes", current.filter((x: string) => x !== v));
    else update("vibes", [...current, v]);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">Section 5: Interests Inventory</h2>
      <p className="text-xs text-muted-foreground">Select at least 3 vibe categories. The more you pick, the better the match.</p>
      <div className="flex flex-wrap gap-2">
        {vibes.map((v) => {
          const selected = (data.vibes || []).includes(v);
          return (
            <button
              key={v}
              type="button"
              onClick={() => toggleVibe(v)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                selected ? "bg-gold/10 border-gold text-gold shadow-gold" : "border-border text-muted-foreground hover:border-gold/20"
              }`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {(data.vibes || []).length > 0 && (
        <p className="text-xs text-gold">{(data.vibes || []).length} selected {(data.vibes || []).length < 3 && "— need at least 3"}</p>
      )}
      <div>
        <label className={labelClass}>Specify your interests <span className="text-muted-foreground font-normal">(optional)</span></label>
        <textarea className={inputClass + " h-20 resize-none"} placeholder="e.g. I play Valorant, love Studio Ghibli..." value={data.interestDetail || ""} onChange={(e) => update("interestDetail", e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Preferred College</label>
          <select className={selectClass} value={data.prefCollege || ""} onChange={(e) => update("prefCollege", e.target.value)}>
            <option value="">Any</option><option>CICT</option><option>CAS</option><option>COE</option><option>CON</option><option>COM</option><option>PESCAR</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Preferred Year Level</label>
          <select className={selectClass} value={data.prefYear || ""} onChange={(e) => update("prefYear", e.target.value)}>
            <option value="">Any</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const StepTerms = ({ data, update }: StepProps) => {
  const checks = [
    { key: "consent1", label: "I authorize CICT SC to verify my identity and WVSU enrollment status." },
    { key: "consent2", label: "I consent to my data being used solely for matching purposes within CALEBel." },
    { key: "consent3", label: "I understand the registration fee is non-refundable." },
    { key: "consent4", label: "I agree to abide by the Terms of Calibration and community guidelines." },
  ];

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">Section 6: Terms of Calibration</h2>
      <p className="text-sm text-muted-foreground">Please read and agree to the following before submitting your blueprint.</p>
      <div className="space-y-3">
        {checks.map(({ key, label }) => (
          <label key={key} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data[key] || false}
              onChange={(e) => update(key, e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-border accent-gold"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
          </label>
        ))}
      </div>
      <div className="bg-muted/50 border border-border rounded-xl p-4 mt-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Disclaimer:</strong> CALEBel is organized by the CICT Student Council for entertainment purposes. The SC is not responsible for interactions beyond the platform. Always prioritize your safety and meet in public spaces.
        </p>
      </div>
    </div>
  );
};

export default Register;
