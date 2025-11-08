import { useState, useEffect } from 'react';
import { Copy, RotateCcw, Shield, Check, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { seedAPI } from '../../utils/api';
import { verifyRoll } from '../../utils/fairness';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import toast from 'react-hot-toast';

export default function FairnessPanel() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('seeds');
  const [newClientSeed, setNewClientSeed] = useState('');
  const [nextServerSeedHash, setNextServerSeedHash] = useState('');
  const [verificationData, setVerificationData] = useState({
    serverSeed: '',
    clientSeed: '',
    nonce: 0
  });
  const [verificationResult, setVerificationResult] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isRotating, setIsRotating] = useState(false);

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 15);
    setNewClientSeed(randomSeed);
  };

  const handleRotateSeeds = async () => {
    try {
      setIsRotating(true);
      const response = await seedAPI.resetServerSeed();
      
      dispatch({ 
        type: 'UPDATE_SEEDS', 
        payload: { 
          serverSeedHash: response.data.newServerSeedHash,
          nonce: 1
        }
      });

      toast.success('Seeds rotated successfully');
      setNewClientSeed('');
    } catch (error) {
      toast.error('Failed to rotate seeds');
    } finally {
      setIsRotating(false);
    }
  };

  const handleUnhashServerSeed = async () => {
    try {
      await seedAPI.unhashServerSeed();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Cannot unhash active server seed');
    }
  };

  const handleVerifyRoll = async () => {
    if (!verificationData.serverSeed || !verificationData.clientSeed) {
      toast.error('Please provide both server seed and client seed');
      return;
    }

    try {
      const roll = await verifyRoll(
        verificationData.serverSeed,
        verificationData.clientSeed,
        verificationData.nonce
      );
      setVerificationResult(roll);
      toast.success('Roll verified successfully');
    } catch (error) {
      toast.error('Verification failed');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="text-accent-blue" size={20} />
        <h2 className="text-lg font-semibold">Provably Fair</h2>
      </div>

      <div className="flex mb-6 bg-background rounded-lg p-1">
        <button
          onClick={() => setActiveTab('seeds')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'seeds'
              ? 'bg-accent-blue text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Seeds
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'verify'
              ? 'bg-accent-blue text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Verify
        </button>
      </div>

      {activeTab === 'seeds' && (
        <div className="space-y-6">
          {/* Active Seeds */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Active Client Seed
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-background rounded font-mono text-sm break-all">
                  {state.seeds.clientSeed}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(state.seeds.clientSeed, 'clientSeed')}
                >
                  {copiedField === 'clientSeed' ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Active Server Seed (Hashed)
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-background rounded text-xs font-mono break-all">
                  {state.seeds.serverSeedHash}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(state.seeds.serverSeedHash, 'serverHash')}
                >
                  {copiedField === 'serverHash' ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Total bets made with pair
              </label>
              <div className="p-3 bg-background rounded font-mono text-sm">
                {state.seeds.nonce}
              </div>
            </div>
          </div>

          {/* Rotate Seed Pair */}
          <div className="border-t border-border-color pt-6">
            <h3 className="text-lg font-medium mb-4">Rotate Seed Pair</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  New Client Seed
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newClientSeed}
                    onChange={(e) => setNewClientSeed(e.target.value)}
                    placeholder="Enter new client seed or generate random"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={generateRandomSeed}
                  >
                    Random
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Next Server Seed (Hashed)
                </label>
                <div className="p-3 bg-background rounded text-xs font-mono break-all text-text-secondary">
                  Will be generated after rotation
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleUnhashServerSeed}
                className="w-full"
              >
                Unhash Server Seed
              </Button>

              <Button
                variant="primary"
                onClick={handleRotateSeeds}
                loading={isRotating}
                className="w-full"
              >
                <RotateCcw size={16} className="mr-2" />
                Rotate Seed Pair
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="space-y-4">
          <div className="text-center text-text-secondary mb-4">
            More inputs are required to verify result
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Game
            </label>
            <div className="p-3 bg-background rounded text-sm">
              Dice
            </div>
          </div>

          <Input
            label="Client Seed"
            value={verificationData.clientSeed}
            onChange={(e) => setVerificationData(prev => ({ 
              ...prev, 
              clientSeed: e.target.value 
            }))}
            placeholder="Enter client seed"
          />

          <Input
            label="Server Seed"
            value={verificationData.serverSeed}
            onChange={(e) => setVerificationData(prev => ({ 
              ...prev, 
              serverSeed: e.target.value 
            }))}
            placeholder="Enter server seed"
          />

          <Input
            label="Nonce"
            type="number"
            value={verificationData.nonce}
            onChange={(e) => setVerificationData(prev => ({ 
              ...prev, 
              nonce: parseInt(e.target.value) || 0 
            }))}
            min="0"
          />

          <Button
            onClick={handleVerifyRoll}
            disabled={!verificationData.serverSeed || !verificationData.clientSeed}
            className="w-full"
          >
            Verify Gambling Result
          </Button>

          {verificationResult !== null && (
            <div className="p-4 bg-background rounded-lg">
              <div className="text-sm text-text-secondary mb-1">Verified Roll Result:</div>
              <div className="text-2xl font-mono font-bold text-accent-green">
                {verificationResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}