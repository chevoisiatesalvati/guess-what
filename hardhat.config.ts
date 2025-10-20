import type { HardhatUserConfig } from 'hardhat/config';

import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import '@nomicfoundation/hardhat-verify';
import { configVariable } from 'hardhat/config';
import 'dotenv/config';
import hardhatVerify from '@nomicfoundation/hardhat-verify';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin, hardhatVerify],
  solidity: {
    profiles: {
      default: {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
      production: {
        version: '0.8.28',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable('BASESCAN_API_KEY'),
    },
    blockscout: {
      enabled: true,
    },
  },
  networks: {
    hardhatMainnet: {
      type: 'edr-simulated',
      chainType: 'l1',
    },
    hardhatOp: {
      type: 'edr-simulated',
      chainType: 'op',
    },
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('SEPOLIA_PRIVATE_KEY')],
    },
    baseSepolia: {
      type: 'http',
      chainType: 'l1',
      url: 'https://sepolia.base.org',
      accounts: [configVariable('PRIVATE_KEY')],
    },
    base: {
      type: 'http',
      chainType: 'l1',
      url: 'https://mainnet.base.org',
      accounts: [configVariable('PRIVATE_KEY')],
    },
  },
};

export default config;
