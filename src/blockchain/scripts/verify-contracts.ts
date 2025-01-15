import { run } from 'hardhat';
import { Logger } from '@nestjs/common';

const logger = new Logger('VerifyContracts');

async function main() {
  try {
    // The address from the previous deployment
    const contractAddress = '0xYourDeployedAddress...';

    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: [],
    });

    logger.log('Contract verified successfully');
  } catch (error) {
    logger.error('Failed to verify contract', error);
    process.exitCode = 1;
  }
}

main();
