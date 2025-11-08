import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ChevronDown, ChevronUp, Shuffle } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { seedAPI } from '../../utils/api';
import { formatNumber } from '../../utils/format';
import Button from '../Shared/Button';
import toast from 'react-hot-toast';

export default function BetDetailModal({ isOpen, onClose, bet }) {
  const { state } = useGame();
  const [copiedField, setCopiedField] = useState(null);
  const [showFairness, setShowFairness] = useState(false);
  const [revealedSeed, setRevealedSeed] = useState(null);
  const [loadingSeed, setLoadingSeed] = useState(false);

  useEffect(() => {
    if (isOpen && bet) {
      fetchRevealedSeed();
    }
  }, [isOpen, bet]);

  const fetchRevealedSeed = async () => {
    if (!bet) return;
    
    setLoadingSeed(true);
    try {
      const response = await seedAPI.unhashServerSeed(bet.serverSeedHash);
      setRevealedSeed(response.data.serverSeed);
    } catch (error) {
      setRevealedSeed(null);
    } finally {
      setLoadingSeed(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.success('Copied');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (!bet) return null;

  const multiplier = bet.payoutMultiplier || (bet.payout / bet.betAmount);
  const rollPosition = (bet.roll / 100) * 100;
  const targetPosition = (bet.target / 100) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-[#1a2c38] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#1a2c38] border-b border-[#2f4553] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2f4553] rounded flex items-center justify-center">
                  <Shuffle size={16} className="text-text-secondary" />
                </div>
                <h2 className="text-lg font-semibold">Bet</h2>
              </div>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Game & ID */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Dice</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                  <span>ID {bet._id}</span>
                  <button onClick={() => copyToClipboard(bet._id, 'betId')}>
                    {copiedField === 'betId' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* User & Date */}
              <div className="text-center text-sm text-text-secondary">
                <div>Placed by {state.user?.username || 'Player'}</div>
                <div>on {new Date(bet.createdAt).toLocaleString()}</div>
              </div>

              {/* Bet Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-[#0f212e] rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-text-secondary mb-1">Bet</div>
                  <div className="font-mono font-semibold">{formatNumber(bet.betAmount)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-text-secondary mb-1">Multiplier</div>
                  <div className="font-mono font-semibold">{multiplier.toFixed(2)}x</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-text-secondary mb-1">Payout</div>
                  <div className={`font-mono font-semibold ${bet.win ? 'text-accent-green' : 'text-text-primary'}`}>
                    {formatNumber(bet.payout)}
                  </div>
                </div>
              </div>

              {/* Roll Result */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">Roll Result</span>
                  <span className={`font-mono text-2xl font-bold ${bet.win ? 'text-accent-green' : 'text-error'}`}>
                    {formatNumber(bet.roll)}
                  </span>
                </div>

                {/* Visual Slider */}
                <div className="relative">
                  <div className="flex justify-between text-xs text-text-secondary mb-2">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                  
                  <div className="relative h-12 bg-[#0f212e] rounded-full overflow-hidden">
                    {/* Color zones based on direction */}
                    {bet.direction === 'under' ? (
                      <>
                        <div 
                          className="absolute top-0 left-0 h-full bg-accent-green/30"
                          style={{ width: `${targetPosition}%` }}
                        />
                        <div 
                          className="absolute top-0 h-full bg-error/30"
                          style={{ left: `${targetPosition}%`, width: `${100 - targetPosition}%` }}
                        />
                      </>
                    ) : (
                      <>
                        <div 
                          className="absolute top-0 left-0 h-full bg-error/30"
                          style={{ width: `${targetPosition}%` }}
                        />
                        <div 
                          className="absolute top-0 h-full bg-accent-green/30"
                          style={{ left: `${targetPosition}%`, width: `${100 - targetPosition}%` }}
                        />
                      </>
                    )}
                    
                    {/* Target marker */}
                    <div 
                      className="absolute top-0 w-1 h-full bg-white/50"
                      style={{ left: `${targetPosition}%` }}
                    />
                    
                    {/* Roll result marker */}
                    <motion.div
                      initial={{ left: '50%' }}
                      animate={{ left: `${rollPosition}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                    >
                      <div className={`w-8 h-8 rounded-full ${bet.win ? 'bg-accent-green' : 'bg-error'} border-2 border-white shadow-lg`} />
                    </motion.div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-text-secondary mb-1">Multiplier</div>
                    <div className="font-mono">{multiplier.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary mb-1">Roll {bet.direction === 'over' ? 'Over' : 'Under'}</div>
                    <div className="font-mono">{formatNumber(bet.target)}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary mb-1">Win Chance</div>
                    <div className="font-mono">{bet.winChance.toFixed(2)}%</div>
                  </div>
                </div>

                {/* Profit/Loss */}
                <div className="p-4 bg-[#0f212e] rounded-lg flex justify-between items-center">
                  <span className="text-text-secondary">Profit</span>
                  <span className={`font-mono text-xl font-bold ${bet.win ? 'text-accent-green' : 'text-error'}`}>
                    {bet.win ? '+' : ''}{formatNumber(bet.profit)}
                  </span>
                </div>
              </div>

              {/* Provable Fairness Section */}
              <div className="border-t border-[#2f4553] pt-6">
                <button
                  onClick={() => setShowFairness(!showFairness)}
                  className="w-full flex items-center justify-between text-left mb-4"
                >
                  <span className="font-semibold">Provable Fairness</span>
                  {showFairness ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <AnimatePresence>
                  {showFairness && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Server Seed */}
                      <div>
                        <label className="block text-xs text-text-secondary mb-2">Server Seed</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={loadingSeed ? 'Loading...' : (revealedSeed || "Seed hasn't been revealed yet")}
                            readOnly
                            className="w-full bg-[#0f212e] border border-[#2f4553] rounded-lg px-4 py-3 pr-12 font-mono text-sm text-text-secondary"
                          />
                          {revealedSeed && (
                            <button
                              onClick={() => copyToClipboard(revealedSeed, 'serverSeed')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                            >
                              {copiedField === 'serverSeed' ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Server Seed Hash */}
                      <div>
                        <label className="block text-xs text-text-secondary mb-2">Server Seed (Hashed)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={bet.serverSeedHash}
                            readOnly
                            className="w-full bg-[#0f212e] border border-[#2f4553] rounded-lg px-4 py-3 pr-12 font-mono text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(bet.serverSeedHash, 'hash')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                          >
                            {copiedField === 'hash' ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Client Seed & Nonce */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-text-secondary mb-2">Client Seed</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={bet.clientSeed}
                              readOnly
                              className="w-full bg-[#0f212e] border border-[#2f4553] rounded-lg px-4 py-3 pr-12 font-mono text-sm"
                            />
                            <button
                              onClick={() => copyToClipboard(bet.clientSeed, 'client')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                            >
                              {copiedField === 'client' ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-text-secondary mb-2">Nonce</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={bet.nonce}
                              readOnly
                              className="w-full bg-[#0f212e] border border-[#2f4553] rounded-lg px-4 py-3 pr-12 font-mono text-sm"
                            />
                            <button
                              onClick={() => copyToClipboard(bet.nonce.toString(), 'nonce')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                            >
                              {copiedField === 'nonce' ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {!revealedSeed && (
                        <div className="text-xs text-text-secondary text-center py-2">
                          Rotate your seed pair in order to verify this bet
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
