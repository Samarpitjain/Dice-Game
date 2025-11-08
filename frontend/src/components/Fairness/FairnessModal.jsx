import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, RotateCcw, Shield } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { verifyRoll } from '../../utils/fairness';
import { seedAPI } from '../../utils/api';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import toast from 'react-hot-toast';

export default function FairnessModal({ isOpen, onClose }) {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('seeds');
  const [newClientSeed, setNewClientSeed] = useState('');
  const [nextServerSeedHash, setNextServerSeedHash] = useState('');
  const [unhashInput, setUnhashInput] = useState('');
  const [unhashedResult, setUnhashedResult] = useState('');
  const [verificationData, setVerificationData] = useState({
    serverSeed: '',
    clientSeed: '',
    nonce: 0
  });
  const [verificationResult, setVerificationResult] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

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

  const handleChangeSeedPair = async () => {
    if (!newClientSeed) {
      toast.error('Please enter a new client seed');
      return;
    }

    try {
      setIsChanging(true);
      
      // Update client seed
      await seedAPI.updateClientSeed(newClientSeed);
      
      // Rotate server seed to get new one
      const response = await seedAPI.resetServerSeed();
      
      // Update active seeds immediately
      dispatch({ 
        type: 'UPDATE_SEEDS', 
        payload: { 
          clientSeed: newClientSeed,
          serverSeedHash: response.data.newServerSeedHash,
          nonce: 1
        }
      });

      // Clear inputs
      setNewClientSeed('');
      setNextServerSeedHash('');
      
      toast.success('Seed pair changed successfully');
    } catch (error) {
      toast.error('Failed to change seed pair');
    } finally {
      setIsChanging(false);
    }
  };

  const handleUnhash = async () => {
    if (!unhashInput) {
      toast.error('Please enter a server seed to unhash');
      return;
    }
    
    try {
      const response = await seedAPI.unhashServerSeed(unhashInput);
      setUnhashedResult(response.data.serverSeed);
      toast.success('Server seed revealed successfully');
    } catch (error) {
      setUnhashedResult('');
      toast.error(error.response?.data?.error || 'Failed to unhash server seed');
    }
  };

  const handleVerify = async () => {
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-border-color rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Provable Fairness</h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Tab Navigation */}
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

              {/* Seeds Tab */}
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
                            placeholder="Enter new client seed"
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
                          {nextServerSeedHash || 'Will be generated on change'}
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        onClick={handleChangeSeedPair}
                        loading={isChanging}
                        disabled={!newClientSeed}
                        className="w-full"
                      >
                        <RotateCcw size={16} className="mr-2" />
                        Change
                      </Button>

                      <div className="border-t border-border-color pt-4 mt-4">
                        <label className="block text-sm text-text-secondary mb-2">
                          Unhash Server Seed
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={unhashInput}
                            onChange={(e) => setUnhashInput(e.target.value)}
                            placeholder="Paste server seed hash"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleUnhash}
                          >
                            Unhash
                          </Button>
                        </div>
                        {unhashedResult && (
                          <div className="mt-2 p-2 bg-background rounded text-xs text-error">
                            {unhashedResult}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Verify Tab */}
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
                    onClick={handleVerify}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}