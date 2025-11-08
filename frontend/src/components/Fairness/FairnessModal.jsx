import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { verifyRoll, sha256 } from '../../utils/fairness';
import { seedAPI } from '../../utils/api';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import toast from 'react-hot-toast';

export default function FairnessModal({ isOpen, onClose }) {
  const { state, dispatch } = useGame();
  const [verificationData, setVerificationData] = useState({
    serverSeed: '',
    clientSeed: state.seeds.clientSeed,
    nonce: 0
  });
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

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

  const handleVerify = async () => {
    if (!verificationData.serverSeed || !verificationData.clientSeed) {
      toast.error('Please provide both server seed and client seed');
      return;
    }

    try {
      setIsVerifying(true);
      const roll = await verifyRoll(
        verificationData.serverSeed,
        verificationData.clientSeed,
        verificationData.nonce
      );
      setVerificationResult(roll);
      toast.success('Roll verified successfully');
    } catch (error) {
      toast.error('Verification failed');
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetServerSeed = async () => {
    try {
      const response = await seedAPI.resetServerSeed();
      dispatch({ 
        type: 'UPDATE_SEEDS', 
        payload: { serverSeedHash: response.data.newServerSeedHash }
      });
      toast.success('Server seed rotated');
      setVerificationData(prev => ({ ...prev, serverSeed: response.data.oldServerSeed }));
    } catch (error) {
      toast.error('Failed to reset server seed');
    }
  };

  const handleUpdateClientSeed = async (newSeed) => {
    try {
      await seedAPI.updateClientSeed(newSeed);
      dispatch({ 
        type: 'UPDATE_SEEDS', 
        payload: { clientSeed: newSeed }
      });
      toast.success('Client seed updated');
    } catch (error) {
      toast.error('Failed to update client seed');
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
              {/* Current Seeds */}
              <div>
                <h3 className="text-lg font-medium mb-4">Current Seeds</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">
                      Server Seed Hash
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 p-2 bg-background rounded text-sm font-mono break-all">
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
                    <label className="block text-sm text-text-secondary mb-1">
                      Client Seed
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={state.seeds.clientSeed}
                        onChange={(e) => setVerificationData(prev => ({ 
                          ...prev, 
                          clientSeed: e.target.value 
                        }))}
                        onBlur={(e) => handleUpdateClientSeed(e.target.value)}
                        className="flex-1"
                      />
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
                    <label className="block text-sm text-text-secondary mb-1">
                      Current Nonce
                    </label>
                    <div className="p-2 bg-background rounded text-sm font-mono">
                      {state.seeds.nonce}
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={handleResetServerSeed}
                  className="mt-4"
                >
                  Rotate Server Seed
                </Button>
              </div>

              {/* Verification */}
              <div>
                <h3 className="text-lg font-medium mb-4">Verify Roll</h3>
                
                <div className="space-y-3">
                  <Input
                    label="Server Seed (revealed)"
                    value={verificationData.serverSeed}
                    onChange={(e) => setVerificationData(prev => ({ 
                      ...prev, 
                      serverSeed: e.target.value 
                    }))}
                    placeholder="Enter revealed server seed"
                  />

                  <Input
                    label="Client Seed"
                    value={verificationData.clientSeed}
                    onChange={(e) => setVerificationData(prev => ({ 
                      ...prev, 
                      clientSeed: e.target.value 
                    }))}
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
                    loading={isVerifying}
                    disabled={!verificationData.serverSeed || !verificationData.clientSeed}
                  >
                    Verify Roll
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
              </div>

              {/* How it Works */}
              <div>
                <h3 className="text-lg font-medium mb-4">How Provable Fairness Works</h3>
                <div className="text-sm text-text-secondary space-y-2">
                  <p>1. Server generates a random seed and shows you its hash before you bet</p>
                  <p>2. You can set your own client seed or use the default random one</p>
                  <p>3. Each bet uses: HMAC-SHA256(serverSeed, clientSeed:nonce)</p>
                  <p>4. The first 8 hex characters determine your roll result</p>
                  <p>5. After rotating seeds, the old server seed is revealed for verification</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}