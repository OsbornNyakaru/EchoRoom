import React from 'react';
import { TypingUser } from '../../types/chat';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) {
    return null;
  }

  const names = typingUsers.map(user => user.userName || `User ${user.userId.substring(0, 5)}`);
  const message = names.length === 1
    ? `${names[0]} is typing...`
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} are typing...`;

  return (
    <div className="p-2 text-sm text-gray-400 italic">
      {message}
    </div>
  );
};

export default TypingIndicator; 