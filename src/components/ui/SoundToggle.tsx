import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './button';
import { soundManager } from '../../lib/soundUtils';

interface SoundToggleProps {
  className?: string;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ className = '' }) => {
  const [isMuted, setIsMuted] = React.useState(soundManager.getMuted());

  const handleToggle = () => {
    const newMutedState = soundManager.toggleMute();
    setIsMuted(newMutedState);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Button
        onClick={handleToggle}
        variant="outline"
        size="sm"
        className="glass-card border-white/20 text-white hover:bg-white/10 p-2 rounded-full"
        title={isMuted ? 'Enable sound effects' : 'Disable sound effects'}
      >
        <motion.div
          animate={{ scale: isMuted ? 0.9 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-gray-400" />
          ) : (
            <Volume2 className="h-4 w-4 text-blue-400" />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default SoundToggle;