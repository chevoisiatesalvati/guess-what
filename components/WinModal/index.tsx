'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Share, Home, RotateCcw } from 'lucide-react';
import ShareButton from '@/components/ShareButton';
import { ShareData } from '@/lib/sharing';
import { FireworksBackground } from '@/components/ui/fireworks-background';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onGoHome: () => void;
  gameId: number;
  prize: string;
}

export default function WinModal({
  isOpen,
  onClose,
  onNewGame,
  onGoHome,
  gameId,
  prize,
}: WinModalProps) {
  const shareData: ShareData = {
    type: 'game_win',
    gameId,
    prize,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className='relative bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl'
          >
            {/* Content */}
            <div className='text-center relative z-10'>
              {/* Win Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className='mb-6'
              >
                <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                  🎉 Congratulations!
                </h2>
                <div className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-3xl py-4 px-8 rounded-xl shadow-lg'>
                  You won {prize} ETH!
                </div>
              </motion.div>

              {/* Share Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className='mb-6'
              >
                <ShareButton
                  data={shareData}
                  variant='primary'
                  className='w-full flex items-center justify-center gap-2'
                >
                  <Share className='w-5 h-5' />
                  Share Win on Farcaster
                </ShareButton>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className='space-y-3'
              >
                <button
                  onClick={onNewGame}
                  className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2'
                >
                  <RotateCcw className='w-5 h-5' />
                  Play Again
                </button>

                <button
                  onClick={onGoHome}
                  className='w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2'
                >
                  <Home className='w-5 h-5' />
                  Go Home
                </button>
              </motion.div>
            </div>

            {/* Fireworks on top of content */}
            <div className='absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-20'>
              <FireworksBackground
                className='w-full h-full'
                population={12}
                fireworkSpeed={{ min: 8, max: 16 }}
                fireworkSize={{ min: 4, max: 10 }}
                particleSpeed={{ min: 4, max: 14 }}
                particleSize={{ min: 2, max: 10 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
