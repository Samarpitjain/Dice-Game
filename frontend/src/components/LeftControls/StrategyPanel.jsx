import { useState } from 'react';
import { X, Square, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Shared/Button';

export default function StrategyPanel({ isOpen, onClose, selectedStrategy, onStrategySelect, customStrategies, onSaveStrategy, onDeleteStrategy }) {
  const [showStrategyBuilder, setShowStrategyBuilder] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [strategyName, setStrategyName] = useState('');
  const [conditions, setConditions] = useState([
    { type: 'bet', on: 'afterLoss', onValue: 0, onUnit: 'bets', action: 'increaseBetPercent', value: 100, minimized: false }
  ]);

  const handleCreateStrategy = () => {
    setEditingStrategy(null);
    setStrategyName('');
    setConditions([{ type: 'bet', on: 'afterLoss', onValue: 0, onUnit: 'bets', action: 'increaseBetPercent', value: 100, minimized: false }]);
    setShowStrategyBuilder(true);
  };

  const handleEditStrategy = () => {
    if (!selectedStrategy || !selectedStrategy.startsWith('custom_')) return;
    const strategy = customStrategies.find(s => s.id === selectedStrategy);
    if (strategy) {
      setEditingStrategy(strategy.id);
      setStrategyName(strategy.name);
      setConditions(strategy.conditions);
      setShowStrategyBuilder(true);
    }
  };

  const handleSaveStrategy = () => {
    if (!strategyName.trim()) return;
    onSaveStrategy({
      id: editingStrategy || `custom_${Date.now()}`,
      name: strategyName,
      conditions
    });
    setShowStrategyBuilder(false);
  };

  const addCondition = () => {
    setConditions([...conditions, { type: 'bet', on: 'afterLoss', onValue: 0, onUnit: 'bets', action: 'increaseBetPercent', value: 100, minimized: false }]);
  };

  const updateCondition = (index, field, value) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const deleteCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const toggleMinimize = (index) => {
    const updated = [...conditions];
    updated[index].minimized = !updated[index].minimized;
    setConditions(updated);
  };

  const getConditionSummary = (condition) => {
    let onText = '';
    if (condition.type === 'bet') {
      onText = condition.on === 'afterWin' ? 'After win' :
               condition.on === 'afterLoss' ? 'After loss' :
               condition.on === 'every' ? `Every ${condition.onValue} ${condition.onUnit}` :
               condition.on === 'everyStreakOf' ? `Every streak of ${condition.onValue}` :
               condition.on === 'firstStreakOf' ? `First streak of ${condition.onValue}` :
               condition.on === 'streakGreater' ? `Streak greater than ${condition.onValue}` :
               condition.on === 'streakLower' ? `Streak lower than ${condition.onValue}` : '';
    } else {
      const unit = condition.onUnit || 'profit';
      const operator = condition.on === 'greaterThan' ? '>' :
                       condition.on === 'greaterThanEqual' ? '>=' :
                       condition.on === 'lowerThan' ? '<' :
                       condition.on === 'lowerThanEqual' ? '<=' : '';
      onText = `${unit.charAt(0).toUpperCase() + unit.slice(1)} ${operator} ${condition.onValue}`;
    }
    
    const actionText = condition.action === 'increaseBetPercent' ? `Increase bet amount ${condition.value}%` :
                       condition.action === 'decreaseBetPercent' ? `Decrease bet amount ${condition.value}%` :
                       condition.action === 'increaseWinChancePercent' ? `Increase win chance ${condition.value}%` :
                       condition.action === 'decreaseWinChancePercent' ? `Decrease win chance ${condition.value}%` :
                       condition.action === 'addToBet' ? `Add to bet amount ${condition.value}` :
                       condition.action === 'subtractFromBet' ? `Subtract from bet amount ${condition.value}` :
                       condition.action === 'addToWinChance' ? `Add to win chance ${condition.value}` :
                       condition.action === 'subtractFromWinChance' ? `Subtract from win chance ${condition.value}` :
                       condition.action === 'setBet' ? `Set bet amount ${condition.value}` :
                       condition.action === 'setWinChance' ? `Set win chance ${condition.value}` :
                       condition.action === 'switchOverUnder' ? 'Switch over under' :
                       condition.action === 'resetBet' ? 'Reset bet amount' :
                       condition.action === 'resetWinChance' ? 'Reset win chance' :
                       condition.action === 'stopAutobet' ? 'Stop autobet' : '';
    
    return `On ${onText} → ${actionText}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-[500px] bg-[#1a2c38] border-l border-border-color z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Advanced Bet</h2>
                <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                  <X size={20} />
                </button>
              </div>

              {!showStrategyBuilder ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">Select Strategy</label>
                    <select
                      value={selectedStrategy}
                      onChange={(e) => onStrategySelect(e.target.value)}
                      className="w-full bg-background border border-border-color rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-[#557086]"
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

                  <div className="flex gap-2 text-sm text-text-secondary">
                    <button className="px-3 py-1 bg-background rounded">1</button>
                    <button className="px-3 py-1 bg-background rounded">2</button>
                  </div>

                  <div className="space-y-2">
                    <Button variant="secondary" onClick={handleCreateStrategy} className="w-full">
                      Create Strategy
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={handleEditStrategy} 
                      disabled={!selectedStrategy || !selectedStrategy.startsWith('custom_')}
                      className="w-full"
                    >
                      Edit Strategy
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => onDeleteStrategy(selectedStrategy)}
                      disabled={!selectedStrategy || !selectedStrategy.startsWith('custom_')}
                      className="w-full"
                    >
                      Delete Strategy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                    placeholder="Strategy Name"
                    className="w-full bg-background border border-border-color rounded-lg px-4 py-3 text-text-primary text-lg font-semibold focus:outline-none focus:border-[#557086]"
                  />

                  <div className="space-y-3">
                    {conditions.map((condition, index) => (
                      <div key={index} className="bg-[#0f212e] border border-border-color rounded-lg overflow-hidden">
                        {condition.minimized ? (
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">Condition {index + 1}</div>
                              <div className="text-xs text-text-secondary">{getConditionSummary(condition)}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => toggleMinimize(index)} className="text-text-secondary hover:text-text-primary">
                                <ChevronRight size={16} />
                              </button>
                              <button onClick={() => deleteCondition(index)} className="text-text-secondary hover:text-text-primary">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => deleteCondition(index)} className="text-error hover:text-[#ff4d42]">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-medium">Condition {index + 1}</span>
                              <div className="flex gap-2">
                                <button onClick={() => toggleMinimize(index)} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
                                  Minimize <Square size={14} />
                                </button>
                                <button onClick={() => deleteCondition(index)} className="flex items-center gap-1 text-sm text-error hover:text-[#ff4d42]">
                                  Delete <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={condition.type === 'bet'}
                                    onChange={() => updateCondition(index, 'type', 'bet')}
                                    className="accent-accent-green"
                                  />
                                  <span className="text-sm">Bet Condition</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={condition.type === 'profit'}
                                    onChange={() => updateCondition(index, 'type', 'profit')}
                                    className="accent-accent-green"
                                  />
                                  <span className="text-sm">Profit Condition</span>
                                </label>
                              </div>

                              <div>
                                <label className="block text-xs text-text-secondary mb-2">On</label>
                                {condition.type === 'bet' ? (
                                  <div className="flex gap-2">
                                    <select
                                      value={condition.on}
                                      onChange={(e) => updateCondition(index, 'on', e.target.value)}
                                      className="flex-1 bg-[#1a2c38] border border-border-color rounded px-3 py-2 text-sm"
                                    >
                                      <option value="afterWin">After win</option>
                                      <option value="afterLoss">After loss</option>
                                      <option value="every">Every</option>
                                      <option value="everyStreakOf">Every streak of</option>
                                      <option value="firstStreakOf">First streak of</option>
                                      <option value="streakGreater">Streak greater than</option>
                                      <option value="streakLower">Streak lower than</option>
                                    </select>
                                    {!['afterWin', 'afterLoss'].includes(condition.on) && (
                                      <>
                                        <input
                                          type="number"
                                          value={condition.onValue}
                                          onChange={(e) => updateCondition(index, 'onValue', parseFloat(e.target.value))}
                                          className="w-24 bg-[#1a2c38] border border-border-color rounded px-3 py-2 text-sm"
                                        />
                                        {condition.on === 'every' && (
                                          <select
                                            value={condition.onUnit}
                                            onChange={(e) => updateCondition(index, 'onUnit', e.target.value)}
                                            className="w-24 bg-[#1a2c38] border border-border-color rounded px-3 py-2 text-sm"
                                          >
                                            <option value="bets">Bets</option>
                                            <option value="wins">Wins</option>
                                            <option value="losses">Losses</option>
                                          </select>
                                        )}
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-3 gap-2">
                                    <select
                                      value={condition.onUnit || 'profit'}
                                      onChange={(e) => updateCondition(index, 'onUnit', e.target.value)}
                                      className="bg-[#1a2c38] border border-border-color rounded px-3 py-2 text-sm"
                                    >
                                      <option value="profit">Profit</option>
                                      <option value="loss">Loss</option>
                                      <option value="balance">Balance</option>
                                    </select>
                                    <select
                                      value={condition.on || 'greaterThan'}
                                      onChange={(e) => updateCondition(index, 'on', e.target.value)}
                                      className="bg-[#1a2c38] border border-border-color rounded px-3 py-2 text-sm"
                                    >
                                      <option value="greaterThan">Greater than</option>
                                      <option value="greaterThanEqual">&gt;=</option>
                                      <option value="lowerThan">Lower than</option>
                                      <option value="lowerThanEqual">&lt;=</option>
                                    </select>
                                    <input
                                      type="number"
                                      value={condition.onValue}
                                      onChange={(e) => updateCondition(index, 'onValue', parseFloat(e.target.value))}
                                      step="0.00000001"
                                      className="bg-[#1a2c38] border border-border-color rounded px-3 py-2 text-sm"
                                    />
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs text-text-secondary mb-2">Do</label>
                                <select
                                  value={condition.action}
                                  onChange={(e) => updateCondition(index, 'action', e.target.value)}
                                  className="w-full bg-[#1a2c38] border border-border-color rounded px-3 py-2 text-sm mb-2"
                                >
                                  <option value="increaseBetPercent">Increase bet amount</option>
                                  <option value="decreaseBetPercent">Decrease bet amount</option>
                                  <option value="increaseWinChancePercent">Increase win chance</option>
                                  <option value="decreaseWinChancePercent">Decrease win chance</option>
                                  <option value="addToBet">Add to bet amount</option>
                                  <option value="subtractFromBet">Subtract from bet amount</option>
                                  <option value="addToWinChance">Add to win chance</option>
                                  <option value="subtractFromWinChance">Subtract from win chance</option>
                                  <option value="setBet">Set bet amount</option>
                                  <option value="setWinChance">Set win chance</option>
                                  <option value="switchOverUnder">Switch over under</option>
                                  <option value="resetBet">Reset bet amount</option>
                                  <option value="resetWinChance">Reset win chance</option>
                                  <option value="stopAutobet">Stop autobet</option>
                                </select>
                                {!['switchOverUnder', 'resetBet', 'resetWinChance', 'stopAutobet'].includes(condition.action) && (
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      value={condition.value}
                                      onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value))}
                                      step="0.00000001"
                                      className="flex-1 bg-[#1a2c38] border border-border-color rounded px-3 py-2 text-sm"
                                    />
                                    <span className="px-3 py-2 bg-[#1a2c38] border border-border-color rounded text-sm text-text-secondary">
                                      {condition.action.includes('Percent') ? '%' : 'btc'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button variant="secondary" onClick={addCondition} className="w-full">
                    + Add Condition
                  </Button>

                  <div className="flex gap-2 pt-4">
                    <Button variant="success" onClick={handleSaveStrategy} className="flex-1">
                      Save
                    </Button>
                    <Button variant="secondary" onClick={() => setShowStrategyBuilder(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
