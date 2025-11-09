import { useState } from 'react';
import { useAutoBet } from '../../hooks/useAutoBet';
import { useGame } from '../../contexts/GameContext';
import { formatNumber } from '../../utils/format';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
export default function AutoControls() {
  const { state, dispatch } = useGame();
  const { isRunning, autoConfig, setAutoConfig, startAutoBet, stopAutoBet, stats } = useAutoBet();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = (key, value) => {
    setAutoConfig(prev => ({
      ...prev,
      [key]: key.includes('stop') || key.includes('reset') ? value : parseFloat(value) || 0
    }));
  };

  return (
    <div className="space-y-6">
      {/* Bet Amount */}
      <div>
        <Input
          label="Bet Amount"
          type="number"
          value={state.betAmount}
          onChange={(e) => dispatch({ type: 'SET_BET_AMOUNT', payload: parseFloat(e.target.value) || 0 })}
          min="0.01"
          max={state.balance}
          step="0.01"
          disabled={isRunning}
        />
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'SET_BET_AMOUNT', payload: state.betAmount * 0.5 })} className="flex-1">
            1/2
          </Button>
          <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'SET_BET_AMOUNT', payload: state.betAmount * 2 })} className="flex-1">
            2x
          </Button>
          <Button size="sm" variant="secondary" onClick={() => dispatch({ type: 'SET_BET_AMOUNT', payload: state.balance })} className="flex-1">
            Max
          </Button>
        </div>
      </div>

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

      {/* Advanced Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-secondary">Advanced</label>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            showAdvanced ? 'bg-accent-green' : 'bg-border-color'
          }`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            showAdvanced ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      {showAdvanced && (
        <>
          {/* On Win */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">On Win</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateConfig('resetOnWin', !autoConfig.resetOnWin)}
                disabled={isRunning}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  autoConfig.resetOnWin ? 'bg-[#557086] text-white' : 'bg-accent-blue text-text-primary'
                }`}
              >
                Reset
              </button>
              <div className="flex-1 flex items-center gap-2 bg-accent-blue rounded px-3">
                <span className="text-sm text-text-primary">Increase by:</span>
                <input
                  type="number"
                  value={autoConfig.increaseOnWin}
                  onChange={(e) => updateConfig('increaseOnWin', e.target.value)}
                  min="0"
                  max="100"
                  disabled={isRunning}
                  className="flex-1 bg-transparent border-none text-text-primary text-sm focus:outline-none"
                />
                <span className="text-sm text-text-secondary">%</span>
              </div>
            </div>
          </div>

          {/* On Loss */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">On Loss</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateConfig('resetOnLoss', !autoConfig.resetOnLoss)}
                disabled={isRunning}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  autoConfig.resetOnLoss ? 'bg-[#557086] text-white' : 'bg-accent-blue text-text-primary'
                }`}
              >
                Reset
              </button>
              <div className="flex-1 flex items-center gap-2 bg-accent-blue rounded px-3">
                <span className="text-sm text-text-primary">Increase by:</span>
                <input
                  type="number"
                  value={autoConfig.increaseOnLoss}
                  onChange={(e) => updateConfig('increaseOnLoss', e.target.value)}
                  min="0"
                  max="100"
                  disabled={isRunning}
                  className="flex-1 bg-transparent border-none text-text-primary text-sm focus:outline-none"
                />
                <span className="text-sm text-text-secondary">%</span>
              </div>
            </div>
          </div>

          {/* Stop on Profit */}
          <Input
            label="Stop on Profit"
            type="number"
            value={autoConfig.stopOnWin ? autoConfig.winTarget : ''}
            onChange={(e) => {
              updateConfig('winTarget', e.target.value);
              updateConfig('stopOnWin', !!e.target.value);
            }}
            step="0.01"
            disabled={isRunning}
          />

          {/* Stop on Loss */}
          <Input
            label="Stop on Loss"
            type="number"
            value={autoConfig.stopOnLoss ? autoConfig.lossLimit : ''}
            onChange={(e) => {
              updateConfig('lossLimit', e.target.value);
              updateConfig('stopOnLoss', !!e.target.value);
            }}
            step="0.01"
            disabled={isRunning}
          />
        </>
      )}

      {/* Stats */}
      {isRunning && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Auto Bet Stats</h3>
          <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Bets Placed</span>
              <span className="font-mono text-sm">{stats.betsPlaced}</span>
            </div>
          </div>
          <div className="p-3 bg-background rounded-lg border border-border-color hover:bg-background/50 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Current Bet</span>
              <span className="font-mono text-sm">{formatNumber(stats.currentBet)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Button */}
      <Button
        variant={isRunning ? 'danger' : 'success'}
        size="lg"
        onClick={isRunning ? stopAutoBet : () => startAutoBet(autoConfig.numberOfBets)}
        disabled={!isRunning && state.balance < state.betAmount}
        className="w-full"
      >
        {isRunning ? 'Stop Auto Bet' : 'Start Auto Bet'}
      </Button>
    </div>
  );
}
