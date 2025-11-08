import { useAutoBet } from '../../hooks/useAutoBet';
import { useGame } from '../../contexts/GameContext';
import { formatNumber } from '../../utils/format';
import Button from '../Shared/Button';
import Input from '../Shared/Input';

export default function AutoControls() {
  const { state } = useGame();
  const { isRunning, autoConfig, setAutoConfig, startAutoBet, stopAutoBet, stats } = useAutoBet();

  const updateConfig = (key, value) => {
    setAutoConfig(prev => ({
      ...prev,
      [key]: key.includes('stop') || key.includes('reset') ? value : parseFloat(value) || 0
    }));
  };

  return (
    <div className="space-y-6">
      {/* Number of Bets */}
      <Input
        label="Number of Bets"
        type="number"
        value={autoConfig.numberOfBets}
        onChange={(e) => updateConfig('numberOfBets', e.target.value)}
        min="1"
        max="1000"
        disabled={isRunning}
      />

      {/* Stop Conditions */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Stop Conditions</h3>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="stopOnWin"
            checked={autoConfig.stopOnWin}
            onChange={(e) => updateConfig('stopOnWin', e.target.checked)}
            disabled={isRunning}
            className="rounded border-gray-600 bg-border-color text-accent-blue focus:ring-accent-blue"
          />
          <label htmlFor="stopOnWin" className="text-sm text-text-primary">
            Stop on win target
          </label>
        </div>
        
        {autoConfig.stopOnWin && (
          <Input
            type="number"
            value={autoConfig.winTarget}
            onChange={(e) => updateConfig('winTarget', e.target.value)}
            placeholder="Win target amount"
            step="0.01"
            disabled={isRunning}
          />
        )}

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="stopOnLoss"
            checked={autoConfig.stopOnLoss}
            onChange={(e) => updateConfig('stopOnLoss', e.target.checked)}
            disabled={isRunning}
            className="rounded border-gray-600 bg-border-color text-accent-blue focus:ring-accent-blue"
          />
          <label htmlFor="stopOnLoss" className="text-sm text-text-primary">
            Stop on loss limit
          </label>
        </div>
        
        {autoConfig.stopOnLoss && (
          <Input
            type="number"
            value={autoConfig.lossLimit}
            onChange={(e) => updateConfig('lossLimit', e.target.value)}
            placeholder="Loss limit amount"
            step="0.01"
            disabled={isRunning}
          />
        )}
      </div>

      {/* Bet Adjustment */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Bet Adjustment</h3>
        
        <Input
          label="Increase on Win (%)"
          type="number"
          value={autoConfig.increaseOnWin}
          onChange={(e) => updateConfig('increaseOnWin', e.target.value)}
          min="0"
          max="100"
          step="1"
          disabled={isRunning}
        />

        <Input
          label="Increase on Loss (%)"
          type="number"
          value={autoConfig.increaseOnLoss}
          onChange={(e) => updateConfig('increaseOnLoss', e.target.value)}
          min="0"
          max="100"
          step="1"
          disabled={isRunning}
        />

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="resetOnWin"
            checked={autoConfig.resetOnWin}
            onChange={(e) => updateConfig('resetOnWin', e.target.checked)}
            disabled={isRunning}
            className="rounded border-gray-600 bg-border-color text-accent-blue focus:ring-accent-blue"
          />
          <label htmlFor="resetOnWin" className="text-sm text-text-primary">
            Reset bet on win
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="resetOnLoss"
            checked={autoConfig.resetOnLoss}
            onChange={(e) => updateConfig('resetOnLoss', e.target.checked)}
            disabled={isRunning}
            className="rounded border-gray-600 bg-border-color text-accent-blue focus:ring-accent-blue"
          />
          <label htmlFor="resetOnLoss" className="text-sm text-text-primary">
            Reset bet on loss
          </label>
        </div>
      </div>

      {/* Stats */}
      {isRunning && (
        <div className="card bg-background">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Auto Bet Stats</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Bets Placed:</span>
              <span className="font-mono">{stats.betsPlaced}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Bet:</span>
              <span className="font-mono">{formatNumber(stats.currentBet)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Button */}
      <Button
        variant={isRunning ? 'danger' : 'success'}
        size="lg"
        onClick={isRunning ? stopAutoBet : startAutoBet}
        disabled={!isRunning && state.balance < state.betAmount}
        className="w-full"
      >
        {isRunning ? 'Stop Auto Bet' : 'Start Auto Bet'}
      </Button>
    </div>
  );
}