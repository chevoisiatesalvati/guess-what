'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target, Zap, Users, Coins } from 'lucide-react';

interface GameRulesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameRules({ isOpen, onClose }: GameRulesProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className='fixed inset-4 z-50 flex items-center justify-center p-4'
          >
            <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden'>
              {/* Header */}
              <div className='bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative'>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className='absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors'
                >
                  <X className='w-5 h-5' />
                </motion.button>

                <div className='flex items-center gap-3'>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className='text-3xl'
                  >
                    🧠
                  </motion.div>
                  <div>
                    <h2 className='text-2xl font-bold'>How to Play</h2>
                    <p className='text-white/80 text-sm'>
                      Master the art of word connections!
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
                <div className='space-y-6'>
                  {/* Objective */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className='bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200'
                  >
                    <div className='flex items-center gap-3 mb-3'>
                      <Target className='w-6 h-6 text-blue-600' />
                      <h3 className='text-lg font-bold text-gray-900'>
                        Objective
                      </h3>
                    </div>
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      Guess the <strong>middle word</strong> that connects the
                      top and bottom words. The middle word should have a
                      meaningful relationship with both words above and below
                      it.
                    </p>
                  </motion.div>

                  {/* How to Play */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className='bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200'
                  >
                    <div className='flex items-center gap-3 mb-3'>
                      <Zap className='w-6 h-6 text-green-600' />
                      <h3 className='text-lg font-bold text-gray-900'>
                        How to Play
                      </h3>
                    </div>
                    <ol className='text-gray-700 text-sm space-y-2'>
                      <li className='flex items-start gap-2'>
                        <span className='bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5'>
                          1
                        </span>
                        <span>
                          Look at the <strong>top word</strong> and{' '}
                          <strong>bottom word</strong>
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5'>
                          2
                        </span>
                        <span>Think of a word that connects them both</span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5'>
                          3
                        </span>
                        <span>
                          Type your guess letter by letter in the middle
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5'>
                          4
                        </span>
                        <span>
                          Submit your guess and see if you&apos;re right!
                        </span>
                      </li>
                    </ol>
                  </motion.div>

                  {/* Example */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className='bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200'
                  >
                    <div className='flex items-center gap-3 mb-3'>
                      <Trophy className='w-6 h-6 text-purple-600' />
                      <h3 className='text-lg font-bold text-gray-900'>
                        Example
                      </h3>
                    </div>
                    <div className='bg-white rounded-lg p-4 border-2 border-purple-200'>
                      <div className='text-center space-y-2'>
                        <div className='text-lg font-bold text-gray-800'>
                          CAT
                        </div>
                        <div className='text-2xl font-bold text-purple-600'>
                          ANIMAL
                        </div>
                        <div className='text-lg font-bold text-gray-800'>
                          DOG
                        </div>
                      </div>
                      <p className='text-gray-600 text-xs mt-2 text-center'>
                        &quot;CAT&quot; is an &quot;ANIMAL&quot; and
                        &quot;DOG&quot; is an &quot;ANIMAL&quot;
                      </p>
                    </div>
                  </motion.div>

                  {/* Scoring */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className='bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200'
                  >
                    <div className='flex items-center gap-3 mb-3'>
                      <Coins className='w-6 h-6 text-yellow-600' />
                      <h3 className='text-lg font-bold text-gray-900'>
                        Scoring & Prizes
                      </h3>
                    </div>
                    <ul className='text-gray-700 text-sm space-y-2'>
                      <li className='flex items-start gap-2'>
                        <span className='text-yellow-600'>💰</span>
                        <span>
                          Pay <strong>entry fee</strong> to make a guess
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='text-green-600'>🏆</span>
                        <span>
                          Correct guess = <strong>win the prize pool</strong>
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='text-red-600'>❌</span>
                        <span>
                          Wrong guess = <strong>fee goes to prize pool</strong>
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='text-blue-600'>📈</span>
                        <span>Prize grows with each wrong guess!</span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Tips */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className='bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-200'
                  >
                    <div className='flex items-center gap-3 mb-3'>
                      <Users className='w-6 h-6 text-indigo-600' />
                      <h3 className='text-lg font-bold text-gray-900'>
                        Pro Tips
                      </h3>
                    </div>
                    <ul className='text-gray-700 text-sm space-y-2'>
                      <li className='flex items-start gap-2'>
                        <span className='text-indigo-600'>💡</span>
                        <span>
                          Think of <strong>common connections</strong> between
                          words
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='text-indigo-600'>🎯</span>
                        <span>
                          Consider <strong>categories</strong> (animals,
                          objects, actions)
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='text-indigo-600'>🔗</span>
                        <span>
                          Look for <strong>relationships</strong> (part of, used
                          with, similar to)
                        </span>
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='text-indigo-600'>⚡</span>
                        <span>
                          Be quick - <strong>first correct guess wins!</strong>
                        </span>
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <div className='bg-gray-50 px-6 py-4 border-t border-gray-200'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200'
                >
                  Got it! Let&apos;s Play! 🎮
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
