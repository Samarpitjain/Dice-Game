import { useState } from 'react';
import { Shield, User, LogOut } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/format';
import Button from './Shared/Button';
import FairnessModal from './Fairness/FairnessModal';

export default function Header() {
  const { state, dispatch } = useGame();
  const [showFairnessModal, setShowFairnessModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'SET_USER', payload: null });
    window.location.reload();
  };

  return (
    <>
      <header className="bg-border-color border-b border-gray-700 px-6 py-4">
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
    </>
  );
}