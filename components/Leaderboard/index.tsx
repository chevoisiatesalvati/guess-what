'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';

export default function Leaderboard() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col p-3'>
      <div className='max-w-4xl mx-auto w-full flex-1 flex flex-col'>
        {/* Leaderboard Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white/95 backdrop-blur-sm rounded-2xl p-3 text-center mb-2 shadow-xl border border-white/20 flex-shrink-0'
        >
          <div className='flex items-center justify-center gap-2'>
            <Trophy className='w-8 h-8 text-yellow-500' />
            <h1 className='text-2xl font-bold text-gray-900'>Leaderboard</h1>
          </div>
        </motion.div>

        {/* Leaderboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-2 shadow-xl border border-white/20 flex-1 flex flex-col justify-center min-h-0'
        >
          {/* Coming Soon Content */}
          <div className='bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl text-center border border-blue-200'>
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className='text-4xl mb-2'
            >
              🚀
            </motion.div>
            <div className='text-base font-bold text-gray-900 mb-1'>
              Coming Soon!
            </div>
            <div className='text-xs text-gray-600'>
              Global leaderboard launching soon 📈
            </div>
          </div>
        </motion.div>

        {/* Go Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='flex-shrink-0'
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => window.history.back()}
            className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center justify-center gap-3 border-2 border-white/20'
          >
            <ArrowLeft className='w-5 h-5' />
            <span>Go Back</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
