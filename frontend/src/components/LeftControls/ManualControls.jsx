import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { gameAPI } from '../../utils/api';
import { calculatePayout } from '../../utils/fairness';
import { formatNumber, formatMultiplier } from '../../utils/format';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import toast from 'react-hot-toast';

export default function ManualControls() {
  const { state, dispatch } = useGame();
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const { betAmount, winChance, direction, target, balance, isRolling } = state;

  const payout = calculatePayout(winChance);
  const potentialWin = betAmount * payout;

  const handleBetAmountChange = (value) => {
    const amount = parseFloat(value) || 0;
    dispatch({ type: 'SET_BET_AMOUNT', payload: amount });
  };

  const handleWinChanceChange = (value) => {
    const chance = parseFloat(value) || 0;
    dispatch({ type: 'SET_WIN_CHANCE', payload: chance });
  };

  const handleDirectionChange = (newDirection) => {
    dispatch({ type: 'SET_DIRECTION', payload: newDirection });
  };

  const handleQuickBet = (multiplier) => {
    dispatch({ type: 'SET_BET_AMOUNT', payload: betAmount * multiplier });
  };

  const placeBet = async () => {
    if (betAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (betAmount < 0.01) {
      toast.error('Minimum bet is 0.01');
      return;
    }

    try {
      setIsPlacingBet(true);
      dispatch({ type: 'SET_ROLLING', payload: true });

      const response = await gameAPI.placeBet({
        betAmount,
        target,
        direction,
        clientSeed: state.seeds.clientSeed
      });

      const betResult = {
        ...response.data,
        betAmount,
        target,
        direction,
        winChance,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_BET_RESULT', payload: betResult });
      dispatch({ type: 'UPDATE_BALANCE', payload: response.data.newBalance });
      dispatch({ type: 'UPDATE_SEEDS', payload: { nonce: response.data.newNonce } });
      
      if (betResult.win) {
        toast.success(`Won ${formatNumber(betResult.profit)}!`);
      } else {
        toast.error(`Lost ${formatNumber(betAmount)}`);
      }

    } catch (error) {
      toast.error(error.response?.data?.error || 'Bet failed');
    } finally {
      setIsPlacingBet(false);
      dispatch({ type: 'SET_ROLLING', payload: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Bet Amount */}
      <div>
        <Input
          label="Bet Amount"
          type="number"
          value={betAmount}
          onChange={(e) => handleBetAmountChange(e.target.value)}
          min="0.01"
          max={balance}
          step="0.01"
        />
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="secondary" onClick={() => handleQuickBet(0.5)} className="flex-1">
            1/2
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleQuickBet(2)} className="flex-1">
            2x
          </Button>
          <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'SET_BET_AMOUNT', payload: balance })} className="flex-1">
            Max
          </Button>
        </div>
      </div>

      {/* Win Chance */}
      <div>
        <Input
          label="Win Chance (%)"
          type="number"
          value={winChance}
          onChange={(e) => handleWinChanceChange(e.target.value)}
          min="0.01"
          max="95"
          step="0.01"
        />
      </div>

      {/* Direction */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Direction
        </label>
        <div className="flex gap-2">
          <Button
            variant={direction === 'under' ? 'primary' : 'secondary'}
            onClick={() => handleDirectionChange('under')}
            className="flex-1"
          >
            Under {formatNumber(target)}
          </Button>
          <Button
            variant={direction === 'over' ? 'primary' : 'secondary'}
            onClick={() => handleDirectionChange('over')}
            className="flex-1"
          >
            Over {formatNumber(target)}
          </Button>
        </div>
      </div>

      {/* Payout Info */}
      <div className="space-y-2">
        <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Payout</span>
            <span className="font-mono text-sm">{formatMultiplier(payout)}</span>
          </div>
        </div>
        <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Potential Win</span>
            <span className="font-mono text-sm text-accent-green font-semibold">
              {formatNumber(potentialWin)}
            </span>
          </div>
        </div>
      </div>

      {/* Roll Button */}
      <Button
        variant="success"
        size="lg"
        onClick={placeBet}
        disabled={isRolling || isPlacingBet || betAmount > balance || betAmount < 0.01}
        loading={isRolling || isPlacingBet}
        className="w-full"
      >
        {isRolling || isPlacingBet ? 'Rolling...' : 'Roll Dice'}
      </Button>
    </div>
  );
}