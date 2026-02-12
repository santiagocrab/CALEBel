import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Upload, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { uploadImage } from "@/lib/api";

const Rematch = () => {
  const navigate = useNavigate();
  const [gcashRef, setGcashRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async () => {
    if (!gcashRef || !proofUrl) {
      setError("Please provide GCash reference number and payment proof.");
      return;
    }

    if (!userId) {
      setError("Please sign in first.");
      navigate("/signin");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:4000/api/rematch/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          gcashRef,
          paymentProofUrl: proofUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request rematch");
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

  return (
    <PageBackground className="pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 border-2 border-rose-pink/30"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-pink to-wine-rose flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-wine-rose mb-2">
              Request Rematch
            </h1>
            <p className="text-wine-rose/70 font-body">
              Not satisfied with your current match? Request a rematch for ₱15.00
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-wine-rose mb-2">Rematch Request Submitted!</h2>
              <p className="text-wine-rose/70 mb-4">
                Your payment is being verified. We'll email you once we find your new match!
              </p>
              <p className="text-sm text-wine-rose/60">Redirecting...</p>
            </motion.div>
          ) : (
            <>
              {/* Payment Info */}
              <div className="mb-6 p-5 bg-gradient-to-br from-rose-pink/10 via-white/80 to-blush-pink/10 rounded-2xl border-[3px] border-rose-pink shadow-lg" style={{ borderColor: '#EE6983' }}>
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

              <div className="space-y-6">
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

                <button
                  onClick={handleSubmit}
                  disabled={!gcashRef || !proofUrl || submitting || uploading}
                  className="w-full py-4 bg-gradient-primary text-ivory-cream font-bold rounded-xl shadow-soft hover:shadow-rose-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      <span>Request Rematch</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate("/chat")}
                  className="w-full py-3 border-2 border-rose-pink/40 text-rose-pink font-semibold rounded-xl hover:border-rose-pink hover:bg-rose-pink/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Rematch;
