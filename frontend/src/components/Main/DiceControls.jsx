import { useGame } from '../../contexts/GameContext';
import { calculatePayout } from '../../utils/fairness';
import { formatNumber, formatMultiplier } from '../../utils/format';
import { RefreshCw } from 'lucide-react';

export default function DiceControls() {
  const { state, dispatch } = useGame();
  const { winChance, target, direction, isRolling } = state;

  const payout = calculatePayout(winChance);

  const handleWinChanceChange = (value) => {
    const chance = parseFloat(value) || 0;
    dispatch({ type: 'SET_WIN_CHANCE', payload: Math.max(0.01, Math.min(95, chance)) });
  };

  const handleTargetChange = (value) => {
    const newTarget = parseFloat(value) || 0;
    dispatch({ type: 'SET_TARGET', payload: Math.max(0.01, Math.min(99.99, newTarget)) });
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
            type="text"
            value={formatMultiplier(payout)}
            readOnly
            className="w-full bg-[#0f212e] border border-border-color rounded-lg px-4 py-3 text-text-primary font-mono focus:outline-none focus:border-[#557086]"
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
          <input
            type="number"
            value={target}
            onChange={(e) => handleTargetChange(e.target.value)}
            disabled={isRolling}
            step="0.01"
            min="0.01"
            max="99.99"
            className="w-full bg-[#0f212e] border border-border-color rounded-lg px-4 py-3 text-text-primary font-mono focus:outline-none focus:border-[#557086] disabled:opacity-50"
          />
          <button
            onClick={handleDirectionSwitch}
            disabled={isRolling}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#1a2c38] rounded transition-colors disabled:opacity-50"
            title="Switch direction"
          >
            <RefreshCw size={16} className="text-text-secondary" />
          </button>
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
