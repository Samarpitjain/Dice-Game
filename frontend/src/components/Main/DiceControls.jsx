import { useGame } from '../../contexts/GameContext';
import { calculatePayout } from '../../utils/fairness';
import { formatNumber, formatMultiplier } from '../../utils/format';
import { RefreshCw } from 'lucide-react';

export default function DiceControls() {
  const { state, dispatch } = useGame();
  const { winChance, target, direction, isRolling } = state;

  const payout = calculatePayout(winChance);

  const handleMultiplierChange = (value) => {
    const multiplier = parseFloat(value) || 0;
    if (multiplier >= 1.01 && multiplier <= 9900) {
      const chance = (0.99 / multiplier) * 100;
      dispatch({ type: 'SET_WIN_CHANCE', payload: chance });
    }
  };

  const handleWinChanceChange = (value) => {
    const chance = parseFloat(value) || 0;
    dispatch({ type: 'SET_WIN_CHANCE', payload: Math.max(0.01, Math.min(95, chance)) });
  };

  const handleDirectionSwitch = () => {
    dispatch({ type: 'SET_DIRECTION', payload: direction === 'over' ? 'under' : 'over' });
  };

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      {/* Multiplier */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Multiplier</label>
        <div className="relative">
          <input
            type="number"
            value={payout.toFixed(4)}
            onChange={(e) => handleMultiplierChange(e.target.value)}
            disabled={isRolling}
            step="0.01"
            min="1.01"
            max="9900"
            className="w-full bg-[#0f212e] border border-border-color rounded-lg px-4 py-3 text-text-primary font-mono focus:outline-none focus:border-[#557086] disabled:opacity-50"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">×</span>
        </div>
      </div>

      {/* Roll Over/Under */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Roll {direction === 'over' ? 'Over' : 'Under'}
        </label>
        <div className="relative">
          <div className="w-full bg-[#0f212e] border border-border-color rounded-lg px-4 py-3 text-text-primary font-mono flex items-center justify-between">
            <span>{target.toFixed(2)}</span>
            <button
              onClick={handleDirectionSwitch}
              disabled={isRolling}
              className="p-1.5 hover:bg-[#1a2c38] rounded transition-colors disabled:opacity-50"
              title="Switch direction"
            >
              <RefreshCw size={16} className="text-text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Win Chance */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Win Chance</label>
        <div className="relative">
          <input
            type="number"
            value={winChance}
            onChange={(e) => handleWinChanceChange(e.target.value)}
            disabled={isRolling}
            step="0.01"
            min="0.01"
            max="95"
            className="w-full bg-[#0f212e] border border-border-color rounded-lg px-4 py-3 text-text-primary font-mono focus:outline-none focus:border-[#557086] disabled:opacity-50"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">%</span>
        </div>
      </div>
    </div>
  );
}
