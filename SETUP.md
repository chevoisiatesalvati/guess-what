# Guess What? Game - Setup Guide

## Overview

A blockchain-based word guessing game built on Base network where players guess the middle word between two given words to win ETH prizes.

## Features

- 🎮 Real-time word guessing game
- 💰 ETH prizes and entry fees
- 📱 Mobile-optimized UI
- ⚡ Fast gameplay with keyboard focus
- 🔗 Base blockchain integration
- 🏆 Player statistics and leaderboards

## Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask wallet
- Base network access

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_URL=http://localhost:3000
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 3. Smart Contract Deployment

#### Install Hardhat Dependencies

```bash
cd contracts
npm install
```

#### Deploy to Base Sepolia (Testnet)

```bash
npm run deploy:base-sepolia
```

#### Deploy to Base Mainnet

```bash
npm run deploy:base
```

#### Update Contract Address

After deployment, update the contract address in `lib/contract-utils.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  base: 'YOUR_DEPLOYED_CONTRACT_ADDRESS',
  baseSepolia: 'YOUR_DEPLOYED_CONTRACT_ADDRESS',
};
```

### 4. Run Development Server

```bash
npm run dev
```

## Game Rules

1. **Word Association**: Players see two words (top and bottom) and must guess the middle word
2. **Hint System**: The middle word shows only first and last letters (e.g., "C••••••T" for "CAT")
3. **Time Limit**: 30 seconds per game
4. **Entry Fee**: 0.001 ETH to play
5. **Prize Pool**: Winner takes the total prize pool
6. **Speed Matters**: Multiple players can play the same game simultaneously

## Smart Contract Features

- **Game Management**: Create, join, and manage games
- **Prize Distribution**: Automatic ETH transfers to winners
- **Player Statistics**: Track games played, wins, and winnings
- **Platform Fees**: 5% platform fee on winnings
- **Security**: ReentrancyGuard and access controls

## Mobile Optimization

- **Keyboard Focus**: Auto-focus input field for fast typing
- **Responsive Design**: Optimized for mobile screens
- **Touch-Friendly**: Large buttons and touch targets
- **Fast Loading**: Minimal dependencies and optimized assets

## Development

### Project Structure

```
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── Game/             # Main game component
│   └── providers.tsx     # Context providers
├── contexts/             # React contexts
│   ├── game-context.tsx  # Game state management
│   └── user-context.tsx  # User authentication
├── contracts/            # Smart contracts
│   ├── GuessWhatGame.sol # Main game contract
│   └── scripts/         # Deployment scripts
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and types
└── public/             # Static assets
```

### Key Components

1. **Game Component** (`components/Game/index.tsx`)

   - Main game interface
   - Mobile-optimized UI
   - Real-time updates

2. **Game Context** (`contexts/game-context.tsx`)

   - Game state management
   - Player statistics
   - Timer functionality

3. **Contract Integration** (`hooks/use-contract.ts`)

   - Smart contract interactions
   - Transaction handling
   - Network management

4. **Smart Contract** (`contracts/GuessWhatGame.sol`)
   - Game logic on blockchain
   - Prize distribution
   - Player statistics

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Smart Contract (Base)

1. Get Base network RPC URL
2. Fund deployment wallet with ETH
3. Run deployment script
4. Verify contract on BaseScan

## Testing

### Local Testing

```bash
npm run dev
```

### Contract Testing

```bash
cd contracts
npm test
```

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**

   - Ensure MetaMask is installed
   - Check if Base network is added
   - Verify wallet has ETH for gas fees

2. **Contract Interaction Errors**

   - Check contract address is correct
   - Ensure sufficient ETH for transactions
   - Verify network is Base

3. **Mobile Performance**
   - Test on actual mobile devices
   - Check keyboard behavior
   - Verify touch interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE.md for details
