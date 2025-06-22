import { useEffect, useState } from "react";
import { fetchTavusAvatarUrl } from "../utils/tavus";

export function useTavusAvatar(personaId: string | null) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatar = async () => {
    if (!personaId) {
      setError('No persona ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await fetchTavusAvatarUrl(personaId);
      setAvatarUrl(url);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Tavus avatar';
      setError(errorMessage);
      setAvatarUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (personaId) {
      fetchAvatar();
    } else {
      setAvatarUrl(null);
      setError(null);
      setLoading(false);
    }
  }, [personaId]);

  const refetch = () => {
    fetchAvatar();
  };

  return { 
    avatarUrl, 
    loading, 
    error, 
    refetch 
  };
}