// In production, always use same-origin /api and rely on Vercel rewrites.
// This avoids browser-side CORS issues against Render.
const API_BASE = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000")
  : "";

async function handleFetch(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use status text
        errorData = { error: `Request failed with status ${response.status}` };
      }
      throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
  } catch (err) {
    // Check for CORS errors specifically
    if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
      // Check if it's a CORS error by looking at the URL
      if (url.includes("onrender.com") || url.includes("calebel.onrender.com")) {
        throw new Error(
          `CORS Error: The backend is blocking requests from this origin. ` +
          `Please ensure CORS_ORIGINS environment variable in Render includes: ${typeof window !== 'undefined' ? window.location.origin : 'your frontend URL'}. ` +
          `Check DEPLOYMENT.md for instructions.`
        );
      }
      throw new Error(`Cannot connect to backend server at ${url}. Please make sure the backend is running and the API URL is correct.`);
    }
    if (err instanceof Error && (err.message.includes("NetworkError") || err.message.includes("ERR_"))) {
      throw new Error(`Network error. Please check your connection and ensure the backend is running at ${API_BASE}.`);
    }
    // Re-throw with better message if it's already an Error
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`An unexpected error occurred: ${String(err)}`);
  }
}

export async function registerUser(payload: Record<string, any>) {
  return handleFetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return handleFetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData
  });
}

export async function requestVerification(userId: string, email: string) {
  return handleFetch(`${API_BASE}/api/verify/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email })
  });
}

export async function confirmVerification(userId: string, code: string) {
  return handleFetch(`${API_BASE}/api/verify/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, code })
  });
}

export async function recalibrateMatch(
  matchId: string,
  userId: string,
  gcashRef: string,
  paymentProofUrl: string
) {
  return handleFetch(`${API_BASE}/api/recalibrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId, userId, gcashRef, paymentProofUrl })
  });
}

export async function fetchReveal(matchId: string, userId: string) {
  return handleFetch(`${API_BASE}/api/reveal/${matchId}?userId=${userId}`, {
    method: "GET"
  });
}

export async function fetchMatch(userId: string) {
  return handleFetch(`${API_BASE}/api/match/${userId}`, {
    method: "GET"
  });
}

export async function consentChat(matchId: string, userId: string, consent: boolean) {
  return handleFetch(`${API_BASE}/api/match/consent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId, userId, consent })
  });
}

export async function consentReveal(matchId: string, userId: string, consent: boolean) {
  return handleFetch(`${API_BASE}/api/match/consent/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId, userId, consent })
  });
}

export async function fetchChat(matchId: string) {
  return handleFetch(`${API_BASE}/api/chat/${matchId}`, {
    method: "GET"
  });
}

export async function sendChatMessage(matchId: string, senderId: string, message: string) {
  return handleFetch(`${API_BASE}/api/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId, senderId, message })
  });
}

export async function requestSignIn(email: string) {
  return handleFetch(`${API_BASE}/api/auth/signin/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
}

export async function verifySignIn(email: string, code: string) {
  return handleFetch(`${API_BASE}/api/auth/signin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code })
  });
}
