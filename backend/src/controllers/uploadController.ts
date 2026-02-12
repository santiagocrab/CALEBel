import { Request, Response } from "express";

export function handleUpload(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  // Build a public backend URL that works behind Render/Vercel proxies.
  const forwardedProto = req.get("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "http";
  const host = req.get("x-forwarded-host") || req.get("host");
  const detectedBase = host ? `${protocol}://${host}` : `http://localhost:${process.env.PORT || 4000}`;
  const apiBase = process.env.API_BASE_URL || process.env.BACKEND_URL || detectedBase;
  const fullUrl = `${apiBase}/uploads/${file.filename}`;
  const relativeUrl = `/uploads/${file.filename}`;
  
  // Return both - frontend can use fullUrl for display, relativeUrl for storage
  return res.status(201).json({ 
    url: fullUrl,  // Full URL for frontend to display
    path: relativeUrl,  // Relative path for backend storage
    filename: file.filename 
  });
}
