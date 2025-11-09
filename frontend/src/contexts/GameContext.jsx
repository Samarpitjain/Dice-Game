import { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const initialState = {
  user: null,
  balance: 0,
  betAmount: 1.00,
  winChance: 49.5,
  direction: 'under',
  target: 49.5,
  isRolling: false,
  lastRoll: null,
  betHistory: [],
  seeds: {
    clientSeed: '',
    serverSeedHash: '',
    nonce: 0
  },
  stats: {
    totalBets: 0,
    totalWagered: 0,
    totalProfit: 0,
    winCount: 0,
    lossCount: 0
  }
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        balance: action.payload.balance,
        seeds: {
          clientSeed: action.payload.clientSeed,
          serverSeedHash: action.payload.serverSeedHash,
          nonce: action.payload.nonce
        }
      };

    case 'UPDATE_BALANCE':
      return {
        ...state,
        balance: action.payload
      };

    case 'SET_BET_AMOUNT':
      return {
        ...state,
        betAmount: Math.max(0.01, Math.min(1000, action.payload))
      };

    case 'SET_WIN_CHANCE':
      const winChance = Math.max(0.01, Math.min(95, action.payload));
      return {
        ...state,
        winChance,
        target: state.direction === 'under' ? winChance : 100 - winChance
      };

    case 'SET_DIRECTION':
      return {
        ...state,
        direction: action.payload,
        target: action.payload === 'under' ? state.winChance : 100 - state.winChance
      };

    case 'SET_TARGET':
      const target = Math.max(0.01, Math.min(99.99, action.payload));
      return {
        ...state,
        target,
        winChance: state.direction === 'under' ? target : 100 - target
      };

    case 'SET_ROLLING':
      return {
        ...state,
        isRolling: action.payload
      };

    case 'ADD_BET_RESULT':
      const bet = action.payload;
      return {
        ...state,
        lastRoll: bet,
        balance: bet.newBalance,
        betHistory: [bet, ...state.betHistory.slice(0, 49)],
        seeds: {
          ...state.seeds,
          nonce: state.seeds.nonce + 1
        },
        stats: {
          totalBets: state.stats.totalBets + 1,
          totalWagered: state.stats.totalWagered + bet.betAmount,
          totalProfit: state.stats.totalProfit + bet.profit,
          winCount: state.stats.winCount + (bet.win ? 1 : 0),
          lossCount: state.stats.lossCount + (bet.win ? 0 : 1)
        }
      };

    case 'UPDATE_SEEDS':
      return {
        ...state,
        seeds: { ...state.seeds, ...action.payload }
      };

    case 'SET_BET_HISTORY':
      return {
        ...state,
        betHistory: action.payload
      };

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}