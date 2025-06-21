import axios from "axios";

/**
 * Fetches the Tavus avatar URL for a given personaId via backend proxy.
 */
export async function fetchTavusAvatarUrl(personaId: string): Promise<string> {
  if (!personaId) throw new Error("No personaId provided to fetch Tavus avatar.");
  try {
    // Call your backend proxy instead of Tavus API directly
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const response = await axios.get(`${backendUrl}/api/tavus-avatar/${personaId}`);
    if (response.data && response.data.avatarUrl) {
      return response.data.avatarUrl;
    } else {
      throw new Error("Invalid response from Tavus API: avatarUrl missing");
    }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
      error?.message ||
      "Failed to fetch Tavus avatar URL"
    );
  }
}
