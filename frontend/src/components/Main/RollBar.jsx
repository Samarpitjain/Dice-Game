import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { formatNumber } from '../../utils/format';

export default function RollBar() {
  const { state } = useGame();
  const { lastRoll, target, direction, isRolling } = state;

  const getPosition = (value) => {
    return (value / 100) * 100; // Convert to percentage
  };

  const targetPosition = getPosition(target);
  const rollPosition = lastRoll ? getPosition(lastRoll.roll) : 0;

  return (
    <div className="card h-32 flex flex-col justify-center">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">Roll</span>
          <span className="text-text-secondary text-sm">Target: {formatNumber(target)}</span>
        </div>
        
        {/* Roll Bar */}
        <div className="relative h-12 bg-background rounded-lg overflow-hidden border border-border-color">
          {/* Target Line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-accent-blue z-10"
            style={{ left: `${targetPosition}%` }}
          />
          
          {/* Win/Loss Zones */}
          <div className="absolute inset-0 flex">
            {direction === 'under' ? (
              <>
                <div 
                  className="bg-accent-green bg-opacity-20"
                  style={{ width: `${targetPosition}%` }}
                />
                <div 
                  className="bg-error bg-opacity-20"
                  style={{ width: `${100 - targetPosition}%` }}
                />
              </>
            ) : (
              <>
                <div 
                  className="bg-error bg-opacity-20"
                  style={{ width: `${targetPosition}%` }}
                />
                <div 
                  className="bg-accent-green bg-opacity-20"
                  style={{ width: `${100 - targetPosition}%` }}
                />
              </>
            )}
          </div>

          {/* Roll Indicator */}
          {lastRoll && (
            <motion.div
              className={`absolute top-1 bottom-1 w-2 rounded-full z-20 ${
                lastRoll.win ? 'bg-accent-green' : 'bg-error'
              }`}
              initial={{ left: '0%' }}
              animate={{ left: `${rollPosition}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ marginLeft: '-4px' }}
            />
          )}

          {/* Rolling Animation */}
          {isRolling && (
            <motion.div
              className="absolute top-1 bottom-1 w-2 bg-accent-blue rounded-full z-20"
              animate={{ left: ['0%', '100%'] }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity, 
                ease: 'linear' 
              }}
              style={{ marginLeft: '-4px' }}
            />
          )}
        </div>

        {/* Scale */}
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>0.00</span>
          <span>25.00</span>
          <span>50.00</span>
          <span>75.00</span>
          <span>100.00</span>
        </div>
      </div>

      {/* Roll Result */}
      <div className="text-center">
        {isRolling ? (
          <motion.div 
            className="text-2xl font-mono font-bold text-accent-blue"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.25, repeat: Infinity }}
          >
            Rolling...
          </motion.div>
        ) : lastRoll ? (
          <motion.div 
            className={`text-3xl font-mono font-bold ${
              lastRoll.win ? 'text-accent-green' : 'text-error'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {formatNumber(lastRoll.roll)}
          </motion.div>
        ) : (
          <div className="text-2xl font-mono font-bold text-text-secondary">
            ---.--
          </div>
        )}
      </div>
    </div>
  );
}