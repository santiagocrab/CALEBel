import { useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { recalibrateMatch, uploadImage } from "@/lib/api";

const Recalibrate = () => {
  const [gcash, setGcash] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofName, setProofName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

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
    try {
      const matchId = localStorage.getItem("calebelMatchId") || "";
      const userId = localStorage.getItem("calebelUserId") || "";
      await recalibrateMatch(matchId, userId, gcash, proofUrl);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recalibration failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2 text-center">
            Recalibrate Your Match
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Upload PHP 20 proof to re-enter the pool with priority.
          </p>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            {done ? (
              <div className="text-center text-foreground">
                ReCALEBration submitted. You’ll be notified once a new match is found.
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5 font-display">
                    GCash Reference Number
                  </label>
                  <input
                    value={gcash}
                    onChange={(e) => setGcash(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    placeholder="e.g. 1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5 font-display">
                    Proof of Payment
                  </label>
                  <label className="flex items-center justify-center gap-2 w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-gold/40 cursor-pointer transition-colors bg-muted/50">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload screenshot"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
                  </label>
                  {proofName && <p className="text-xs text-gold mt-1">Uploaded: {proofName}</p>}
                </div>
                <button
                  onClick={submit}
                  disabled={!gcash || !proofUrl}
                  className="w-full px-6 py-2.5 rounded-full bg-gradient-gold text-navy-deep text-sm font-bold shadow-gold disabled:opacity-60"
                >
                  Submit Recalibration
                </button>
              </>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Recalibrate;
