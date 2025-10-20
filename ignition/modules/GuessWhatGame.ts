import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('GuessWhatGameModule', m => {
  // Deploy the GuessWhatGame contract with initial owner and admin addresses
  const initialOwner = '0x970E0306d80732f0e5D641e91E04e00cB72e49FF';
  const initialAdmins = [
    '0x970E0306d80732f0e5D641e91E04e00cB72e49FF', // Deployer (owner)
    '0x0d25d39f1e7A3368eDe971Eb99D244123E75278D', // mrsaul buggato LOL
    '0x178FBFBFb1146763aEaFcf219ACAB7Cf87Eb617F', // mrsaul2
  ];

  const guessWhatGame = m.contract('GuessWhatGame', [
    initialOwner,
    initialAdmins,
  ]);

  // Return the deployed contract
  return { guessWhatGame };
});
