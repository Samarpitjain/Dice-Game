import { useGame } from '../../contexts/GameContext';
import { formatNumber, formatPercentage } from '../../utils/format';

export default function StatsPanel() {
  const { state } = useGame();
  const { stats, balance } = state;

  const winRate = stats.totalBets > 0 ? (stats.winCount / stats.totalBets) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Balance */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Balance</h3>
        <div className="text-2xl font-mono font-bold text-accent-green">
          {formatNumber(balance)}
        </div>
      </div>

      {/* Session Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Session Stats</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Bets</span>
            <span className="font-mono">{stats.totalBets}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Wagered</span>
            <span className="font-mono">{formatNumber(stats.totalWagered)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Profit</span>
            <span className={`font-mono ${
              stats.totalProfit >= 0 ? 'text-accent-green' : 'text-error'
            }`}>
              {stats.totalProfit >= 0 ? '+' : ''}{formatNumber(stats.totalProfit)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">Win Rate</span>
            <span className="font-mono">{formatPercentage(winRate)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-text-secondary">Wins / Losses</span>
            <span className="font-mono">
              <span className="text-accent-green">{stats.winCount}</span>
              {' / '}
              <span className="text-error">{stats.lossCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Profit Chart Placeholder */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Profit Chart</h3>
        <div className="h-32 bg-background rounded-lg border border-border-color flex items-center justify-center">
          <span className="text-text-secondary text-sm">
            Chart coming soon
          </span>
        </div>
      </div>
    </div>
  );
}