const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function handleFetch(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }
    return response.json();
  } catch (err) {
    if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("Failed to fetch"))) {
      throw new Error(`Cannot connect to backend server. Please make sure the backend is running on port 4000.`);
    }
    if (err instanceof Error && (err.message.includes("NetworkError") || err.message.includes("ERR_"))) {
      throw new Error(`Network error. Please check your connection and ensure the backend is running on port 4000.`);
    }
    throw err;
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
