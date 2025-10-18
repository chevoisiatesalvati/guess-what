import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("GuessWhatGameModule", (m) => {
  // Deploy the GuessWhatGame contract with initial owner
  const guessWhatGame = m.contract("GuessWhatGame", [
    "0x970E0306d80732f0e5D641e91E04e00cB72e49FF" // initialOwner
  ]);

  // Return the deployed contract
  return { guessWhatGame };
});
