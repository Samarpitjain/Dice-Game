import { useState, useRef, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { gameAPI } from '../utils/api';
import toast from 'react-hot-toast';

export function useAutoBet() {
  const { state, dispatch } = useGame();
  const [isRunning, setIsRunning] = useState(false);
  const [autoConfig, setAutoConfig] = useState({
    numberOfBets: 10,
    stopOnWin: false,
    stopOnLoss: false,
    winTarget: 0,
    lossLimit: 0,
    increaseOnWin: 0,
    increaseOnLoss: 0,
    resetOnWin: false,
    resetOnLoss: false
  });
  
  const intervalRef = useRef(null);
  const statsRef = useRef({
    betsPlaced: 0,
    currentStreak: 0,
    currentBet: state.betAmount
  });

  const stopAutoBet = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    statsRef.current = {
      betsPlaced: 0,
      currentStreak: 0,
      currentBet: state.betAmount
    };
  }, [state.betAmount]);

  const placeSingleBet = useCallback(async (betAmount) => {
    try {
      dispatch({ type: 'SET_ROLLING', payload: true });
      
      const response = await gameAPI.placeBet({
        betAmount,
        target: state.target,
        direction: state.direction,
        clientSeed: state.seeds.clientSeed
      });

      const betResult = {
        ...response.data,
        betAmount,
        target: state.target,
        direction: state.direction,
        winChance: state.winChance
      };

      dispatch({ type: 'ADD_BET_RESULT', payload: betResult });
      return betResult;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Bet failed');
      throw error;
    } finally {
      dispatch({ type: 'SET_ROLLING', payload: false });
    }
  }, [state.target, state.direction, state.seeds.clientSeed, state.winChance, dispatch]);

  const startAutoBet = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    statsRef.current = {
      betsPlaced: 0,
      currentStreak: 0,
      currentBet: state.betAmount
    };

    const runBet = async () => {
      try {
        const stats = statsRef.current;
        
        // Check stop conditions
        if (stats.betsPlaced >= autoConfig.numberOfBets) {
          stopAutoBet();
          return;
        }

        if (autoConfig.stopOnWin && state.stats.totalProfit >= autoConfig.winTarget) {
          stopAutoBet();
          toast.success('Win target reached!');
          return;
        }

        if (autoConfig.stopOnLoss && state.stats.totalProfit <= -autoConfig.lossLimit) {
          stopAutoBet();
          toast.error('Loss limit reached!');
          return;
        }

        // Place bet
        const result = await placeSingleBet(stats.currentBet);
        stats.betsPlaced++;

        // Update bet amount based on result
        if (result.win) {
          if (autoConfig.resetOnWin) {
            stats.currentBet = state.betAmount;
          } else if (autoConfig.increaseOnWin > 0) {
            stats.currentBet *= (1 + autoConfig.increaseOnWin / 100);
          }
        } else {
          if (autoConfig.resetOnLoss) {
            stats.currentBet = state.betAmount;
          } else if (autoConfig.increaseOnLoss > 0) {
            stats.currentBet *= (1 + autoConfig.increaseOnLoss / 100);
          }
        }

        // Cap bet amount
        stats.currentBet = Math.min(stats.currentBet, Math.min(1000, state.balance));

      } catch (error) {
        stopAutoBet();
        console.error('Auto bet error:', error);
      }
    };

    // Start the betting loop
    intervalRef.current = setInterval(runBet, 1000); // 1 second delay between bets
  }, [isRunning, autoConfig, state.betAmount, state.stats.totalProfit, state.balance, placeSingleBet, stopAutoBet]);

  return {
    isRunning,
    autoConfig,
    setAutoConfig,
    startAutoBet,
    stopAutoBet,
    stats: statsRef.current
  };
}