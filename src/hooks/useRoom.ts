import { useState, useEffect } from 'react';
import { Participant, RoomInfo, JoinRoomData, SessionPhase } from '../types/room';

const useRoom = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('introduction');

  const joinRoom = (roomData: JoinRoomData) => {
    console.log('Joining room:', roomData);
    setRoomId(roomData.roomId);
  };

  const leaveRoom = () => {
    console.log('Leaving room');
    setRoomId(null);
    setParticipants([]);
    setRoomInfo(null);
  };

  const updateVoiceStatus = (userId: string, isSpeaking: boolean, isMuted: boolean) => {
    setParticipants(prevParticipants =>
      prevParticipants.map(p =>
        p.userId === userId ? { ...p, isSpeaking, isMuted } : p
      )
    );
  };

  return {
    roomId,
    participants,
    roomInfo,
    timeRemaining,
    sessionPhase,
    joinRoom,
    leaveRoom,
    updateVoiceStatus,
  };
};

export default useRoom; 