'use client';

import { motion } from 'framer-motion';
import { ShareData, shareToWarpcast } from '@/lib/sharing';

interface ShareButtonProps {
  data: ShareData;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'small';
}

export default function ShareButton({
  data,
  className = '',
  children,
  variant = 'primary',
}: ShareButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200';
      case 'secondary':
        return 'w-full bg-white/20 backdrop-blur-sm text-gray-800 font-bold py-2 px-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-white/30';
      case 'small':
        return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium py-1.5 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm';
      default:
        return '';
    }
  };

  const handleShare = async () => {
    try {
      await shareToWarpcast(data);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={handleShare}
      className={`${getVariantStyles()} ${className}`}
    >
      {children || '🎉 Share to Farcaster'}
    </motion.button>
  );
}
