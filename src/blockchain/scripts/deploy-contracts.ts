import { ethers } from 'hardhat';
import { Logger } from '@nestjs/common';

const logger = new Logger('DeployContracts');

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    logger.log(`Deploying contracts with the account: ${deployer.address}`);

    const DocumentVerificationFactory = await ethers.getContractFactory(
      'DocumentVerification',
    );
    const documentVerification = await DocumentVerificationFactory.deploy();

    await documentVerification.deployed();

    logger.log(
      `DocumentVerification deployed to: ${documentVerification.address}`,
    );
  } catch (error) {
    logger.error('Failed to deploy contracts', error);
    process.exitCode = 1;
  }
}

main();
