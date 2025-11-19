import { useState, useRef, useCallback, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { gameAPI } from '../utils/api';
import toast from 'react-hot-toast';

const PREDEFINED_STRATEGIES = {
  martingale: [
    { type: 'bet', on: 'afterLoss', action: 'increaseBetPercent', value: 100 },
    { type: 'bet', on: 'afterWin', action: 'resetBet', value: 0 }
  ],
  delayedMartingale: [
    { type: 'bet', on: 'every', onValue: 2, onUnit: 'losses', action: 'increaseBetPercent', value: 100 },
    { type: 'bet', on: 'afterWin', action: 'resetBet', value: 0 }
  ],
  paroli: [
    { type: 'bet', on: 'afterWin', action: 'increaseBetPercent', value: 100 },
    { type: 'bet', on: 'afterLoss', action: 'resetBet', value: 0 }
  ],
  dalembert: [
    { type: 'bet', on: 'afterLoss', action: 'addToBet', value: 0.01 },
    { type: 'bet', on: 'afterWin', action: 'subtractFromBet', value: 0.01 }
  ]
};

export function useAutoBet() {
  const { state, dispatch } = useGame();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('martingale');
  const [customStrategies, setCustomStrategies] = useState([]);
  const [autoConfig, setAutoConfig] = useState({
    numberOfBets: 10,
    stopOnWin: false,
    stopOnLoss: false,
    winTarget: 0,
    lossLimit: 0,
    increaseOnWin: 0,
    increaseOnLoss: 0,
    resetOnWin: true,
    resetOnLoss: true
  });
  
  const intervalRef = useRef(null);
  const statsRef = useRef({
    betsPlaced: 0,
    currentStreak: 0,
    currentBet: state.betAmount,
    totalProfit: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('customStrategies');
    if (saved) setCustomStrategies(JSON.parse(saved));
  }, []);

  const saveCustomStrategy = (strategy) => {
    const updated = customStrategies.filter(s => s.id !== strategy.id);
    updated.push(strategy);
    setCustomStrategies(updated);
    localStorage.setItem('customStrategies', JSON.stringify(updated));
    setSelectedStrategy(strategy.id);
  };

  const deleteCustomStrategy = (id) => {
    const updated = customStrategies.filter(s => s.id !== id);
    setCustomStrategies(updated);
    localStorage.setItem('customStrategies', JSON.stringify(updated));
    if (selectedStrategy === id) setSelectedStrategy('martingale');
  };

  const stopAutoBetRef = useRef(null);

  const stopAutoBet = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    statsRef.current = {
      betsPlaced: 0,
      currentStreak: 0,
      currentBet: state.betAmount,
      totalProfit: 0
    };
  }, [state.betAmount]);

  stopAutoBetRef.current = stopAutoBet;

  const applyStrategy = useCallback((result) => {
    const stats = statsRef.current;
    const strategy = selectedStrategy.startsWith('custom_') 
      ? customStrategies.find(s => s.id === selectedStrategy)?.conditions
      : PREDEFINED_STRATEGIES[selectedStrategy];

    if (!strategy) return;

    strategy.forEach(condition => {
      let shouldApply = false;

      if (condition.type === 'profit' || condition.type === 'balance') {
        const value = condition.onUnit === 'balance' ? state.balance :
                      condition.onUnit === 'loss' ? -stats.totalProfit :
                      stats.totalProfit;
        
        switch (condition.on) {
          case 'greaterThan':
            shouldApply = value > condition.onValue;
            break;
          case 'greaterThanEqual':
            shouldApply = value >= condition.onValue;
            break;
          case 'lowerThan':
            shouldApply = value < condition.onValue;
            break;
          case 'lowerThanEqual':
            shouldApply = value <= condition.onValue;
            break;
        }
      } else {
        switch (condition.on) {
          case 'afterWin':
            shouldApply = result.win;
            break;
          case 'afterLoss':
            shouldApply = !result.win;
            break;
          case 'every':
            if (condition.onUnit === 'bets') {
              shouldApply = stats.betsPlaced % condition.onValue === 0;
            } else if (condition.onUnit === 'wins') {
              shouldApply = result.win;
            } else if (condition.onUnit === 'losses') {
              shouldApply = !result.win;
            }
            break;
          case 'everyStreakOf':
            shouldApply = Math.abs(stats.currentStreak) === condition.onValue;
            break;
          case 'firstStreakOf':
            shouldApply = Math.abs(stats.currentStreak) === condition.onValue && stats.betsPlaced === condition.onValue;
            break;
          case 'streakGreater':
            shouldApply = Math.abs(stats.currentStreak) > condition.onValue;
            break;
          case 'streakLower':
            shouldApply = Math.abs(stats.currentStreak) < condition.onValue;
            break;
        }
      }

      if (shouldApply) {
        switch (condition.action) {
          case 'increaseBetPercent':
            stats.currentBet *= (1 + condition.value / 100);
            break;
          case 'decreaseBetPercent':
            stats.currentBet *= (1 - condition.value / 100);
            break;
          case 'addToBet':
            stats.currentBet += condition.value;
            break;
          case 'subtractFromBet':
            stats.currentBet -= condition.value;
            break;
          case 'setBet':
            stats.currentBet = condition.value;
            break;
          case 'resetBet':
            stats.currentBet = state.betAmount;
            break;
          case 'increaseWinChancePercent':
            dispatch({ type: 'SET_WIN_CHANCE', payload: state.winChance * (1 + condition.value / 100) });
            break;
          case 'decreaseWinChancePercent':
            dispatch({ type: 'SET_WIN_CHANCE', payload: state.winChance * (1 - condition.value / 100) });
            break;
          case 'addToWinChance':
            dispatch({ type: 'SET_WIN_CHANCE', payload: state.winChance + condition.value });
            break;
          case 'subtractFromWinChance':
            dispatch({ type: 'SET_WIN_CHANCE', payload: state.winChance - condition.value });
            break;
          case 'setWinChance':
            dispatch({ type: 'SET_WIN_CHANCE', payload: condition.value });
            break;
          case 'resetWinChance':
            dispatch({ type: 'SET_WIN_CHANCE', payload: 50 });
            break;
          case 'switchOverUnder':
            dispatch({ type: 'SET_DIRECTION', payload: state.direction === 'over' ? 'under' : 'over' });
            break;
          case 'stopAutobet':
            stopAutoBetRef.current?.();
            break;
        }
      }
    });

    stats.currentBet = Math.max(0.01, Math.min(stats.currentBet, state.balance));
  }, [selectedStrategy, customStrategies, state.betAmount, state.balance, state.direction, state.winChance, dispatch]);

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
      dispatch({ type: 'UPDATE_SEEDS', payload: { nonce: betResult.newNonce } });
      return betResult;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Bet failed');
      throw error;
    } finally {
      dispatch({ type: 'SET_ROLLING', payload: false });
    }
  }, [state.target, state.direction, state.seeds.clientSeed, state.winChance, dispatch]);

  const startBasicAutoBet = useCallback(async (customBetCount) => {
    if (isRunning) return;
    
    setIsRunning(true);
    statsRef.current = {
      betsPlaced: 0,
      currentStreak: 0,
      currentBet: state.betAmount,
      totalProfit: 0,
      maxBets: customBetCount ?? autoConfig.numberOfBets
    };

    const runBet = async () => {
      try {
        const stats = statsRef.current;
        
        if (stats.betsPlaced >= stats.maxBets) {
          stopAutoBet();
          return;
        }

        const result = await placeSingleBet(stats.currentBet);
        stats.betsPlaced++;
        stats.totalProfit += result.profit;
        
        if (result.win) {
          stats.currentStreak = stats.currentStreak > 0 ? stats.currentStreak + 1 : 1;
          if (autoConfig.resetOnWin) {
            stats.currentBet = state.betAmount;
          } else if (autoConfig.increaseOnWin > 0) {
            stats.currentBet *= (1 + autoConfig.increaseOnWin / 100);
          }
        } else {
          stats.currentStreak = stats.currentStreak < 0 ? stats.currentStreak - 1 : -1;
          if (autoConfig.resetOnLoss) {
            stats.currentBet = state.betAmount;
          } else if (autoConfig.increaseOnLoss > 0) {
            stats.currentBet *= (1 + autoConfig.increaseOnLoss / 100);
          }
        }

        stats.currentBet = Math.max(0.01, Math.min(stats.currentBet, state.balance));

        if (autoConfig.stopOnWin && stats.totalProfit >= autoConfig.winTarget) {
          stopAutoBet();
          toast.success('Win target reached!');
          return;
        }

        if (autoConfig.stopOnLoss && stats.totalProfit <= -autoConfig.lossLimit) {
          stopAutoBet();
          toast.error('Loss limit reached!');
          return;
        }

      } catch (error) {
        stopAutoBet();
        console.error('Auto bet error:', error);
      }
    };

    intervalRef.current = setInterval(runBet, 600);
  }, [isRunning, autoConfig, state.betAmount, state.stats.totalProfit, state.balance, placeSingleBet, stopAutoBet]);

  const startAdvancedAutoBet = useCallback(async (customBetCount) => {
    if (isRunning) return;
    
    setIsRunning(true);
    statsRef.current = {
      betsPlaced: 0,
      currentStreak: 0,
      currentBet: state.betAmount,
      totalProfit: 0,
      maxBets: customBetCount ?? autoConfig.numberOfBets
    };

    const runBet = async () => {
      try {
        const stats = statsRef.current;
        
        if (stats.betsPlaced >= stats.maxBets) {
          stopAutoBet();
          return;
        }

        const result = await placeSingleBet(stats.currentBet);
        stats.betsPlaced++;
        stats.totalProfit += result.profit;
        
        if (result.win) {
          stats.currentStreak = stats.currentStreak > 0 ? stats.currentStreak + 1 : 1;
        } else {
          stats.currentStreak = stats.currentStreak < 0 ? stats.currentStreak - 1 : -1;
        }

        applyStrategy(result);
        stats.currentBet = Math.max(0.01, Math.min(stats.currentBet, state.balance));

        if (autoConfig.stopOnWin && stats.totalProfit >= autoConfig.winTarget) {
          stopAutoBet();
          toast.success('Win target reached!');
          return;
        }

        if (autoConfig.stopOnLoss && stats.totalProfit <= -autoConfig.lossLimit) {
          stopAutoBet();
          toast.error('Loss limit reached!');
          return;
        }

      } catch (error) {
        stopAutoBet();
        console.error('Auto bet error:', error);
      }
    };

    intervalRef.current = setInterval(runBet, 600);
  }, [isRunning, autoConfig, state.betAmount, state.stats.totalProfit, state.balance, placeSingleBet, stopAutoBet, applyStrategy]);

  return {
    isRunning,
    autoConfig,
    setAutoConfig,
    startBasicAutoBet,
    startAdvancedAutoBet,
    stopAutoBet,
    stats: statsRef.current,
    selectedStrategy,
    setSelectedStrategy,
    customStrategies,
    saveCustomStrategy,
    deleteCustomStrategy
  };
}
