import { createContext, useContext, useReducer } from 'react';
import { getDemoUserId, getBalance, setBalance, getHistory, addHistoryEntry } from '../utils/localStorage';

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
  maxBet: 10000,
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
      if (state.user?.username) {
        setBalance(state.user.username, action.payload);
      }
      return {
        ...state,
        balance: action.payload
      };

    case 'SET_BET_AMOUNT':
      const maxAllowed = Math.min(state.maxBet, state.balance);
      return {
        ...state,
        betAmount: Math.max(0.01, Math.min(maxAllowed, action.payload))
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
      if (state.user?.username) {
        setBalance(state.user.username, bet.newBalance);
        addHistoryEntry(state.user.username, {
          target: bet.target,
          bet: bet.betAmount,
          roll: bet.roll,
          result: bet.win ? 'win' : 'loss',
          profit: bet.profit,
          time: bet.createdAt || new Date().toISOString(),
          direction: bet.direction,
          winChance: bet.winChance,
          serverSeedHash: bet.serverSeedHash || state.seeds.serverSeedHash,
          clientSeed: bet.clientSeed || state.seeds.clientSeed,
          nonce: bet.nonce !== undefined ? bet.nonce : state.seeds.nonce,
          payout: bet.payout || 0
        });
      }
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

    case 'LOAD_LOCAL_HISTORY':
      if (state.user?.username) {
        const localHistory = getHistory(state.user.username);
        const formattedHistory = localHistory.map((entry, index) => ({
          _id: `local_${index}`,
          betAmount: entry.bet,
          target: entry.target,
          roll: entry.roll,
          win: entry.result === 'win',
          profit: entry.profit,
          createdAt: entry.time,
          direction: entry.direction,
          winChance: entry.winChance,
          serverSeedHash: entry.serverSeedHash,
          clientSeed: entry.clientSeed,
          nonce: entry.nonce,
          payout: entry.payout || 0,
          payoutMultiplier: entry.payout && entry.bet ? entry.payout / entry.bet : 0
        }));
        return {
          ...state,
          betHistory: formattedHistory
        };
      }
      return state;

    case 'SET_MAX_BET':
      return {
        ...state,
        maxBet: action.payload
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