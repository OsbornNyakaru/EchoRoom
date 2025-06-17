import React, { useEffect, useState } from 'react';

interface ElevenLabsConvoAIWidgetProps {
  agentId: string;
}

const ElevenLabsConvoAIWidget: React.FC<ElevenLabsConvoAIWidgetProps> = ({ agentId }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Common mobile breakpoint

  useEffect(() => {
    // Dynamically load the ElevenLabs ConvoAI widget embed script
    const scriptId = 'elevenlabs-convai-widget-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.body.appendChild(script);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Use the 'expandable' variant for mobile (colorful disk) and 'full' for desktop
  const variant = isMobile ? 'expandable' : 'full';

  return (
    <elevenlabs-convai
      agent-id={agentId}
      variant={variant}
      // You can add more attributes here for visual customization if needed
      // For example, to make the orb more colorful:
      // avatar-orb-color-1="#FF0000"
      // avatar-orb-color-2="#0000FF"
    ></elevenlabs-convai>
  );
};

export default ElevenLabsConvoAIWidget; 