import { useGame } from '../../contexts/GameContext';
import { formatNumber, formatPercentage } from '../../utils/format';

export default function StatsPanel() {
  const { state } = useGame();
  const { stats, balance } = state;

  const winRate = stats.totalBets > 0 ? (stats.winCount / stats.totalBets) * 100 : 0;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Session Stats</h3>
      
      <div className="space-y-2">
        <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Balance</span>
            <span className="font-mono text-accent-green font-semibold">
              {formatNumber(balance)}
            </span>
          </div>
        </div>

        <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Total Bets</span>
            <span className="font-mono text-sm">{stats.totalBets}</span>
          </div>
        </div>
        
        <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Total Wagered</span>
            <span className="font-mono text-sm">{formatNumber(stats.totalWagered)}</span>
          </div>
        </div>
        
        <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Total Profit</span>
            <span className={`font-mono text-sm font-semibold ${
              stats.totalProfit >= 0 ? 'text-accent-green' : 'text-error'
            }`}>
              {stats.totalProfit >= 0 ? '+' : ''}{formatNumber(stats.totalProfit)}
            </span>
          </div>
        </div>
        
        <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Win Rate</span>
            <span className="font-mono text-sm">{formatPercentage(winRate)}</span>
          </div>
        </div>
        
        <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Wins / Losses</span>
            <span className="font-mono text-sm">
              <span className="text-accent-green">{stats.winCount}</span>
              {' / '}
              <span className="text-error">{stats.lossCount}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}