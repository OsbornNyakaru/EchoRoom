import { useState } from 'react';

const useVoice = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
  };

  return {
    isSpeaking,
    isMuted,
    toggleMute,
    toggleSpeaking,
  };
};

export default useVoice; 