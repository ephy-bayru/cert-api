import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-etherscan';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@typechain/hardhat';
import * as dotenv from 'dotenv';

dotenv.config();

// Extend the HardhatUserConfig interface
interface ExtendedHardhatUserConfig extends HardhatUserConfig {
  etherscan?: { apiKey: string | undefined };
  typechain?: {
    outDir: string;
    target: string;
  };
}

const config: ExtendedHardhatUserConfig = {
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
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: './src/blockchain/contracts',
    tests: './test/blockchain',
    cache: './cache',
    artifacts: './src/blockchain/artifacts',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
    outputFile: 'gas-report.txt',
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  typechain: {
    outDir: 'src/blockchain/typechain-types',
    target: 'ethers-v5',
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;