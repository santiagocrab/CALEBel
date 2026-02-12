import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Upload, Loader, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { uploadImage } from "@/lib/api";
import { PageBackground } from "@/components/PageBackground";

const Rematch = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = Payment, 1 = Blueprint
  const [gcashRef, setGcashRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Blueprint form data
  const [blueprintData, setBlueprintData] = useState({
    alias: "",
    orientation: "",
    genderIdentity: "",
    zodiac: "",
    mbti: "",
    socialBattery: "",
    loveLang_receive: [] as string[],
    loveLang_provide: [] as string[],
    vibes: [] as string[],
    interestDetail: "",
    prefCollege: "",
    prefYear: ""
  });

  const userId = localStorage.getItem("calebelUserId") || "";

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const result = await uploadImage(file);
      setProofUrl(result.url);
      setProofFile(file);
    } catch (err: any) {
      setError(err.message || "Failed to upload payment proof");
    } finally {
      setUploading(false);
    }
  };

  const updateBlueprint = (key: string, value: any) => {
    setBlueprintData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleLoveLang = (type: "receive" | "provide", lang: string) => {
    const key = `loveLang_${type}` as keyof typeof blueprintData;
    const current: string[] = (blueprintData[key] as string[]) || [];
    if (current.includes(lang)) {
      updateBlueprint(key, current.filter((l) => l !== lang));
    } else if (current.length < 3) {
      updateBlueprint(key, [...current, lang]);
    }
  };

  const toggleVibe = (vibe: string) => {
    const current = blueprintData.vibes || [];
    if (current.includes(vibe)) {
      updateBlueprint("vibes", current.filter((v) => v !== vibe));
    } else {
      updateBlueprint("vibes", [...current, vibe]);
    }
  };

  const handleSubmit = async () => {
    if (step === 0) {
      // Payment step validation
      if (!gcashRef || !proofUrl) {
        setError("Please provide GCash reference number and payment proof.");
        return;
      }
      setStep(1); // Move to blueprint step
      return;
    }

    // Blueprint step - submit everything
    if (!userId) {
      setError("Please sign in first.");
      navigate("/signin");
      return;
    }

    // Validate blueprint
    if (!blueprintData.alias || !blueprintData.orientation || !blueprintData.genderIdentity ||
        !blueprintData.zodiac || !blueprintData.mbti || !blueprintData.socialBattery ||
        blueprintData.loveLang_receive.length === 0 || blueprintData.loveLang_provide.length === 0 ||
        blueprintData.vibes.length < 3) {
      setError("Please fill in all required blueprint fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Submit rematch request with payment
      const rematchResponse = await fetch("/api/rematch/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          gcashRef,
          paymentProofUrl: proofUrl
        })
      });

      if (!rematchResponse.ok) {
        const errorData = await rematchResponse.json();
        throw new Error(errorData.error || "Failed to request rematch");
      }

      // Update user profile with new blueprint data
      const updateResponse = await fetch("/api/rematch/update-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          blueprint: {
            alias: blueprintData.alias,
            sogiesc: {
              sexualOrientation: blueprintData.orientation,
              genderIdentity: blueprintData.genderIdentity
            },
            personality: {
              sunSign: blueprintData.zodiac,
              mbti: blueprintData.mbti,
              socialBattery: blueprintData.socialBattery
            },
            loveLanguageReceive: blueprintData.loveLang_receive,
            loveLanguageProvide: blueprintData.loveLang_provide,
            interests: [
              ...blueprintData.vibes,
              ...(blueprintData.interestDetail ? [blueprintData.interestDetail] : [])
            ],
            preferred: {
              college: blueprintData.prefCollege || "Any",
              yearLevel: blueprintData.prefYear || "Any"
            }
          }
        })
      });

      if (!updateResponse.ok) {
        console.warn("Blueprint update failed, but rematch request succeeded");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/no-partner");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to request rematch. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <PageBackground className="pt-20 pb-8 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full mx-4"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 border-2 border-rose-pink/30">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold text-wine-rose mb-2">Rematch Request Submitted!</h2>
            <p className="text-wine-rose/70 mb-4">
              Your payment and blueprint update are being processed. We'll email you once we find your new match!
            </p>
            <p className="text-sm text-wine-rose/60">Redirecting...</p>
          </div>
        </motion.div>
      </PageBackground>
    );
  }

  return (
    <PageBackground className="pt-20 pb-8 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 border-2 border-rose-pink/30"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-wine-rose mb-2">
              Request Rematch
            </h1>
            <p className="text-wine-rose/70 font-body text-sm md:text-base">
              Not satisfied with your current match? Request a rematch for ₱15.00 and update your compatibility blueprint
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step === 0 ? "bg-gradient-to-br from-rose-pink to-wine-rose text-white scale-110" : "bg-rose-pink/20 text-rose-pink"
              }`}>
                1
              </div>
              <div className="w-16 h-1 bg-rose-pink/30"></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step === 1 ? "bg-gradient-to-br from-rose-pink to-wine-rose text-white scale-110" : "bg-rose-pink/20 text-rose-pink"
              }`}>
                2
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-600 font-semibold mb-1">Error</p>
                <p className="text-red-600/80 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 ? (
                // Payment Step
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-wine-rose mb-2">Step 1: Payment</h2>
                    <p className="text-wine-rose/70">Pay the rematch fee of ₱15.00</p>
                  </div>

                  {/* Payment Info */}
                  <div className="p-6 bg-gradient-to-br from-rose-pink/10 via-white/80 to-blush-pink/10 rounded-2xl border-[3px] border-rose-pink shadow-lg">
                    <p className="text-lg font-semibold text-wine-rose mb-3 text-center">Rematch Fee: ₱15.00</p>
                    <p className="text-sm font-semibold text-wine-rose mb-4 text-center">Scan QR Code to Pay via GCash</p>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-white rounded-xl border-[3px] shadow-lg" style={{ borderColor: '#EE6983' }}>
                        <img 
                          src="/qr.jpg" 
                          alt="GCash QR Code for CALEBel Rematch Payment" 
                          className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-wine-rose/70 text-center mb-2">Transfer fees may apply.</p>
                    <p className="text-xs text-wine-rose font-semibold text-center">CALEBel</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-wine-rose mb-2">
                      GCash Reference Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={gcashRef}
                      onChange={(e) => setGcashRef(e.target.value)}
                      placeholder="e.g. 1234567890"
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-wine-rose mb-2">
                      Proof of Payment <span className="text-red-600">*</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed border-rose-pink/40 hover:border-rose-pink cursor-pointer transition-colors bg-white/50">
                      {uploading ? (
                        <>
                          <Loader className="w-5 h-5 text-rose-pink animate-spin" />
                          <span className="text-sm text-rose-pink">Uploading...</span>
                        </>
                      ) : proofFile ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600">Uploaded: {proofFile.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-rose-pink" />
                          <span className="text-sm text-rose-pink">Click to upload screenshot</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                // Blueprint Step
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-wine-rose mb-2">Step 2: Update Your Blueprint</h2>
                    <p className="text-wine-rose/70">Refresh your compatibility profile for better matching</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-wine-rose mb-2">
                        Alias <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={blueprintData.alias}
                        onChange={(e) => updateBlueprint("alias", e.target.value)}
                        placeholder="e.g. StarDust42"
                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-wine-rose mb-2">
                          Sexual Orientation <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={blueprintData.orientation}
                          onChange={(e) => updateBlueprint("orientation", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                          required
                        >
                          <option value="">Select...</option>
                          {["Heterosexual", "Homosexual", "Bisexual", "Pansexual", "Asexual", "Queer", "Prefer not to say", "Other"].map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-wine-rose mb-2">
                          Gender Identity <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={blueprintData.genderIdentity}
                          onChange={(e) => updateBlueprint("genderIdentity", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                          required
                        >
                          <option value="">Select...</option>
                          {["Man", "Woman", "Non-binary", "Genderqueer", "Genderfluid", "Agender", "Prefer not to say", "Other"].map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-wine-rose mb-2">
                          Zodiac Sign <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={blueprintData.zodiac}
                          onChange={(e) => updateBlueprint("zodiac", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                          required
                        >
                          <option value="">Select sign</option>
                          {["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-wine-rose mb-2">
                          MBTI Type <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={blueprintData.mbti}
                          onChange={(e) => updateBlueprint("mbti", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                          required
                        >
                          <option value="">Select MBTI</option>
                          {["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"].map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-wine-rose mb-2">
                        Social Battery <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={blueprintData.socialBattery}
                        onChange={(e) => updateBlueprint("socialBattery", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                        required
                      >
                        <option value="">Select...</option>
                        <option>Full introvert — recharge alone</option>
                        <option>Mostly introverted</option>
                        <option>Ambivert — depends on the mood</option>
                        <option>Mostly extroverted</option>
                        <option>Full extrovert — always charged</option>
                      </select>
                    </div>

                    {["receive", "provide"].map((type) => {
                      const loveLangs = ["Words of Affirmation", "Acts of Service", "Receiving Gifts", "Quality Time", "Physical Touch"];
                      const key = `loveLang_${type}` as keyof typeof blueprintData;
                      const selected = (blueprintData[key] as string[]) || [];
                      return (
                        <div key={type}>
                          <label className="block text-sm font-semibold text-wine-rose mb-2">
                            Love Language ({type === "receive" ? "How you receive" : "How you give"}) <span className="text-red-600">*</span> <span className="text-wine-rose/60 font-normal">— max 3</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {loveLangs.map((lang) => {
                              const isSelected = selected.includes(lang);
                              return (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => toggleLoveLang(type as "receive" | "provide", lang)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    isSelected 
                                      ? "bg-rose-pink/20 border-rose-pink text-wine-rose shadow-md" 
                                      : "border-rose-pink/30 text-wine-rose/70 hover:border-rose-pink/50"
                                  }`}
                                >
                                  {lang}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    <div>
                      <label className="block text-sm font-semibold text-wine-rose mb-2">
                        Interests <span className="text-red-600">*</span> <span className="text-wine-rose/60 font-normal">— select at least 3</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Music & Bands", "Gaming", "Anime & Manga", "Sports & Fitness", "Arts & Crafts", "Tech & Coding", "Movies & Series", "K-Pop / K-Drama", "Books & Literature", "Food & Cooking", "Travel & Adventure", "Memes & Internet Culture"].map((vibe) => {
                          const isSelected = blueprintData.vibes.includes(vibe);
                          return (
                            <button
                              key={vibe}
                              type="button"
                              onClick={() => toggleVibe(vibe)}
                              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                isSelected 
                                  ? "bg-rose-pink/20 border-rose-pink text-wine-rose shadow-md" 
                                  : "border-rose-pink/30 text-wine-rose/70 hover:border-rose-pink/50"
                              }`}
                            >
                              {vibe}
                            </button>
                          );
                        })}
                      </div>
                      {blueprintData.vibes.length > 0 && (
                        <p className={`text-xs mt-2 ${blueprintData.vibes.length < 3 ? "text-red-600" : "text-green-600"}`}>
                          {blueprintData.vibes.length} selected {blueprintData.vibes.length < 3 && "— need at least 3"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-wine-rose mb-2">
                        Additional Interests <span className="text-wine-rose/60 font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={blueprintData.interestDetail}
                        onChange={(e) => updateBlueprint("interestDetail", e.target.value)}
                        placeholder="e.g. I play Valorant, love Studio Ghibli..."
                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40 h-20 resize-none"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-wine-rose mb-2">Preferred College</label>
                        <select
                          value={blueprintData.prefCollege}
                          onChange={(e) => updateBlueprint("prefCollege", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                        >
                          <option value="">Any</option>
                          {["CICT", "CAS", "COE", "CON", "COM", "COC", "COD", "COL", "PESCAR"].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-wine-rose mb-2">Preferred Year Level</label>
                        <select
                          value={blueprintData.prefYear}
                          onChange={(e) => updateBlueprint("prefYear", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-pink/30 text-wine-rose focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
                        >
                          <option value="">Any</option>
                          {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"].map((y) => (
                            <option key={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 gap-4">
            <button
              onClick={() => step === 0 ? navigate("/chat") : setStep(0)}
              className="flex items-center gap-2 px-5 py-3 border-2 border-rose-pink/40 text-rose-pink font-semibold rounded-xl hover:border-rose-pink hover:bg-rose-pink/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> {step === 0 ? "Cancel" : "Back"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                (step === 0 && (!gcashRef || !proofUrl || uploading)) ||
                (step === 1 && submitting) ||
                (step === 1 && (!blueprintData.alias || !blueprintData.orientation || !blueprintData.genderIdentity ||
                  !blueprintData.zodiac || !blueprintData.mbti || !blueprintData.socialBattery ||
                  blueprintData.loveLang_receive.length === 0 || blueprintData.loveLang_provide.length === 0 ||
                  blueprintData.vibes.length < 3))
              }
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-pink to-wine-rose text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : step === 0 ? (
                <>
                  <span>Continue to Blueprint</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  <span>Submit Rematch Request</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </PageBackground>
  );
};

export default Rematch;
