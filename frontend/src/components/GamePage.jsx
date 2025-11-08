import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useSocket } from '../hooks/useSocket';
import { authAPI } from '../utils/api';
import Header from './Header';
import RollBar from './Main/RollBar';
import ManualControls from './LeftControls/ManualControls';
import AutoControls from './LeftControls/AutoControls';
import BetHistory from './Right/BetHistory';
import StatsPanel from './Right/StatsPanel';
import FairnessModal from './Fairness/FairnessModal';
import Button from './Shared/Button';
import Input from './Shared/Input';
import toast from 'react-hot-toast';

export default function GamePage() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('manual');
  const [showFairnessModal, setShowFairnessModal] = useState(false);

  useSocket(); // Initialize socket connection

  useEffect(() => {
    // Auto-login as demo user
    const loginDemo = async () => {
      try {
        const response = await authAPI.login('demo-user');
        localStorage.setItem('token', response.data.token);
        dispatch({ type: 'SET_USER', payload: response.data.user });
      } catch (error) {
        console.error('Auto-login failed:', error);
      }
    };
    loginDemo();
  }, []);

  if (!state.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-accent-blue">
            Dice Game
          </h1>
          <p className="text-text-secondary text-center mb-6">
            Loading demo user...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* Tab Navigation */}
              <div className="flex mb-6 bg-background rounded-lg p-1 border border-border-color">
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'manual'
                      ? 'bg-[#557086] text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setActiveTab('auto')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'auto'
                      ? 'bg-[#557086] text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Auto
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'manual' ? <ManualControls /> : <AutoControls />}
            </div>
          </div>

          {/* Main Roll Area */}
          <div className="lg:col-span-6">
            <RollBar />
          </div>

          {/* Right Stats */}
          <div className="lg:col-span-3 space-y-6">
            <StatsPanel />
            <BetHistory />
          </div>
        </div>
      </div>
      
      <FairnessModal
        isOpen={showFairnessModal}
        onClose={() => setShowFairnessModal(false)}
      />
    </div>
  );
}