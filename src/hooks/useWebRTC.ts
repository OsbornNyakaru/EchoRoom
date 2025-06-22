import { useEffect, useRef, useState, useCallback } from 'react';
import { apiRequest } from '../config/api';

interface UseWebRTCProps {
  personaId: string;
  replicaId: string;
  isEnabled: boolean;
  onConnectionStateChange?: (state: string) => void;
  onError?: (error: Error) => void;
}

interface WebRTCState {
  isConnected: boolean;
  isConnecting: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  error: string | null;
  connectionState: string;
  conversationUrl: string | null;
  conversationId: string | null;
}

export function useWebRTC({ 
  personaId,
  replicaId, 
  isEnabled, 
  onConnectionStateChange,
  onError 
}: UseWebRTCProps) {
  const [state, setState] = useState<WebRTCState>({
    isConnected: false,
    isConnecting: false,
    localStream: null,
    remoteStream: null,
    error: null,
    connectionState: 'new',
    conversationUrl: null,
    conversationId: null
  });

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  
  // Add refs to prevent multiple simultaneous calls
  const initializationInProgress = useRef(false);
  const cleanupInProgress = useRef(false);
  const lastInitializationAttempt = useRef<number>(0);

  // Initialize Tavus CVI conversation
  const initializeWebRTC = useCallback(async () => {
    // Prevent multiple simultaneous initialization attempts
    if (!isEnabled || state.isConnecting || initializationInProgress.current) {
      console.log('🚫 Skipping initialization - already in progress or disabled');
      return;
    }

    // Prevent rapid successive calls (debounce)
    const now = Date.now();
    if (now - lastInitializationAttempt.current < 2000) {
      console.log('🚫 Skipping initialization - too soon after last attempt');
      return;
    }
    lastInitializationAttempt.current = now;

    // Validate required parameters
    if (!personaId || !replicaId) {
      const error = 'Missing required parameters: personaId and replicaId are required';
      console.error('❌ Tavus CVI initialization error:', error);
      setState(prev => ({ 
        ...prev, 
        error, 
        isConnecting: false,
        connectionState: 'failed'
      }));
      onError?.(new Error(error));
      return;
    }

    initializationInProgress.current = true;
    setState(prev => ({ ...prev, isConnecting: true, error: null, connectionState: 'connecting' }));

    try {
      console.log('🎭 Initializing Tavus CVI conversation for persona:', personaId, 'replica:', replicaId);

      // Get user media for local preview (optional for CVI)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        setState(prev => ({ ...prev, localStream: stream }));
        console.log('✅ Local media stream acquired');
      } catch (mediaError) {
        console.warn('⚠️ Could not access camera/microphone:', mediaError);
        // Continue without local stream - CVI can work without it
      }

      // Create Tavus CVI conversation with proper payload structure
      console.log('📤 Creating Tavus CVI conversation...');
      
      const requestPayload = {
        personaId: personaId.trim(),
        replicaId: replicaId.trim(),
        conversationalContext: {
          greeting: 'Hello! I\'m ready to have a conversation.',
          personality: 'friendly and helpful',
          topic: 'general conversation'
        }
      };

      console.log('📋 Request payload:', requestPayload);

      const response = await apiRequest('/api/tavus/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      const conversationData = await response.json();
      
      console.log('📊 Tavus API response:', conversationData);

      if (!conversationData.success) {
        throw new Error(conversationData.error || 'Failed to create CVI conversation');
      }

      if (!conversationData.conversationUrl) {
        throw new Error('No conversation URL received from Tavus API');
      }

      console.log('✅ Tavus CVI conversation created successfully');
      console.log('🔗 Conversation URL:', conversationData.conversationUrl);
      console.log('🆔 Conversation ID:', conversationData.conversationId);

      setState(prev => ({ 
        ...prev, 
        conversationUrl: conversationData.conversationUrl,
        conversationId: conversationData.conversationId,
        isConnected: true,
        isConnecting: false,
        connectionState: 'connected',
        error: null
      }));

      onConnectionStateChange?.('connected');

    } catch (error) {
      console.error('❌ Failed to initialize Tavus CVI conversation:', error);
      
      let errorMessage = 'Failed to create conversation';
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Invalid persona or replica ID. Please check your configuration.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please check your Tavus API key.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Persona or replica not found. Please verify the IDs are correct.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Tavus server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isConnecting: false,
        connectionState: 'failed'
      }));
      onConnectionStateChange?.('failed');
      onError?.(new Error(errorMessage));
    } finally {
      initializationInProgress.current = false;
    }
  }, [isEnabled, personaId, replicaId, state.isConnecting, onConnectionStateChange, onError]);

  // Cleanup function
  const cleanup = useCallback(async () => {
    // Prevent multiple simultaneous cleanup attempts
    if (cleanupInProgress.current) {
      console.log('🚫 Cleanup already in progress, skipping...');
      return;
    }

    cleanupInProgress.current = true;
    console.log('🧹 Cleaning up Tavus CVI resources');

    try {
      // End the Tavus CVI conversation if we have one
      if (state.conversationId) {
        try {
          console.log('🛑 Ending conversation:', state.conversationId);
          await apiRequest(`/api/tavus/conversations/${state.conversationId}`, {
            method: 'DELETE'
          });
          console.log('✅ Tavus CVI conversation ended');
        } catch (error) {
          console.error('❌ Failed to end Tavus CVI conversation:', error);
          // Don't throw here - cleanup should be resilient
        }
      }

      // Stop local media stream
      if (state.localStream) {
        console.log('🎥 Stopping local media stream');
        state.localStream.getTracks().forEach(track => {
          track.stop();
        });
      }

      setState({
        isConnected: false,
        isConnecting: false,
        localStream: null,
        remoteStream: null,
        error: null,
        connectionState: 'new',
        conversationUrl: null,
        conversationId: null
      });

      console.log('✅ Cleanup completed');
    } finally {
      cleanupInProgress.current = false;
    }
  }, [state.localStream, state.conversationId]);

  // Toggle mute/unmute (for local stream if available)
  const toggleMute = useCallback(() => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled;
      }
    }
    return false;
  }, [state.localStream]);

  // Toggle video on/off (for local stream if available)
  const toggleVideo = useCallback(() => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled;
      }
    }
    return false;
  }, [state.localStream]);

  // Effect to handle local video display
  useEffect(() => {
    if (state.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = state.localStream;
    }
  }, [state.localStream]);

  // Cleanup on unmount or when disabled - but don't auto-cleanup when enabled
  useEffect(() => {
    // Only cleanup when component unmounts or is explicitly disabled
    return () => {
      if (state.conversationId || state.localStream) {
        cleanup();
      }
    };
  }, []); // Empty dependency array - only run on unmount

  // Separate effect for handling enabled/disabled state
  useEffect(() => {
    if (!isEnabled && (state.isConnected || state.isConnecting)) {
      console.log('🔄 Component disabled, cleaning up...');
      cleanup();
    }
  }, [isEnabled, state.isConnected, state.isConnecting, cleanup]);

  return {
    ...state,
    initializeWebRTC,
    cleanup,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef
  };
}