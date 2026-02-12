import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, CheckCircle, Loader, AlertCircle, RefreshCw, Heart } from "lucide-react";
import { recalibrateMatch, uploadImage } from "@/lib/api";
import { PageBackground } from "@/components/PageBackground";
import { useNavigate } from "react-router-dom";

const Recalibrate = () => {
  const navigate = useNavigate();
  const [gcash, setGcash] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofName, setProofName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleUpload = async (file?: File) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Only jpg, png, or webp images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be 5MB or less.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const result = await uploadImage(file);
      setProofUrl(result.url);
      setProofName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const matchId = localStorage.getItem("calebelMatchId") || "";
      const userId = localStorage.getItem("calebelUserId") || "";
      await recalibrateMatch(matchId, userId, gcash, proofUrl);
      setDone(true);
      setTimeout(() => {
        navigate("/no-partner");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recalibration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageBackground className="pt-20 pb-16 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative inline-block mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
              <RefreshCw className="w-10 h-10 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-amber-400/30 border-t-transparent"
            />
          </motion.div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-wine-rose mb-3">
            Recalibrate Your Match
          </h1>
          <p className="text-wine-rose/70 text-base md:text-lg max-w-md mx-auto">
            Pay ₱15 to re-enter the matching pool with priority and update your compatibility blueprint.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-10 text-center border-2 border-emerald-300 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </motion.div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-wine-rose mb-3">
                Recalibration Submitted! ✅
              </h2>
              <p className="text-wine-rose/70 text-base mb-4">
                Your payment is being verified. We'll email you once we find your new match!
              </p>
              <p className="text-sm text-wine-rose/60">Redirecting...</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border-2 border-amber-200"
            >
              {/* Payment Info */}
              <div className="mb-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
                <p className="text-lg font-semibold text-wine-rose mb-3 text-center">Recalibration Fee: ₱15.00</p>
                <p className="text-sm font-semibold text-wine-rose mb-4 text-center">Scan QR Code to Pay via GCash</p>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-xl border-2 border-amber-300 shadow-lg">
                    <img 
                      src="/qr.jpg" 
                      alt="GCash QR Code for CALEBel Recalibration Payment" 
                      className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain"
                    />
                  </div>
                </div>
                <p className="text-xs text-wine-rose/70 text-center mb-2">Transfer fees may apply.</p>
                <p className="text-xs text-wine-rose font-semibold text-center">CALEBel</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-wine-rose mb-2 font-display">
                    GCash Reference Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    value={gcash}
                    onChange={(e) => setGcash(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-amber-200 text-wine-rose text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-wine-rose/40"
                    placeholder="e.g. 1234567890"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-wine-rose mb-2 font-display">
                    Proof of Payment <span className="text-red-600">*</span>
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full py-10 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-400 cursor-pointer transition-colors bg-amber-50/50">
                    {uploading ? (
                      <>
                        <Loader className="w-5 h-5 text-amber-600 animate-spin" />
                        <span className="text-sm text-amber-600 font-semibold">Uploading...</span>
                      </>
                    ) : proofName ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm text-emerald-600 font-semibold">Uploaded: {proofName}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-amber-600" />
                        <span className="text-sm text-amber-600 font-semibold">Click to upload screenshot</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files?.[0])}
                      required
                    />
                  </label>
                  {proofName && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      File uploaded successfully
                    </p>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                <button
                  onClick={submit}
                  disabled={!gcash || !proofUrl || submitting || uploading}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Submitting Recalibration...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Submit Recalibration</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate("/chat")}
                  className="w-full py-3 border-2 border-amber-300 text-amber-700 font-semibold rounded-xl hover:bg-amber-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageBackground>
  );
};

export default Recalibrate;
