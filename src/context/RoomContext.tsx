import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Participant, RoomInfo, SessionPhase } from '../types/room';

type RoomState = {
  roomId: string | null;
  participants: Participant[];
  roomInfo: RoomInfo | null;
  timeRemaining: number;
  sessionPhase: SessionPhase;
};

type RoomAction =
  | { type: 'SET_ROOM'; payload: { roomId: string; participants: Participant[]; roomInfo: RoomInfo } }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'REMOVE_PARTICIPANT'; payload: string }
  | { type: 'UPDATE_VOICE_STATUS'; payload: { userId: string; isSpeaking: boolean; isMuted: boolean } }
  | { type: 'UPDATE_SESSION'; payload: { timeRemaining: number; phase: SessionPhase } }
  | { type: 'LEAVE_ROOM' };

const roomReducer = (state: RoomState, action: RoomAction): RoomState => {
  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, roomId: action.payload.roomId, participants: action.payload.participants, roomInfo: action.payload.roomInfo };
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] };
    case 'REMOVE_PARTICIPANT':
      return { ...state, participants: state.participants.filter(p => p.userId !== action.payload) };
    case 'UPDATE_VOICE_STATUS':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.userId === action.payload.userId ? { ...p, isSpeaking: action.payload.isSpeaking, isMuted: action.payload.isMuted } : p
        ),
      };
    case 'UPDATE_SESSION':
      return { ...state, timeRemaining: action.payload.timeRemaining, sessionPhase: action.payload.phase };
    case 'LEAVE_ROOM':
      return { ...state, roomId: null, participants: [], roomInfo: null };
    default:
      return state;
  }
};

interface RoomContextType {
  state: RoomState;
  dispatch: React.Dispatch<RoomAction>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(roomReducer, {
    roomId: null,
    participants: [],
    roomInfo: null,
    timeRemaining: 0,
    sessionPhase: 'introduction',
  });

  return (
    <RoomContext.Provider value={{ state, dispatch }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
}; 