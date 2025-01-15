import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox'; 
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.27',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    // sepolia: {
    //   url: `https://eth-sepolia.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`,
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
  },
  paths: {
    sources: './src/blockchain/contracts',
    tests: './test/blockchain',
    cache: './cache',
    artifacts: './src/blockchain/artifacts',
  },
  etherscan: {
    // Etherscan or Polygonscan or Etherscan-compatible
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    // Already included by '@nomicfoundation/hardhat-toolbox'
    enabled: !!process.env.REPORT_GAS,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
  },
  typechain: {
    outDir: 'src/blockchain/typechain-types',
    target: 'ethers-v6',
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;
