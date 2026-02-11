// Simple authentication utilities

export function isAuthenticated(): boolean {
  const userId = localStorage.getItem("calebelUserId");
  return !!userId;
}

export function getUserId(): string | null {
  return localStorage.getItem("calebelUserId");
}

export function signOut(): void {
  localStorage.removeItem("calebelUserId");
  localStorage.removeItem("calebelMatchId");
  localStorage.removeItem("calebelMatchAlias");
  localStorage.removeItem("calebelChatUnlocked");
}
