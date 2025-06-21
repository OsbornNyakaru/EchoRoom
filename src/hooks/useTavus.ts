import { useEffect, useState } from "react";
import { fetchTavusAvatarUrl } from "../utils/tavus";

export function useTavusAvatar(personaId: string) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTavusAvatarUrl(personaId)
      .then(url => {
        setAvatarUrl(url);
        setError(null);
      })
      .catch(err => {
        setError("Failed to load Tavus avatar.");
        setAvatarUrl(null);
      })
      .finally(() => setLoading(false));
  }, [personaId]);

  return { avatarUrl, loading, error };
}