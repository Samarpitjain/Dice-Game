import { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { gameAPI } from '../../utils/api';
import { formatNumber, formatTime } from '../../utils/format';

export default function BetHistory() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await gameAPI.getBetHistory({ limit: 20 });
        dispatch({ type: 'SET_BET_HISTORY', payload: response.data.bets });
      } catch (error) {
        console.error('Failed to fetch bet history:', error);
      }
    };

    if (state.user) {
      fetchHistory();
    }
  }, [state.user, dispatch]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Recent Bets</h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {state.betHistory.length === 0 ? (
          <div className="text-center text-text-secondary py-8">
            No bets yet. Place your first bet!
          </div>
        ) : (
          state.betHistory.map((bet, index) => (
            <div
              key={bet._id || index}
              className="flex items-center justify-between p-3 bg-background rounded-lg border border-border-color"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    bet.win ? 'bg-accent-green' : 'bg-error'
                  }`}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {formatNumber(bet.roll)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {bet.direction} {formatNumber(bet.target)}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {formatTime(bet.createdAt || bet.timestamp || Date.now())}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-mono text-sm">
                  {formatNumber(bet.betAmount)}
                </div>
                <div
                  className={`font-mono text-xs ${
                    bet.win ? 'text-accent-green' : 'text-error'
                  }`}
                >
                  {bet.win ? '+' : ''}{formatNumber(bet.profit)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}