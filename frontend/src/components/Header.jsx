import { useState } from 'react';
import { Shield, User, LogOut, Plus } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/format';
import Button from './Shared/Button';
import Input from './Shared/Input';
import FairnessModal from './Fairness/FairnessModal';
import toast from 'react-hot-toast';

export default function Header() {
  const { state, dispatch } = useGame();
  const [showFairnessModal, setShowFairnessModal] = useState(false);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'SET_USER', payload: null });
    window.location.reload();
  };

  const handleAddBalance = () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const newBalance = state.balance + amount;
    dispatch({ type: 'UPDATE_BALANCE', payload: newBalance });
    setShowAddBalance(false);
    setAddAmount('');
    toast.success(`Added ${formatNumber(amount)} to balance`);
  };

  return (
    <>
      <header className="bg-card-bg border-b border-border-color px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-accent-blue">Dice Game</h1>
            <div className="text-sm text-text-secondary">
              Provably Fair Gaming
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {state.user && (
              <>
                <div className="flex items-center space-x-2">
                  <User size={20} className="text-text-secondary" />
                  <span className="text-text-primary">{state.user.username}</span>
                </div>

                <div className="text-right">
                  <div className="text-sm text-text-secondary">Balance</div>
                  <div className="font-mono font-bold text-accent-green">
                    {formatNumber(state.balance)}
                  </div>
                </div>

                {state.balance === 0 && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => setShowAddBalance(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Balance
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFairnessModal(true)}
                >
                  <Shield size={16} className="mr-2" />
                  Fairness
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <FairnessModal
        isOpen={showFairnessModal}
        onClose={() => setShowFairnessModal(false)}
      />

      {showAddBalance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddBalance(false)}>
          <div className="bg-card-bg border border-border-color rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-text-primary">Add Balance</h2>
            <Input
              label="Amount"
              type="number"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              min="0.01"
              step="0.01"
              placeholder="Enter amount to add"
            />
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowAddBalance(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="success" onClick={handleAddBalance} className="flex-1">
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}