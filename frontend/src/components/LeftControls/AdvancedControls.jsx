import { useAutoBet } from '../../hooks/useAutoBet';
import { useGame } from '../../contexts/GameContext';
import { formatNumber } from '../../utils/format';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import StrategyPanel from './StrategyPanel';
import { useState } from 'react';

export default function AdvancedControls() {
  const { state, dispatch } = useGame();
  const { isRunning, autoConfig, setAutoConfig, startAutoBet, stopAutoBet, stats, selectedStrategy, setSelectedStrategy, customStrategies, saveCustomStrategy, deleteCustomStrategy } = useAutoBet();
  const [showStrategyBuilder, setShowStrategyBuilder] = useState(false);
  const [numberOfBets, setNumberOfBets] = useState(10);

  const handleStartAutoBet = () => {
    startAutoBet(numberOfBets);
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
        value={numberOfBets}
        onChange={(e) => setNumberOfBets(parseInt(e.target.value) || 1)}
        min="1"
        max="1000"
        disabled={isRunning}
      />

      {/* Select Strategy */}
      <div>
        <label className="block text-sm text-text-secondary mb-2">Select Strategy</label>
        <select
          value={selectedStrategy}
          onChange={(e) => setSelectedStrategy(e.target.value)}
          className="w-full bg-background border border-border-color rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-[#557086]"
          disabled={isRunning}
        >
          <option value="martingale">Martingale</option>
          <option value="delayedMartingale">Delayed Martingale</option>
          <option value="paroli">Paroli</option>
          <option value="dalembert">D'Alembert</option>
          {customStrategies.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Manage Strategies */}
      <Button variant="secondary" onClick={() => setShowStrategyBuilder(true)} disabled={isRunning} className="w-full">
        Manage Strategies
      </Button>





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
        onClick={isRunning ? stopAutoBet : handleStartAutoBet}
        disabled={!isRunning && state.balance < state.betAmount}
        className="w-full"
      >
        {isRunning ? 'Stop Autobet' : 'Start Autobet'}
      </Button>

      <StrategyPanel
        isOpen={showStrategyBuilder}
        onClose={() => setShowStrategyBuilder(false)}
        selectedStrategy={selectedStrategy}
        onStrategySelect={setSelectedStrategy}
        customStrategies={customStrategies}
        onSaveStrategy={saveCustomStrategy}
        onDeleteStrategy={deleteCustomStrategy}
      />
    </div>
  );
}
