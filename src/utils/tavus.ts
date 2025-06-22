import { apiRequest } from '../config/api';

export interface TavusAvatarUrlResponse {
  success: boolean;
  avatarUrl?: string;
  url?: string;
  error?: string;
  isDemo?: boolean;
  isStaticImage?: boolean;
}

export interface TavusConversationResponse {
  success: boolean;
  conversationUrl?: string;
  conversationId?: string;
  personaId?: string;
  replicaId?: string;
  status?: string;
  error?: string;
}

/**
 * Fetches the Tavus avatar URL for a given personaId via backend proxy.
 */
export async function fetchTavusAvatarUrl(personaId: string): Promise<{
  url: string;
  isDemo: boolean;
  isStaticImage: boolean;
}> {
  if (!personaId) {
    throw new Error("No personaId provided to fetch Tavus avatar.");
  }

  try {
    // Use the existing API configuration and request helper
    const response = await apiRequest(`/api/tavus/avatar/${personaId}/url`, {
      method: 'GET',
    });

    const data: TavusAvatarUrlResponse = await response.json();
    
    // Handle different response formats from your backend
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch avatar URL from backend');
    }

    // Support both 'avatarUrl' and 'url' field names
    const avatarUrl = data.avatarUrl || data.url;
    
    if (!avatarUrl) {
      throw new Error('Invalid response from backend: avatar URL missing');
    }

    return {
      url: avatarUrl,
      isDemo: data.isDemo || false,
      isStaticImage: data.isStaticImage || false
    };
  } catch (error: any) {
    // Enhanced error handling
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to backend server');
    }
    
    if (error.message.includes('API request failed: 404')) {
      throw new Error(`Avatar not found for persona: ${personaId}`);
    }
    
    if (error.message.includes('API request failed: 401')) {
      throw new Error('Authentication failed: Check your API token');
    }
    
    if (error.message.includes('API request failed: 500')) {
      throw new Error('Backend server error: Please try again later');
    }

    // Re-throw our custom errors or create a generic one
    throw new Error(
      error?.message || 'Failed to fetch Tavus avatar URL'
    );
  }
}

/**
 * Creates a Tavus CVI conversation for a given personaId and replicaId.
 */
export async function createTavusConversation(
  personaId: string, 
  replicaId: string, 
  conversationalContext?: any
): Promise<TavusConversationResponse> {
  if (!personaId || !replicaId) {
    throw new Error("Both personaId and replicaId are required to create a Tavus conversation.");
  }

  try {
    const response = await apiRequest('/api/tavus/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personaId,
        replicaId,
        ...(conversationalContext && { conversationalContext })
      })
    });

    const data: TavusConversationResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create Tavus conversation');
    }

    return data;
  } catch (error: any) {
    // Enhanced error handling
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to backend server');
    }
    
    if (error.message.includes('API request failed: 404')) {
      throw new Error(`Persona or replica not found: ${personaId}, ${replicaId}`);
    }
    
    if (error.message.includes('API request failed: 401')) {
      throw new Error('Authentication failed: Check your Tavus API key');
    }
    
    if (error.message.includes('API request failed: 500')) {
      throw new Error('Tavus API server error: Please try again later');
    }

    throw new Error(
      error?.message || 'Failed to create Tavus conversation'
    );
  }
}

/**
 * Ends a Tavus CVI conversation.
 */
export async function endTavusConversation(conversationId: string): Promise<void> {
  if (!conversationId) {
    throw new Error("ConversationId is required to end a Tavus conversation.");
  }

  try {
    const response = await apiRequest(`/api/tavus/conversations/${conversationId}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to end Tavus conversation');
    }
  } catch (error: any) {
    console.error('Error ending Tavus conversation:', error);
    // Don't throw here as cleanup should be resilient
  }
}

// Alternative function if your backend returns the full avatar object
export async function fetchTavusAvatarData(personaId: string) {
  if (!personaId) {
    throw new Error("No personaId provided to fetch Tavus avatar data.");
  }

  try {
    const response = await apiRequest(`/api/tavus/avatar/${personaId}`, {
      method: 'GET',
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch avatar data');
    }

    return data.avatar;
  } catch (error: any) {
    console.error('Error fetching Tavus avatar data:', error);
    throw error;
  }
}

/**
 * Fetches available Tavus replicas for CVI.
 */
export async function fetchTavusReplicas() {
  try {
    const response = await apiRequest('/api/tavus/replicas', {
      method: 'GET',
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch Tavus replicas');
    }

    return data.replicas;
  } catch (error: any) {
    console.error('Error fetching Tavus replicas:', error);
    throw error;
  }
}