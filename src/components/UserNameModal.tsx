import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { User, Shuffle, Check, X } from 'lucide-react';
import { generateAnonymousUserName } from '../lib/utils';
import { cn } from '@/lib/utils';

interface UserNameModalProps {
  isOpen: boolean;
  onConfirm: (userName: string) => void;
  onCancel: () => void;
  mood: string;
}

const UserNameModal: React.FC<UserNameModalProps> = ({ isOpen, onConfirm, onCancel, mood }) => {
  const [userName, setUserName] = useState('');
  const [isCustomName, setIsCustomName] = useState(false);
  const [generatedName, setGeneratedName] = useState('');

  // Generate a random name when modal opens
  useEffect(() => {
    if (isOpen) {
      const newName = generateAnonymousUserName();
      setGeneratedName(newName);
      setUserName(newName);
      setIsCustomName(false);
    }
  }, [isOpen]);

  const handleGenerateNew = () => {
    const newName = generateAnonymousUserName();
    setGeneratedName(newName);
    if (!isCustomName) {
      setUserName(newName);
    }
  };

  const handleUseGenerated = () => {
    setUserName(generatedName);
    setIsCustomName(false);
  };

  const handleCustomInput = (value: string) => {
    setUserName(value);
    setIsCustomName(true);
  };

  const handleConfirm = () => {
    if (userName.trim()) {
      onConfirm(userName.trim());
    }
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      hopeful: '#FFE66D',
      lonely: '#8E9AAF',
      motivated: '#FFB4A2',
      calm: '#A3C4BC',
      loving: '#FF8FA3',
      joyful: '#FFD93D',
    };
    return colors[mood?.toLowerCase() as keyof typeof colors] || '#A3C4BC';
  };

  const moodColor = getMoodColor(mood);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="enhanced-glass p-6 rounded-2xl border-2" style={{ borderColor: moodColor + '40' }}>
            <div className="text-center mb-6">
              <motion.div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: moodColor + '20', border: `2px solid ${moodColor}40` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <User className="w-8 h-8" style={{ color: moodColor }} />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Identity</h2>
              <p className="text-gray-300 text-sm">
                How would you like to be known in your {mood} room?
              </p>
            </div>

            <div className="space-y-4">
              {/* Generated Name Option */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Generated Anonymous Name</label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUseGenerated}
                    variant="outline"
                    className={cn(
                      "flex-1 glass-card border-white/20 text-white hover:bg-white/10 justify-start",
                      !isCustomName && "ring-2 ring-blue-400/50 bg-blue-400/10"
                    )}
                  >
                    <span className="truncate">{generatedName}</span>
                  </Button>
                  <Button
                    onClick={handleGenerateNew}
                    variant="outline"
                    className="glass-card border-white/20 text-white hover:bg-white/10 px-3"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Custom Name Option */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Or Enter Your Own</label>
                <input
                  type="text"
                  value={isCustomName ? userName : ''}
                  onChange={(e) => handleCustomInput(e.target.value)}
                  placeholder="Enter a custom name..."
                  maxLength={30}
                  className={cn(
                    "w-full p-3 rounded-xl transition-all duration-200",
                    "glass-card border border-white/20 text-white placeholder-gray-400",
                    "focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20",
                    isCustomName && "ring-2 ring-blue-400/50 bg-blue-400/10"
                  )}
                />
                <p className="text-xs text-gray-400">
                  {isCustomName ? userName.length : 0}/30 characters
                </p>
              </div>

              {/* Preview */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-gray-300 mb-1">Preview:</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ backgroundColor: moodColor + '40' }}
                  >
                    {userName.charAt(0) || 'U'}
                  </div>
                  <span className="text-white font-medium">{userName || 'Your Name'}</span>
                  <span className="text-xs text-gray-400 capitalize">• {mood}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 glass-card border-red-400/30 text-red-400 hover:bg-red-400/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!userName.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserNameModal;