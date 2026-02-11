import { Request, Response } from "express";

export function handleUpload(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  // Return full URL that frontend can use to display the image
  // Also return relative path for backend storage
  const apiBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
  const fullUrl = `${apiBase}/uploads/${file.filename}`;
  const relativeUrl = `/uploads/${file.filename}`;
  
  // Return both - frontend can use fullUrl for display, relativeUrl for storage
  return res.status(201).json({ 
    url: fullUrl,  // Full URL for frontend to display
    path: relativeUrl,  // Relative path for backend storage
    filename: file.filename 
  });
}
