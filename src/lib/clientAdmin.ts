// Client-side helper for admin API requests

export function getAdminAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("orma_admin_token") ||
      sessionStorage.getItem("orma_admin_token") ||
      localStorage.getItem("athar_admin_token") ||
      sessionStorage.getItem("athar_admin_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-orma-admin-token"] = token;
      headers["x-athar-admin-token"] = token;
    }
  }
  return headers;
}
