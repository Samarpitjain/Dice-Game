import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useGame } from '../contexts/GameContext';

export function useSocket() {
  const { state, dispatch } = useGame();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!state.user) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join', state.user.id);
    });

    socket.on('betResult', (data) => {
      dispatch({ type: 'ADD_BET_RESULT', payload: data.bet });
      dispatch({ type: 'UPDATE_BALANCE', payload: data.newBalance });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [state.user, dispatch]);

  return socketRef.current;
}